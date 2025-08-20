import { describe, expect, it, vi, beforeEach } from 'vitest'
import { processUrl } from '../linkProcessor'
import { StorageService } from '../storageService'

// Mock the StorageService
vi.mock('../storageService', () => {
  const mockGetInstance = vi.fn()
  const mockSaveContent = vi.fn()
  const mockGetContentByUrl = vi.fn()

  return {
    StorageService: {
      getInstance: mockGetInstance.mockReturnValue({
        saveContent: mockSaveContent,
        getContentByUrl: mockGetContentByUrl
      })
    }
  }
})

// Mock Anthropic API (for future AI features)
vi.mock('@anthropic-ai/sdk', () => {
  return {
    Anthropic: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{
            text: JSON.stringify({
              contentType: 'Technical Article',
              summary: 'This is an AI-generated summary of the content.',
              metadata: {
                author: 'John Doe',
                publishDate: '2024-03-15',
                primaryCategory: 'Development'
              }
            })
          }]
        })
      }
    }))
  }
})

// Mock the global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock DOMParser
class MockDOMParser {
  parseFromString(text: string, type: string) {
    return {
      title: 'Test Title',
      documentElement: {
        outerHTML: text
      },
      querySelector: (selector: string) => ({
        textContent: 'Test summary paragraph',
        remove: () => {}
      }),
      querySelectorAll: (selector: string) => [{
        remove: () => {}
      }],
      evaluate: () => ({
        snapshotLength: 0,
        snapshotItem: () => null
      })
    }
  }
}
global.DOMParser = MockDOMParser as any

describe('linkProcessor', () => {
  const testUrl = 'https://example.com'
  const testHtml = '<html><body><p>Test content</p></body></html>'
  
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(testHtml)
    })
  })

  describe('processUrl', () => {
    it('should return cached content if it exists', async () => {
      const cachedContent = {
        url: testUrl,
        rawContent: testHtml,
        cleanContent: '<body><p>Test content</p></body>',
        metadata: {
          title: 'Cached Title',
          source: 'example.com',
          contentType: 'Article',
          readingTime: 1,
          wordCount: 2,
          characterCount: testHtml.length
        }
      }

      StorageService.getInstance().getContentByUrl.mockResolvedValue(cachedContent)

      const result = await processUrl(testUrl)
      expect(result.url).toBe(testUrl)
      expect(result.rawContent).toBe(testHtml)
      expect(result.metadata.title).toBe('Cached Title')
      expect(StorageService.getInstance().getContentByUrl).toHaveBeenCalledWith(testUrl)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should process and store new content if not cached', async () => {
      StorageService.getInstance().getContentByUrl.mockResolvedValue(null)
      StorageService.getInstance().saveContent.mockImplementation(input => Promise.resolve({
        ...input,
        id: '1',
        metadata: {
          id: '1',
          contentId: '1',
          ...input.metadata
        }
      }))

      const result = await processUrl(testUrl)
      expect(result.url).toBe(testUrl)
      expect(result.rawContent).toBe(testHtml)
      expect(result.metadata.title).toBe('Test Title')
      expect(result.metadata.source).toBe('example.com')
      expect(StorageService.getInstance().saveContent).toHaveBeenCalled()
    })

    it('should throw error when fetch fails', async () => {
      StorageService.getInstance().getContentByUrl.mockResolvedValue(null)
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      })

      await expect(processUrl(testUrl)).rejects.toThrow('Failed to fetch URL: Not Found')
    })

    it('should handle network errors', async () => {
      StorageService.getInstance().getContentByUrl.mockResolvedValue(null)
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(processUrl(testUrl)).rejects.toThrow('Network error')
    })

    it('should handle storage errors', async () => {
      StorageService.getInstance().getContentByUrl.mockRejectedValue(new Error('Storage error'))

      await expect(processUrl(testUrl)).rejects.toThrow('Storage error')
    })
  })

  describe('content processing', () => {
    it('should calculate correct word count', async () => {
      StorageService.getInstance().getContentByUrl.mockResolvedValue(null)
      const longText = '<html><body><p>This is a test paragraph with multiple words</p></body></html>'
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(longText)
      })

      const result = await processUrl(testUrl)
      expect(result.metadata.wordCount).toBe(8) // "This is a test paragraph with multiple words"
    })

    it('should estimate reading time correctly', async () => {
      StorageService.getInstance().getContentByUrl.mockResolvedValue(null)
      const words = Array(400).fill('word').join(' ') // 400 words
      const longText = `<html><body><p>${words}</p></body></html>`
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(longText)
      })

      const result = await processUrl(testUrl)
      expect(result.metadata.readingTime).toBe(2) // 400 words / 200 words per minute = 2 minutes
    })

    it('should clean HTML content correctly', async () => {
      StorageService.getInstance().getContentByUrl.mockResolvedValue(null)
      const dirtyHtml = '<html><body><script>alert("bad")</script><p>Good content</p><style>.bad{}</style></body></html>'
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(dirtyHtml)
      })

      await processUrl(testUrl)
      expect(StorageService.getInstance().saveContent).toHaveBeenCalledWith(
        expect.objectContaining({
          cleanContent: expect.not.stringContaining('<script>')
        })
      )
    })
  })

  describe('AI-enhanced features', () => {
    it('should use AI for content type classification', async () => {
      StorageService.getInstance().getContentByUrl.mockResolvedValue(null)
      StorageService.getInstance().saveContent.mockImplementation(input => Promise.resolve({
        ...input,
        id: '1',
        metadata: {
          id: '1',
          contentId: '1',
          ...input.metadata
        }
      }))

      const result = await processUrl(testUrl)
      expect(result.metadata.contentType).toBe('Technical Article')
    })

    it('should use AI for metadata extraction', async () => {
      StorageService.getInstance().getContentByUrl.mockResolvedValue(null)

      const result = await processUrl(testUrl)
      expect(result.metadata.author).toBe('John Doe')
      expect(result.metadata.publishDate).toBe('2024-03-15')
      expect(result.metadata.primaryCategory).toBe('Development')
    })

    it('should use AI for content summarization', async () => {
      StorageService.getInstance().getContentByUrl.mockResolvedValue(null)

      const result = await processUrl(testUrl)
      expect(result.summary).toBe('This is an AI-generated summary of the content.')
    })

    it('should handle AI service errors gracefully', async () => {
      StorageService.getInstance().getContentByUrl.mockResolvedValue(null)
      
      // Mock AI service error
      const Anthropic = require('@anthropic-ai/sdk').Anthropic
      Anthropic.mockImplementationOnce(() => ({
        messages: {
          create: vi.fn().mockRejectedValue(new Error('AI service error'))
        }
      }))

      // Should still process content with fallback values when AI fails
      const result = await processUrl(testUrl)
      expect(result.metadata.contentType).toBe('Article') // Fallback value
      expect(result.summary).toBe('Test summary paragraph') // Fallback to basic extraction
    })
  })
}) 