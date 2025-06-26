import { render, screen, fireEvent, waitFor } from '../test/test-utils'
import { vi } from 'vitest'
import App from '../App.jsx'

// Helper from App to compute endpoint
import { getApiEndpoint } from '../App.jsx'

describe('API endpoint selection', () => {
  beforeEach(() => {
    import.meta.env.VITE_API_BASE_URL = 'http://api'
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))
  })

  it('uses /visualize/zip when only ZIP files are uploaded', async () => {
    render(<App />)
    const input = screen.getByLabelText('📎')
    const file = new File(['content'], 'demo.zip', { type: 'application/zip' })
    await fireEvent.change(input, { target: { files: [file] } })
    fireEvent.change(screen.getByPlaceholderText(/How can I help you/i), { target: { value: 'hi' } })
    fireEvent.click(screen.getByRole('button', { name: '→' }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch.mock.calls[0][0]).toBe('http://api/visualize/zip')
  })

  it('uses /process for CSV uploads', async () => {
    render(<App />)
    const input = screen.getByLabelText('📎')
    const file = new File(['data'], 'data.csv', { type: 'text/csv' })
    await fireEvent.change(input, { target: { files: [file] } })
    fireEvent.change(screen.getByPlaceholderText(/How can I help you/i), { target: { value: 'hi' } })
    fireEvent.click(screen.getByRole('button', { name: '→' }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch.mock.calls[0][0]).toBe('http://api/process')
  })
})

// Unit tests for the helper
it('getApiEndpoint returns /visualize/zip when all files zipped', () => {
  const files = [new File(['x'], 'a.zip'), new File(['y'], 'b.zip')]
  expect(getApiEndpoint(files)).toBe('/visualize/zip')
})

it('getApiEndpoint returns /process when mixed files', () => {
  const files = [new File(['x'], 'a.zip'), new File(['y'], 'b.csv')]
  expect(getApiEndpoint(files)).toBe('/process')
})
