import { render, screen } from '@testing-library/react'
import AppRouter from '../components/AppRouter.jsx'

describe('AppRouter routing', () => {
  it('renders without crashing', () => {
    render(<AppRouter />)
    expect(screen.getByText(/Enter password to access the dashboard/i)).toBeInTheDocument()
  })
})
