import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'
describe('initial setup', () => {
  it('shows provider/key setup and an empty architecture, but no composer', () => {
    render(<App />)
    expect(screen.getByLabelText('Model provider')).toHaveValue('openai')
    expect(screen.getByLabelText('API key')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Connect to OpenAI' })).toBeVisible()
    expect(screen.getByText('Your architecture starts here')).toBeVisible()
    expect(screen.queryByLabelText('Message')).not.toBeInTheDocument()
  })
})

import userEvent from '@testing-library/user-event'
import { act } from '@testing-library/react'
import { Effect } from 'effect'
import { vi } from 'vitest'
import type { Provider, TurnResult } from '../providers/types'
import { error } from '../providers/errors'
const fake = (): Provider => ({ validateCredentials: vi.fn(() => Effect.void), sendTurn: vi.fn(() => Effect.succeed({ text: 'What are your recovery requirements?', architecture: null })) })
async function connect(provider = fake()) {
  const user = userEvent.setup()
  const view = render(<App provider={provider} />)
  await user.type(screen.getByLabelText('API key'), '  fake-key  ')
  await user.click(screen.getByRole('button', { name: 'Connect to OpenAI' }))
  await screen.findByLabelText('Message')
  return { user, provider, ...view }
}
describe('setup and conversation lifecycle', () => {
  it('rejects blank keys without contacting the provider', async () => {
    const provider = fake(); render(<App provider={provider} />)
    await userEvent.click(screen.getByRole('button', { name: 'Connect to OpenAI' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter an API key')
    expect(provider.validateCredentials).not.toHaveBeenCalled()
  })
  it('trims credentials, moves focus to chat, and disconnects cleanly', async () => {
    const { user, provider } = await connect()
    expect(provider.validateCredentials).toHaveBeenCalledWith('fake-key')
    expect(screen.getByLabelText('Message')).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Disconnect' }))
    expect(screen.getByLabelText('API key')).toHaveValue('')
    expect(screen.queryByLabelText('Message')).not.toBeInTheDocument()
    expect(localStorage.length).toBe(0); expect(sessionStorage.length).toBe(0)
  })
  it('keeps setup on validation failure and allows retry', async () => {
    const provider = fake()
    vi.mocked(provider.validateCredentials).mockReturnValueOnce(Effect.fail(error('authentication', 'Check this key')))
    const user = userEvent.setup(); render(<App provider={provider} />)
    await user.type(screen.getByLabelText('API key'), 'fake')
    await user.click(screen.getByRole('button', { name: 'Connect to OpenAI' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Check this key')
    expect(screen.queryByLabelText('Message')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Connect to OpenAI' }))
    expect(await screen.findByLabelText('Message')).toBeVisible()
  })
  it('disables duplicate validation and ignores a canceled validation result', async () => {
    let resolve!: () => void
    const provider = fake()
    vi.mocked(provider.validateCredentials).mockReturnValue(Effect.tryPromise({ try: () => new Promise<void>(r => { resolve = r }), catch: () => error('network', 'Failed') }))
    const user = userEvent.setup(); render(<App provider={provider} />)
    await user.type(screen.getByLabelText('API key'), 'fake')
    await user.click(screen.getByRole('button', { name: 'Connect to OpenAI' }))
    expect(screen.getByRole('button', { name: 'Validating…' })).toBeDisabled()
    expect(screen.getByLabelText('API key')).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Cancel validation' }))
    await act(async () => resolve())
    expect(screen.queryByLabelText('Message')).not.toBeInTheDocument()
  })
  it('sends once, renders inert text, and retries without duplicating the user message', async () => {
    const provider = fake()
    vi.mocked(provider.sendTurn).mockReturnValueOnce(Effect.fail(error('network', 'Try again'))).mockReturnValueOnce(Effect.succeed({ text: '<script>bad()</script>' }))
    const { user } = await connect(provider)
    await user.type(screen.getByLabelText('Message'), 'My custody needs{Enter}')
    expect(await screen.findByRole('alert')).toHaveTextContent('Try again')
    await user.click(screen.getByRole('button', { name: 'Retry response' }))
    expect(await screen.findByText('<script>bad()</script>')).toBeVisible()
    expect(screen.getAllByText('My custody needs')).toHaveLength(1)
    expect(document.querySelector('script')).toBeNull()
  })
  it('stops a turn and ignores its late response', async () => {
    let resolve!: (value: TurnResult) => void
    const provider = fake()
    vi.mocked(provider.sendTurn).mockReturnValue(Effect.tryPromise({ try: () => new Promise<TurnResult>(r => { resolve = r }), catch: () => error('network', 'Failed') }))
    const { user } = await connect(provider)
    await user.type(screen.getByLabelText('Message'), 'A question{Enter}')
    await user.click(screen.getByRole('button', { name: 'Stop response' }))
    await act(async () => resolve({ text: 'Late response' }))
    expect(screen.queryByText('Late response')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled()
  })
  it('invalidates the session after an authentication failure during chat', async () => {
    const provider = fake()
    vi.mocked(provider.sendTurn).mockReturnValue(Effect.fail(error('authentication', 'Reconnect')))
    const { user } = await connect(provider)
    await user.type(screen.getByLabelText('Message'), 'A question{Enter}')
    expect(await screen.findByLabelText('API key')).toHaveValue('')
    expect(screen.queryByText('A question')).not.toBeInTheDocument()
  })
  it('keeps a newline for Shift+Enter and does not send an empty message', async () => {
    const { user, provider } = await connect()
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(provider.sendTurn).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText('Message'), 'line{Shift>}{Enter}{/Shift}two')
    expect(screen.getByLabelText('Message')).toHaveValue('line\ntwo')
    expect(provider.sendTurn).not.toHaveBeenCalled()
  })
})
