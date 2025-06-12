import { screen, fireEvent } from '@testing-library/react'
import { render } from '../test/test-utils'
import { vi } from 'vitest'
import ExportButton from '../components/ExportButton.jsx'

// Mock heavy browser-only libraries so import succeeds in JSDOM
vi.mock('html2canvas', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue({
    width: 100,
    height: 100,
    toDataURL: vi.fn(),
  }),
}))

vi.mock('jspdf', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: { getWidth: () => 200, getHeight: () => 100 },
    },
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setTextColor: vi.fn(),
    getTextWidth: () => 50,
    text: vi.fn(),
    addImage: vi.fn(),
    save: vi.fn(),
  })),
}))

describe('ExportButton', () => {
  const dummyChart = {
    labels: ['A'],
    datasets: [{ label: 'L', data: [1] }],
    type: 'bar',
  }

  it('opens dropdown on button click and shows export options', () => {
    render(<ExportButton chartData={dummyChart} />)

    // Initially only the main button should be visible
    const mainBtn = screen.getByText(/Export/i)
    fireEvent.click(mainBtn)

    // Dropdown options should now render
    expect(screen.getByText(/CSV Data/i)).toBeInTheDocument()
    expect(screen.getByText(/JSON Data/i)).toBeInTheDocument()
  })
})
