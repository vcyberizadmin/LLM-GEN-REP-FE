import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import UploadScreen from '../components/UploadScreen.jsx'

describe('UploadScreen', () => {
  const baseProps = {
    selectedFiles: [],
    onFileChange: vi.fn(),
    query: '',
    onQueryChange: vi.fn(),
    onSubmit: vi.fn(),
    submitting: false,
    error: null,
  }

  it('renders file upload area and query box', () => {
    render(<UploadScreen {...baseProps} />)
    expect(screen.getByText(/Drag & drop file\(s\) here/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter your query here/i)).toBeInTheDocument()
  })

  it('disables submit button if no file or query', () => {
    render(<UploadScreen {...baseProps} />)
    expect(screen.getByRole('button', { name: /submit query/i })).toBeDisabled()
  })

  it('enables submit button if file and query are present', () => {
    render(<UploadScreen {...baseProps} selectedFiles={[{ name: 'test.csv' }]} query="test query" />)
    expect(screen.getByRole('button', { name: /submit query/i })).not.toBeDisabled()
  })

  it('shows selected file name if file is present', () => {
    render(<UploadScreen {...baseProps} selectedFiles={[{ name: 'test.csv' }]} />)
    expect(screen.getByText(/test.csv/i)).toBeInTheDocument()
  })

  it('shows error message if error prop is set', () => {
    render(<UploadScreen {...baseProps} error="Something went wrong" />)
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
  })
}) 