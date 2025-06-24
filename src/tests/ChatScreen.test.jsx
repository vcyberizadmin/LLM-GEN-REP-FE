import { screen, fireEvent } from '@testing-library/react'
import { render } from '../test/test-utils'
import { vi } from 'vitest'
import ChatScreen from '../components/ChatScreen.jsx'

// Mock all chart components
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart" />,
  Pie: () => <div data-testid="mock-pie-chart" />,
  Line: () => <div data-testid="mock-line-chart" />,
  Doughnut: () => <div data-testid="mock-doughnut-chart" />,
  Scatter: () => <div data-testid="mock-scatter-chart" />
}))

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn()

describe('ChatScreen', () => {
  const baseProps = {
    submitted: false,
    response: null,
    chartData: null,
    responseVisible: false,
    setResponseVisible: vi.fn(),
  }

  it('renders the response section when response is present', () => {
    render(<ChatScreen {...baseProps} submitted={true} response="Test response" />)
    expect(screen.getByText(/Model Response:/i)).toBeInTheDocument()
    expect(screen.getByText(/Test response/i)).toBeInTheDocument()
  })

  it('shows loading state when loading is true', () => {
    render(<ChatScreen {...baseProps} loading={true} />)
    expect(screen.getByText(/Thinking/i)).toBeInTheDocument()
  })

  it('shows follow-up input when response is present', () => {
    render(<ChatScreen {...baseProps} submitted={true} response="Test response" />)
    expect(screen.getByPlaceholderText(/Ask a follow-up question/i)).toBeInTheDocument()
  })

  it('shows response and chart only when visualization is requested', () => {
    const mockChartData = {
      labels: ['A', 'B', 'C'],
      datasets: [{
        label: 'Test Dataset',
        data: [1, 2, 3],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      }]
    }

    render(
      <ChatScreen
        {...baseProps}
        submitted={true}
        responseVisible={true}
        response="Test response"
        chartData={mockChartData}
      />
    )
    
    expect(screen.getByText(/Model Response:/i)).toBeInTheDocument()
    expect(screen.getByText(/Test response/i)).toBeInTheDocument()
    expect(screen.queryByTestId('mock-pie-chart')).not.toBeInTheDocument()
    const showBtn = screen.getByRole('button', { name: /show visualization/i })
    fireEvent.click(showBtn)
  })

   it('sanitizes markdown output by stripping script tags', () => {
    const malicious = 'Hello <script id="bad">alert(1)</script>'
    render(
      <ChatScreen
        {...baseProps}
        submitted={true}
        response={malicious}
      />
    )

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(document.querySelector('#bad')).toBeNull()
  })
}) 
