import { vi, afterEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock fetch globally
global.fetch = vi.fn().mockImplementation(async () => {
  return {
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => '',
    blob: async () => new Blob(),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    headers: new Headers(),
  } as Response
})

// Mock DOMParser globally
class MockDOMParser implements DOMParser {
  parseFromString(text: string, type: DOMParserSupportedType): Document {
    return document.implementation.createHTMLDocument()
  }
}

global.DOMParser = MockDOMParser as typeof DOMParser

// Clear all mocks after each test
afterEach(() => {
  vi.clearAllMocks()
}) 