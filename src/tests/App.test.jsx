import { screen } from '@testing-library/react'
import { render } from '../test/test-utils'
import App from '../App.jsx'

describe('App', () => {
  it('renders the main title', () => {
    render(<App />)
    expect(screen.getByText(/REPORTMAKER/i)).toBeInTheDocument()
  })
})