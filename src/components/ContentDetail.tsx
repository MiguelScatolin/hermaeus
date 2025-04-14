import { Card, Text, Heading, Badge, Flex, Select, Button } from '@radix-ui/themes'
import { StorageService } from '../services/storageService'
import type { ProcessedContent } from '@prisma/client'
import { useState } from 'react'

type ContentWithMetadata = ProcessedContent & {
  metadata: {
    title: string
    author?: string | null
    publishDate?: Date | null
    source: string
    contentType: string
    primaryCategory: string | null
    readingTime: number
    wordCount: number
    characterCount: number
  }
}

interface ContentDetailProps {
  content: ContentWithMetadata
  onClose: () => void
  onStatusChange: (content: ContentWithMetadata) => void
}

export function ContentDetail({ content, onClose, onStatusChange }: ContentDetailProps) {
  const [readingStatus, setReadingStatus] = useState(content.readingStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const storageService = StorageService.getInstance()
      const updatedContent = await storageService.updateContentStatus(content.id, newStatus)
      setReadingStatus(newStatus)
      onStatusChange(updatedContent as ContentWithMetadata)
    } catch (error) {
      console.error('Error updating reading status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Unknown'
    return new Date(date).toLocaleDateString()
  }

  return (
    <Card>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Heading size="5">{content.metadata.title}</Heading>
          <Button onClick={onClose} variant="soft">Close</Button>
        </Flex>

        <Flex gap="4" align="center">
          <Select.Root value={readingStatus} onValueChange={handleStatusChange} disabled={isUpdating}>
            <Select.Trigger placeholder="Reading Status" />
            <Select.Content>
              <Select.Item value="UNREAD">Unread</Select.Item>
              <Select.Item value="IN_PROGRESS">In Progress</Select.Item>
              <Select.Item value="READ">Read</Select.Item>
            </Select.Content>
          </Select.Root>

          <Badge color="gray">
            {content.metadata.contentType}
            {content.metadata.primaryCategory && ` • ${content.metadata.primaryCategory}`}
          </Badge>
        </Flex>

        <Card variant="surface">
          <Flex direction="column" gap="2">
            <Text as="p">
              <strong>Source:</strong> {content.metadata.source}
            </Text>
            {content.metadata.author && (
              <Text as="p">
                <strong>Author:</strong> {content.metadata.author}
              </Text>
            )}
            <Text as="p">
              <strong>Published:</strong> {formatDate(content.metadata.publishDate)}
            </Text>
            <Text as="p">
              <strong>Reading Time:</strong> {content.metadata.readingTime} minutes
            </Text>
            <Text as="p">
              <strong>Word Count:</strong> {content.metadata.wordCount}
            </Text>
          </Flex>
        </Card>

        <Card variant="surface">
          <div 
            dangerouslySetInnerHTML={{ __html: content.cleanContent }}
            style={{ maxHeight: '60vh', overflow: 'auto' }}
          />
        </Card>
      </Flex>
    </Card>
  )
} 