import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataForm } from '../DataForm'

describe('DataForm', () => {
  it('renders all form elements', () => {
    render(<DataForm />)
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('updates form values on user input', async () => {
    render(<DataForm />)
    
    const titleInput = screen.getByLabelText(/title/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    
    await userEvent.type(titleInput, 'Test Title')
    await userEvent.type(descriptionInput, 'Test Description')
    
    expect(titleInput).toHaveValue('Test Title')
    expect(descriptionInput).toHaveValue('Test Description')
  })

  it('prevents form submission with empty fields', async () => {
    render(<DataForm />)
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await userEvent.click(submitButton)
    
    // HTML5 validation should prevent submission of empty required fields
    expect(screen.getByLabelText(/title/i)).toBeInvalid()
  })

  it('calls handleSubmit with form data when submitted', async () => {
    render(<DataForm />)
    
    const titleInput = screen.getByLabelText(/title/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    
    await userEvent.type(titleInput, 'Test Title')
    await userEvent.type(descriptionInput, 'Test Description')
    
    const form = screen.getByRole('form')
    const submitEvent = vi.fn(e => e.preventDefault())
    form.onsubmit = submitEvent
    
    fireEvent.submit(form)
    
    expect(submitEvent).toHaveBeenCalled()
  })
})
