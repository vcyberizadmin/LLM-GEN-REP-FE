import { defineConfig } from '@playwright/test'

// Allow overriding preview URL from CI (e.g. Netlify Preview / Vercel Preview)
// e.g. PLAYWRIGHT_BASE_URL=https://frontend-preview-1234.vercel.app npx playwright test
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173'

export default defineConfig({
  // Discover tests anywhere ending with .spec.
  testDir: '.',
  testMatch: ['**/*.pw.spec.ts'],
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],
  // Automatically launch dev server for local smoke run
  webServer: {
    command: 'npm run dev -- --port 4173',
    port: 4173,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
})
