import { test, expect } from '@playwright/test'
import { AUTH_CONFIG } from './src/config/auth'

test('preview smoke: login to dashboard', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
  await page.getByPlaceholder('Enter your password').fill(AUTH_CONFIG.password)
  await page.getByRole('button', { name: /access dashboard/i }).click()

  await expect(page.getByRole('heading', { name: /reportmaker/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /history/i })).toBeVisible()
})
