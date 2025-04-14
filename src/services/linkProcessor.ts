import { StorageService, SaveContentInput } from './storageService'

export interface ProcessedContent {
  url: string
  rawContent: string
  metadata: {
    title: string
    author?: string
    publishDate?: string
    source: string
    contentType: string
    primaryCategory?: string
    readingTime: number
    wordCount: number
    characterCount: number
  }
  summary: string
}

interface Metadata {
  title: string
  author?: string
  publishDate?: string
  source: string
  contentType: string
  primaryCategory?: string
  readingTime: number
  wordCount: number
  characterCount: number
}

export async function processUrl(url: string): Promise<ProcessedContent> {
  try {
    // Check if content already exists in storage
    const storageService = StorageService.getInstance()
    const existingContent = await storageService.getContentByUrl(url)
    
    if (existingContent) {
      return {
        url: existingContent.url,
        rawContent: existingContent.rawContent,
        metadata: {
          title: existingContent.metadata!.title,
          author: existingContent.metadata!.author || undefined,
          publishDate: existingContent.metadata!.publishDate?.toISOString(),
          source: existingContent.metadata!.source,
          contentType: existingContent.metadata!.contentType,
          primaryCategory: existingContent.metadata!.primaryCategory || undefined,
          readingTime: existingContent.metadata!.readingTime,
          wordCount: existingContent.metadata!.wordCount,
          characterCount: existingContent.metadata!.characterCount
        },
        summary: extractBasicSummary(new DOMParser().parseFromString(existingContent.cleanContent, 'text/html'))
      }
    }

    // Fetch the content
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }
    const html = await response.text()

    // Extract metadata using basic parsing for now
    // TODO: Enhance with AI-powered extraction
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    const cleanContent = cleanHtml(doc)
    const metadata: Metadata = {
      title: doc.title || 'Untitled',
      source: new URL(url).hostname,
      contentType: 'Article', // Default type, will be enhanced with AI
      readingTime: estimateReadingTime(html),
      wordCount: countWords(html),
      characterCount: html.length
    }

    // Generate a basic summary
    // TODO: Enhance with AI-powered summarization
    const summary = extractBasicSummary(doc)

    // Save to storage
    await storageService.saveContent({
      url,
      rawContent: html,
      cleanContent,
      metadata: {
        ...metadata,
        publishDate: metadata.publishDate ? new Date(metadata.publishDate) : null
      }
    })

    return {
      url,
      rawContent: html,
      metadata,
      summary
    }
  } catch (error) {
    console.error('Error processing URL:', error)
    throw error
  }
}

function cleanHtml(doc: Document): string {
  // Remove script tags
  doc.querySelectorAll('script').forEach(el => el.remove())
  // Remove style tags
  doc.querySelectorAll('style').forEach(el => el.remove())
  // Remove comments
  const commentNodes = doc.evaluate('//comment()', doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null)
  for (let i = 0; i < commentNodes.snapshotLength; i++) {
    const node = commentNodes.snapshotItem(i)
    node?.parentNode?.removeChild(node)
  }
  return doc.documentElement.outerHTML
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = countWords(content)
  return Math.ceil(wordCount / wordsPerMinute)
}

function countWords(content: string): number {
  // Remove HTML tags and count words
  const text = content.replace(/<[^>]*>/g, '')
  return text.trim().split(/\s+/).length
}

function extractBasicSummary(doc: Document): string {
  // Try to find the first paragraph or meaningful content
  const firstParagraph = doc.querySelector('p')
  if (firstParagraph) {
    return firstParagraph.textContent?.trim() || 'No summary available'
  }
  return 'No summary available'
}
