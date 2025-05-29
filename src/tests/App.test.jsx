import { render, screen } from '@testing-library/react'
import App from '../App.jsx'

describe('App', () => {
  it('renders the main title', () => {
    render(<App />)
    expect(screen.getByText(/LLM-GEN-REPORT/i)).toBeInTheDocument()
  })
  it('renders UploadScreen and ChatScreen', () => {
    render(<App />)
    expect(screen.getByPlaceholderText(/Enter your query here/i)).toBeInTheDocument()
    expect(screen.getByText(/View Response/i)).toBeInTheDocument()
  })
}) 