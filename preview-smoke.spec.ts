import { test, expect } from '@playwright/test'
import { AUTH_CONFIG } from './src/config/auth'

test.describe('Preview smoke', () => {
  test('login then dashboard renders', async ({ page }) => {
    // baseURL comes from playwright.config or CLI
    await page.goto('/')

    // Expect login page prompt
    await expect(page.getByRole('heading', { name: /secure access/i })).toBeVisible()

    // Perform login
    await page.getByPlaceholder('Enter your password').fill(AUTH_CONFIG.password)
    await page.getByRole('button', { name: /access dashboard/i }).click()

    // Verify dashboard UI elements
    await expect(page.getByRole('heading', { name: /reportmaker/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /history/i })).toBeVisible()
  })
}).meta({ needs: '.pw.spec.ts' })
