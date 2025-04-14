import { test, expect } from '@playwright/test'

test.describe('Link Processing', () => {
  test('should process and display content from a URL', async ({ page }) => {
    // Navigate to the app
    await page.goto('/')

    // Find and fill the URL input
    const urlInput = page.getByPlaceholder('Enter URL')
    await urlInput.fill('https://example.com')

    // Click the process button
    const processButton = page.getByRole('button', { name: 'Process URL' })
    await processButton.click()

    // Wait for the content to be processed and displayed
    await expect(page.getByTestId('content-title')).toBeVisible()
    await expect(page.getByTestId('content-metadata')).toBeVisible()
    await expect(page.getByTestId('content-summary')).toBeVisible()

    // Verify the content is displayed correctly
    const title = await page.getByTestId('content-title').textContent()
    expect(title).toBeTruthy()

    // Verify metadata is displayed
    const metadata = page.getByTestId('content-metadata')
    await expect(metadata.getByText(/Reading time:/)).toBeVisible()
    await expect(metadata.getByText(/Word count:/)).toBeVisible()
    await expect(metadata.getByText(/Source:/)).toBeVisible()

    // Verify the content is saved (appears in the content list)
    const contentList = page.getByTestId('content-list')
    await expect(contentList.getByText(title!)).toBeVisible()
  })

  test('should handle invalid URLs', async ({ page }) => {
    await page.goto('/')

    // Try to process an invalid URL
    const urlInput = page.getByPlaceholder('Enter URL')
    await urlInput.fill('not-a-valid-url')

    const processButton = page.getByRole('button', { name: 'Process URL' })
    await processButton.click()

    // Verify error message is displayed
    await expect(page.getByText(/Invalid URL/)).toBeVisible()
  })

  test('should handle network errors', async ({ page }) => {
    await page.goto('/')

    // Try to process a URL that will fail
    const urlInput = page.getByPlaceholder('Enter URL')
    await urlInput.fill('https://non-existent-domain.com')

    const processButton = page.getByRole('button', { name: 'Process URL' })
    await processButton.click()

    // Verify error message is displayed
    await expect(page.getByText(/Failed to fetch URL/)).toBeVisible()
  })

  test('should cache and reuse processed content', async ({ page }) => {
    await page.goto('/')

    // Process a URL first time
    const urlInput = page.getByPlaceholder('Enter URL')
    await urlInput.fill('https://example.com')

    const processButton = page.getByRole('button', { name: 'Process URL' })
    await processButton.click()

    // Wait for processing to complete
    await expect(page.getByTestId('content-title')).toBeVisible()

    // Process the same URL again
    await urlInput.clear()
    await urlInput.fill('https://example.com')
    await processButton.click()

    // Verify content is loaded instantly (no loading state)
    await expect(page.getByTestId('loading-indicator')).not.toBeVisible()
    await expect(page.getByTestId('content-title')).toBeVisible()
  })
}) 