import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { LinkInput } from './components/LinkInput'
import { Container, Heading, Card, Text } from '@radix-ui/themes'
import { useState } from 'react'
import type { ProcessedContent } from './services/linkProcessor'

function App() {
  const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <Theme>
      <Container size="2" p="4">
        <Heading size="6" mb="4">Hermaeus</Heading>
        <Card>
          <LinkInput 
            onProcessed={setProcessedContent}
            onError={(error) => setError(error.message)}
          />
          
          {error && (
            <Text color="red" mt="4">
              {error}
            </Text>
          )}

          {processedContent && (
            <div style={{ marginTop: '2rem' }}>
              <Heading size="4" mb="2">Processed Content</Heading>
              <Card>
                <Text as="p" mb="2">
                  <strong>Title:</strong> {processedContent.metadata.title}
                </Text>
                <Text as="p" mb="2">
                  <strong>Source:</strong> {processedContent.metadata.source}
                </Text>
                <Text as="p" mb="2">
                  <strong>Reading Time:</strong> {processedContent.metadata.readingTime} minutes
                </Text>
                <Text as="p" mb="2">
                  <strong>Word Count:</strong> {processedContent.metadata.wordCount}
                </Text>
                <Text as="p" mb="4">
                  <strong>Summary:</strong>
                </Text>
                <Card variant="surface">
                  <Text as="p">
                    {processedContent.summary}
                  </Text>
                </Card>
              </Card>
            </div>
          )}
        </Card>
      </Container>
    </Theme>
  )
}

export default App
