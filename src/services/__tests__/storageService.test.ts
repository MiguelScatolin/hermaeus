import { StorageService } from '../storageService'
import { PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, vi, afterAll } from 'vitest'

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  const mockCreate = vi.fn()
  const mockFindUnique = vi.fn()
  const mockFindMany = vi.fn()
  const mockDelete = vi.fn()
  const mockDisconnect = vi.fn()

  return {
    PrismaClient: vi.fn().mockImplementation(() => ({
      processedContent: {
        create: mockCreate,
        findUnique: mockFindUnique,
        findMany: mockFindMany,
        delete: mockDelete
      },
      $disconnect: mockDisconnect
    }))
  }
})

describe('StorageService', () => {
  let storageService: StorageService
  const mockContent = {
    url: 'https://example.com',
    rawContent: '<html><body>Test content</body></html>',
    cleanContent: '<body>Test content</body>',
    metadata: {
      title: 'Test Page',
      source: 'example.com',
      contentType: 'Article',
      readingTime: 1,
      wordCount: 2,
      characterCount: 12
    }
  }

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    storageService = StorageService.getInstance()
  })

  afterAll(async () => {
    await storageService.disconnect()
  })

  describe('saveContent', () => {
    it('should save content successfully', async () => {
      const prismaClient = new PrismaClient()
      const expectedResult = { id: '1', ...mockContent }
      prismaClient.processedContent.create.mockResolvedValue(expectedResult)

      const result = await storageService.saveContent(mockContent)
      expect(result).toEqual(expectedResult)
      expect(prismaClient.processedContent.create).toHaveBeenCalledWith({
        data: {
          url: mockContent.url,
          rawContent: mockContent.rawContent,
          cleanContent: mockContent.cleanContent,
          metadata: {
            create: mockContent.metadata
          }
        },
        include: {
          metadata: true
        }
      })
    })

    it('should throw error when save fails', async () => {
      const prismaClient = new PrismaClient()
      prismaClient.processedContent.create.mockRejectedValue(new Error('Database error'))

      await expect(storageService.saveContent(mockContent)).rejects.toThrow('Failed to save content to database')
    })
  })

  describe('getContentByUrl', () => {
    it('should retrieve content by URL', async () => {
      const prismaClient = new PrismaClient()
      const expectedResult = { id: '1', ...mockContent }
      prismaClient.processedContent.findUnique.mockResolvedValue(expectedResult)

      const result = await storageService.getContentByUrl(mockContent.url)
      expect(result).toEqual(expectedResult)
      expect(prismaClient.processedContent.findUnique).toHaveBeenCalledWith({
        where: { url: mockContent.url },
        include: { metadata: true }
      })
    })

    it('should return null when content not found', async () => {
      const prismaClient = new PrismaClient()
      prismaClient.processedContent.findUnique.mockResolvedValue(null)

      const result = await storageService.getContentByUrl('nonexistent-url')
      expect(result).toBeNull()
    })

    it('should throw error when retrieval fails', async () => {
      const prismaClient = new PrismaClient()
      prismaClient.processedContent.findUnique.mockRejectedValue(new Error('Database error'))

      await expect(storageService.getContentByUrl(mockContent.url)).rejects.toThrow('Failed to retrieve content from database')
    })
  })

  describe('getAllContent', () => {
    it('should retrieve all content', async () => {
      const prismaClient = new PrismaClient()
      const expectedResults = [{ id: '1', ...mockContent }, { id: '2', ...mockContent }]
      prismaClient.processedContent.findMany.mockResolvedValue(expectedResults)

      const results = await storageService.getAllContent()
      expect(results).toEqual(expectedResults)
      expect(prismaClient.processedContent.findMany).toHaveBeenCalledWith({
        include: { metadata: true }
      })
    })

    it('should throw error when retrieval fails', async () => {
      const prismaClient = new PrismaClient()
      prismaClient.processedContent.findMany.mockRejectedValue(new Error('Database error'))

      await expect(storageService.getAllContent()).rejects.toThrow('Failed to retrieve content from database')
    })
  })

  describe('deleteContent', () => {
    it('should delete content by URL', async () => {
      const prismaClient = new PrismaClient()
      prismaClient.processedContent.delete.mockResolvedValue(undefined)

      await storageService.deleteContent(mockContent.url)
      expect(prismaClient.processedContent.delete).toHaveBeenCalledWith({
        where: { url: mockContent.url }
      })
    })

    it('should throw error when deletion fails', async () => {
      const prismaClient = new PrismaClient()
      prismaClient.processedContent.delete.mockRejectedValue(new Error('Database error'))

      await expect(storageService.deleteContent(mockContent.url)).rejects.toThrow('Failed to delete content from database')
    })
  })
}) 