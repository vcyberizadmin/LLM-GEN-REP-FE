import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ChatScreen from '../components/ChatScreen.jsx'

// Mock the Bar chart so Chart.js doesn't try to render a real canvas
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart" />
}))

describe('ChatScreen', () => {
  const baseProps = {
    submitted: false,
    response: null,
    chartData: null,
    responseVisible: false,
    setResponseVisible: vi.fn(),
  }

  it('renders View Response button', () => {
    render(<ChatScreen {...baseProps} />)
    expect(screen.getByText(/View Response/i)).toBeInTheDocument()
  })

  it('disables View Response button if not submitted or no response', () => {
    render(<ChatScreen {...baseProps} />)
    expect(screen.getByRole('button', { name: /view response/i })).toBeDisabled()
  })

  it('enables View Response button if submitted and response present', () => {
    render(<ChatScreen {...baseProps} submitted={true} response="Test response" />)
    expect(screen.getByRole('button', { name: /view response/i })).not.toBeDisabled()
  })

  it('shows response and chart when responseVisible and response are true', () => {
    render(<ChatScreen {...baseProps} submitted={true} responseVisible={true} response="Test response" />)
    expect(screen.getByText(/Model Response:/i)).toBeInTheDocument()
    expect(screen.getByText(/Test response/i)).toBeInTheDocument()
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument()
  })
}) 