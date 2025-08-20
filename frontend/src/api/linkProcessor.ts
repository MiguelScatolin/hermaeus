import { processUrl } from '../services/linkProcessor'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body || !body.url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    const result = await processUrl(body.url)
    
    // Ensure the result is properly serialized
    const serializedResult = {
      ...result,
      metadata: {
        ...result.metadata,
        publishDate: result.metadata.publishDate?.toString() // Convert Date to string if present
      }
    }

    return new Response(JSON.stringify(serializedResult), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error processing URL:', error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to process URL'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
} 