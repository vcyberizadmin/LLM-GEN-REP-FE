import { test, expect } from '@playwright/test'

// Performance budget (ms)
const MAX_LOAD_TIME = 4000

// Security headers we expect (basic)
const EXPECTED_HEADERS: Record<string, RegExp> = {
  'x-content-type-options': /nosniff/i,
  // allow partial match for CSP
  'content-security-policy': /.{10,}/i,
}

test('perf/security: page load budget & headers', async ({ page }) => {
  // Capture response for root navigation
  const [response] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/') && r.request().method() === 'GET'),
    page.goto('/')
  ])

  // 1. Performance window.timing
  const perf = await page.evaluate(() => {
    const { navigationStart, loadEventEnd } = performance.timing
    return loadEventEnd && navigationStart ? loadEventEnd - navigationStart : 0
  })
  console.log('Page load time:', perf, 'ms')
  expect(perf).toBeLessThan(MAX_LOAD_TIME)

  // 2. Security header hints (non-fatal)
  const headers = response.headers()
  for (const [key, pattern] of Object.entries(EXPECTED_HEADERS)) {
    if (headers[key]) {
      expect(headers[key]).toMatch(pattern)
    }
  }
})
