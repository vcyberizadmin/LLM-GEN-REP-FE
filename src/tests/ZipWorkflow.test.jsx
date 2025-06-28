import { render, screen, fireEvent } from '../test/test-utils'
import { vi } from 'vitest'
import ChatScreen from '../components/ChatScreen.jsx'

// Basic test to ensure ZIP workflow button renders and triggers callback

describe('ZIP workflow', () => {
  it('shows Generate Slides button when zip file is attached', () => {
    const onZipVisualize = vi.fn()
    render(
      <ChatScreen
        submitted
        response="ok"
        chartData={null}
        responseVisible
        setResponseVisible={() => {}}
        onZipVisualize={onZipVisualize}
        zipSlides={[]}
        currentFiles={[{ name: 'demo.zip' }]}
      />
    )

    const btn = screen.getByRole('button', { name: /generate slides/i })
    fireEvent.click(btn)
    expect(onZipVisualize).toHaveBeenCalled()
  })
})
