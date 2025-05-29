import { expect, test } from 'vitest'
import { createRoot } from 'react-dom/client'

// Smoke test for index.js

test('renders App without crashing', () => {
  const div = document.createElement('div')
  document.body.appendChild(div)
  expect(() => {
    createRoot(div)
  }).not.toThrow()
  document.body.removeChild(div)
}) 