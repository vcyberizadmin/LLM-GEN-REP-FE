import { screen, fireEvent } from '@testing-library/react'
import { render } from '../test/test-utils'
import { vi } from 'vitest'
import HistoryDropdown from '../components/HistoryDropdown.jsx'

describe('HistoryDropdown', () => {
  const history = [
    { id: '1', title: 'First', timestamp: Date.now() },
    { id: '2', title: 'Second', timestamp: Date.now() },
  ]
  it('opens and selects an item', () => {
    const onSelect = vi.fn()
    render(<HistoryDropdown history={history} onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('button', { name: /history/i }))
    // Dropdown entries rendered
    fireEvent.click(screen.getByText(/First/i))
    expect(onSelect).toHaveBeenCalledWith('1')
  })
})
