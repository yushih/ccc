import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import App from './App'

it('starts the opening conversation with the shipped model configuration after key validation', async () => {
  const fetcher = vi.mocked(fetch)
  fetcher.mockResolvedValueOnce(new Response('{}')).mockResolvedValueOnce(new Response(JSON.stringify({
    status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ message: { html: '<p>Configured opening reply</p>' }, architecture: null }) }] }],
  })))
  const user = userEvent.setup()
  render(<App />)
  await user.type(screen.getByLabelText('API key'), 'fake-key')
  await user.click(screen.getByRole('button', { name: 'Connect to OpenAI' }))
  expect(await screen.findByText('Configured opening reply')).toBeVisible()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(fetcher.mock.calls[0][0]).toBe('https://api.openai.com/v1/models')
  expect(fetcher.mock.calls[1][0]).toBe('https://api.openai.com/v1/responses')
  expect(JSON.parse(String(fetcher.mock.calls[1][1]?.body)).model).toBe(import.meta.env.VITE_OPENAI_MODEL)
  expect(import.meta.env.VITE_OPENAI_MODEL?.trim()).toBeTruthy()
})
