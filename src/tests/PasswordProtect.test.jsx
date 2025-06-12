import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PasswordProtect from '../components/PasswordProtect.jsx'
import { AUTH_CONFIG } from '../config/auth'
import { MemoryRouter } from 'react-router-dom'

const customRender = (ui) => {
  return render(ui, {
    wrapper: ({ children }) => <MemoryRouter initialEntries={["/login"]}>{children}</MemoryRouter>,
  })
}

describe('PasswordProtect', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('authenticates with correct password', async () => {
    customRender(<PasswordProtect />)

    const input = screen.getByPlaceholderText(/enter your password/i)
    await userEvent.type(input, AUTH_CONFIG.password)
    await userEvent.click(screen.getByRole('button', { name: /access dashboard/i }))

    // localStorage set async after simulated delay in component
    await waitFor(() => {
      expect(localStorage.getItem('isAuthenticated')).toBe('true')
    })
  })
})
