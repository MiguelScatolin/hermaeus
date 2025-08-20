import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface SaveContentInput {
  url: string
  rawContent: string
  cleanContent: string
  metadata: {
    title: string
    author?: string | null
    publishDate?: Date | null
    source: string
    contentType: string
    primaryCategory?: string | null
    readingTime: number
    wordCount: number
    characterCount: number
  }
}

export interface ContentWithMetadata {
  id: string
  url: string
  rawContent: string
  cleanContent: string
  createdAt: Date
  updatedAt: Date
  readingStatus: string
  metadata: {
    id: string
    title: string
    author: string | null
    publishDate: Date | null
    source: string
    contentType: string
    primaryCategory: string | null
    readingTime: number
    wordCount: number
    characterCount: number
    contentId: string
  } | null
}

export class StorageService {
  private static instance: StorageService
  private prisma: PrismaClient

  private constructor() {
    this.prisma = prisma
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  async saveContent(input: SaveContentInput): Promise<ContentWithMetadata> {
    try {
      const result = await this.prisma.processedContent.create({
        data: {
          url: input.url,
          rawContent: input.rawContent,
          cleanContent: input.cleanContent,
          metadata: {
            create: input.metadata
          }
        },
        include: {
          metadata: true
        }
      })
      return result as ContentWithMetadata
    } catch (error) {
      console.error('Error saving content:', error)
      throw new Error('Failed to save content to database')
    }
  }

  async getContentByUrl(url: string): Promise<ContentWithMetadata | null> {
    try {
      const result = await this.prisma.processedContent.findUnique({
        where: { url },
        include: {
          metadata: true
        }
      })
      return result as ContentWithMetadata | null
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === 'PrismaClientKnownRequestError' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        return null
      }
      console.error('Error retrieving content:', error)
      throw new Error('Failed to retrieve content from database')
    }
  }

  async getAllContent(): Promise<ContentWithMetadata[]> {
    try {
      const results = await this.prisma.processedContent.findMany({
        include: {
          metadata: true
        }
      })
      return results as ContentWithMetadata[]
    } catch (error) {
      console.error('Error retrieving all content:', error)
      throw new Error('Failed to retrieve content from database')
    }
  }

  async updateContentStatus(id: string, readingStatus: string): Promise<ContentWithMetadata> {
    try {
      const result = await this.prisma.processedContent.update({
        where: { id },
        data: { readingStatus },
        include: {
          metadata: true
        }
      })
      return result as ContentWithMetadata
    } catch (error) {
      console.error('Error updating content status:', error)
      throw new Error('Failed to update content status')
    }
  }

  async deleteContent(url: string): Promise<void> {
    try {
      await this.prisma.processedContent.delete({
        where: { url }
      })
    } catch (error) {
      console.error('Error deleting content:', error)
      throw new Error('Failed to delete content from database')
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
  }
} 