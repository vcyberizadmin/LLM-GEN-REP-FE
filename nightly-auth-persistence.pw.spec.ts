import { test, expect } from '@playwright/test'
import { AUTH_CONFIG } from './src/config/auth'

// Nightly production test – verifies that authentication persists across reloads

test('nightly: auth persists after reload', async ({ page, context }) => {
  await page.goto('/')

  // Login flow
  await page.getByPlaceholder('Enter your password').fill(AUTH_CONFIG.password)
  await page.getByRole('button', { name: /access dashboard/i }).click()
  await expect(page.getByRole('heading', { name: /reportmaker/i })).toBeVisible()

  // Hard reload page
  await page.reload()

  // Should stay authenticated (dashboard still visible, not redirected to login)
  await expect(page.getByRole('heading', { name: /reportmaker/i })).toBeVisible()
})
