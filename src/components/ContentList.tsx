import { useState, useEffect } from 'react'
import { Card, Text, Select, Flex, Badge, Table } from '@radix-ui/themes'
import { StorageService } from '../services/storageService'
import type { ProcessedContent } from '@prisma/client'

type ContentWithMetadata = ProcessedContent & {
  metadata: {
    title: string
    source: string
    contentType: string
    primaryCategory: string | null
    readingTime: number
  }
}

interface ContentListProps {
  onContentSelect: (content: ContentWithMetadata) => void
}

export function ContentList({ onContentSelect }: ContentListProps) {
  const [content, setContent] = useState<ContentWithMetadata[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentWithMetadata[]>([])
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Get unique content types and categories for filter options
  const contentTypes = Array.from(new Set(content.map(c => c.metadata.contentType)))
  const categories = Array.from(new Set(content.map(c => c.metadata.primaryCategory).filter(Boolean)))

  useEffect(() => {
    const loadContent = async () => {
      try {
        const storageService = StorageService.getInstance()
        const allContent = await storageService.getAllContent()
        setContent(allContent as ContentWithMetadata[])
        setFilteredContent(allContent as ContentWithMetadata[])
      } catch (error) {
        console.error('Error loading content:', error)
      }
    }

    loadContent()
  }, [])

  useEffect(() => {
    let filtered = content

    if (contentTypeFilter !== 'all') {
      filtered = filtered.filter(c => c.metadata.contentType === contentTypeFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.metadata.primaryCategory === categoryFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.readingStatus === statusFilter)
    }

    setFilteredContent(filtered)
  }, [content, contentTypeFilter, categoryFilter, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNREAD':
        return 'gray'
      case 'IN_PROGRESS':
        return 'blue'
      case 'READ':
        return 'green'
      default:
        return 'gray'
    }
  }

  return (
    <Card>
      <Flex direction="column" gap="4">
        <Flex gap="4">
          <Select.Root value={contentTypeFilter} onValueChange={setContentTypeFilter}>
            <Select.Trigger placeholder="Filter by type" />
            <Select.Content>
              <Select.Item value="all">All Types</Select.Item>
              {contentTypes.map(type => (
                <Select.Item key={type} value={type}>{type}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Select.Root value={categoryFilter} onValueChange={setCategoryFilter}>
            <Select.Trigger placeholder="Filter by category" />
            <Select.Content>
              <Select.Item value="all">All Categories</Select.Item>
              {categories.map(category => (
                <Select.Item key={category} value={category}>{category}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
            <Select.Trigger placeholder="Filter by status" />
            <Select.Content>
              <Select.Item value="all">All Statuses</Select.Item>
              <Select.Item value="UNREAD">Unread</Select.Item>
              <Select.Item value="IN_PROGRESS">In Progress</Select.Item>
              <Select.Item value="READ">Read</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Reading Time</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {filteredContent.map(item => (
              <Table.Row 
                key={item.id} 
                onClick={() => onContentSelect(item)}
                style={{ cursor: 'pointer' }}
              >
                <Table.Cell>
                  <Text size="2" weight="medium">{item.metadata.title}</Text>
                  <Text size="1" color="gray">{item.metadata.source}</Text>
                </Table.Cell>
                <Table.Cell>{item.metadata.contentType}</Table.Cell>
                <Table.Cell>{item.metadata.primaryCategory || '-'}</Table.Cell>
                <Table.Cell>{item.metadata.readingTime} min</Table.Cell>
                <Table.Cell>
                  <Badge color={getStatusColor(item.readingStatus)}>
                    {item.readingStatus.replace('_', ' ')}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {filteredContent.length === 0 && (
          <Text align="center" color="gray">
            No content found matching the selected filters
          </Text>
        )}
      </Flex>
    </Card>
  )
} 