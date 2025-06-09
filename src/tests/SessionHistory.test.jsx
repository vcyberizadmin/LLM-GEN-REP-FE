import { screen, fireEvent } from '@testing-library/react'
import { render } from '../test/test-utils'
import SessionHistory from '../components/SessionHistory.jsx'

// Simplify fetch via global mock
const mockSessions = [
  { id: '1', created_at: new Date().toISOString(), chart_type: 'bar', query: 'q', chart_data: { datasets: [], labels: [] } },
]

global.fetch = vi.fn((url) => {
  if (url.endsWith('/sessions')) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ sessions: mockSessions }) })
  }
  if (url.includes('/session/')) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ visualizations: [] }) })
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
})

describe('SessionHistory', () => {
  it('renders fetched sessions', async () => {
    render(<SessionHistory onClose={() => {}} onSessionSelect={() => {}} />)

    // Wait for session item
    const title = await screen.findByText(/Session 1/i, {}, { timeout: 2000 })
    expect(title).toBeInTheDocument()

    // Close overlay
    fireEvent.click(screen.getByRole('button', { name: /✕/i }))
  })
})
