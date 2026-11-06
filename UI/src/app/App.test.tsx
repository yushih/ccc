import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'
import { ARCHITECT_INSTRUCTIONS, INITIAL_PROMPT } from '../prompts'
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
const fake = (): Provider => ({ validateCredentials: vi.fn(() => Effect.void), sendTurn: vi.fn(() => Effect.succeed({ message: { html: 'What are your recovery requirements?' }, architecture: null })).mockReturnValueOnce(Effect.succeed({ message: { html: 'Welcome to CCC.' }, architecture: null })) })
async function connect(provider = fake()) {
  const user = userEvent.setup()
  const view = render(<App provider={provider} />)
  await user.type(screen.getByLabelText('API key'), '  fake-key  ')
  await user.click(screen.getByRole('button', { name: 'Connect to OpenAI' }))
  await screen.findByText('Welcome to CCC.')
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
    vi.mocked(provider.sendTurn).mockReturnValueOnce(Effect.fail(error('network', 'Try again'))).mockReturnValueOnce(Effect.succeed({ message: { html: '<p>Safe reply</p><script>bad()</script>' }, architecture: null }))
    const { user } = await connect(provider)
    await user.type(screen.getByLabelText('Message'), 'My custody needs{Enter}')
    expect(await screen.findByRole('alert')).toHaveTextContent('Try again')
    await user.click(screen.getByRole('button', { name: 'Retry response' }))
    expect(await screen.findByText('Safe reply')).toBeVisible()
    expect(screen.getAllByText('My custody needs')).toHaveLength(1)
    expect(document.querySelector('script')).toBeNull()
    for (const [, input] of vi.mocked(provider.sendTurn).mock.calls) {
      expect(input.instructions).toBeTruthy()
      expect(input.instructions).toBe(ARCHITECT_INSTRUCTIONS)
      expect(input).not.toHaveProperty('architecture')
    }
  })
  it('stops a turn and ignores its late response', async () => {
    let resolve!: (value: TurnResult) => void
    const provider = fake()
    vi.mocked(provider.sendTurn).mockReturnValue(Effect.tryPromise({ try: () => new Promise<TurnResult>(r => { resolve = r }), catch: () => error('network', 'Failed') }))
    const { user } = await connect(provider)
    await user.type(screen.getByLabelText('Message'), 'A question{Enter}')
    await user.click(screen.getByRole('button', { name: 'Stop response' }))
    await act(async () => resolve({ message: { html: 'Late response' }, architecture: null }))
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
    expect(provider.sendTurn).toHaveBeenCalledTimes(1)
    await user.type(screen.getByLabelText('Message'), 'line{Shift>}{Enter}{/Shift}two')
    expect(screen.getByLabelText('Message')).toHaveValue('line\ntwo')
    expect(provider.sendTurn).toHaveBeenCalledTimes(1)
  })
})


describe('automatic opening turn', () => {
  it('starts once after validation and keeps the app prompt in subsequent context without displaying it as user text', async () => {
    const { user, provider, rerender } = await connect()
    expect(provider.sendTurn).toHaveBeenCalledTimes(1)
    const opening = vi.mocked(provider.sendTurn).mock.calls[0][1].messages[0]
    expect(opening.role).toBe('user')
    expect(opening.content).toBe(INITIAL_PROMPT)
    expect(ARCHITECT_INSTRUCTIONS).toBeTruthy()
    expect(INITIAL_PROMPT).not.toContain(ARCHITECT_INSTRUCTIONS)
    expect(screen.queryByText(ARCHITECT_INSTRUCTIONS)).not.toBeInTheDocument()
    expect(screen.queryByText(opening.content)).not.toBeInTheDocument()
    rerender(<App provider={provider} />)
    expect(provider.sendTurn).toHaveBeenCalledTimes(1)
    await user.type(screen.getByLabelText('Message'), 'My needs{Enter}')
    await waitFor(() => expect(provider.sendTurn).toHaveBeenCalledTimes(2))
    expect(vi.mocked(provider.sendTurn).mock.calls[1][1].messages).toEqual([
      opening, { role: 'assistant', content: JSON.stringify({ message: { html: 'Welcome to CCC.' }, architecture: null }) }, { role: 'user', content: 'My needs' },
    ])
  })
  it('does not start a conversation when validation fails', async () => {
    const provider = fake()
    vi.mocked(provider.validateCredentials).mockReturnValue(Effect.fail(error('authentication', 'Rejected')))
    const user = userEvent.setup(); render(<App provider={provider} />)
    await user.type(screen.getByLabelText('API key'), 'fake')
    await user.click(screen.getByRole('button', { name: 'Connect to OpenAI' }))
    await screen.findByRole('alert')
    expect(provider.sendTurn).not.toHaveBeenCalled()
  })
  it('retries the opening prompt without duplication', async () => {
    const provider = fake()
    vi.mocked(provider.sendTurn).mockReset().mockReturnValueOnce(Effect.fail(error('network', 'Opening failed'))).mockReturnValue(Effect.succeed({ message: { html: 'Welcome after retry' }, architecture: null }))
    const user = userEvent.setup(); render(<App provider={provider} />)
    await user.type(screen.getByLabelText('API key'), 'fake')
    await user.click(screen.getByRole('button', { name: 'Connect to OpenAI' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Opening failed')
    await user.click(screen.getByRole('button', { name: 'Retry response' }))
    await screen.findByText('Welcome after retry')
    expect(vi.mocked(provider.sendTurn).mock.calls[1][1]).toEqual(vi.mocked(provider.sendTurn).mock.calls[0][1])
    expect(vi.mocked(provider.sendTurn).mock.calls[1][1].instructions).toBeTruthy()
    expect(vi.mocked(provider.sendTurn).mock.calls[1][1].instructions).toBe(ARCHITECT_INSTRUCTIONS)
  })
  it('clears the session if authentication fails on the opening request', async () => {
    const provider = fake()
    vi.mocked(provider.sendTurn).mockReset().mockReturnValue(Effect.fail(error('authentication', 'Reconnect')))
    const user = userEvent.setup(); render(<App provider={provider} />)
    await user.type(screen.getByLabelText('API key'), 'fake')
    await user.click(screen.getByRole('button', { name: 'Connect to OpenAI' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Reconnect')
    expect(screen.getByLabelText('API key')).toHaveValue('')
    expect(screen.queryByLabelText('Message')).not.toBeInTheDocument()
  })
  it('ignores an opening response after disconnect', async () => {
    let resolve!: (value: TurnResult) => void
    const provider = fake()
    vi.mocked(provider.sendTurn).mockReset().mockReturnValue(Effect.tryPromise({ try: () => new Promise<TurnResult>(r => { resolve = r }), catch: () => error('network', 'Failed') }))
    const user = userEvent.setup(); render(<App provider={provider} />)
    await user.type(screen.getByLabelText('API key'), 'fake')
    await user.click(screen.getByRole('button', { name: 'Connect to OpenAI' }))
    await screen.findByRole('button', { name: 'Stop response' })
    expect(screen.getByLabelText('Message')).toHaveAttribute('readonly')
    await user.click(screen.getByRole('button', { name: 'Disconnect' }))
    await act(async () => resolve({ message: { html: 'Obsolete greeting' }, architecture: null }))
    expect(screen.queryByText('Obsolete greeting')).not.toBeInTheDocument()
    expect(screen.getByLabelText('API key')).toHaveValue('')
  })
})

it('applies diagram-only output without a bubble and retains it in model history', async () => {
  const provider = fake()
  const diagramOnly = { message: null, architecture: { baseRevision: 0, nodes: [], edges: [] } }
  vi.mocked(provider.sendTurn).mockReturnValueOnce(Effect.succeed(diagramOnly))
  const { user } = await connect(provider)
  await user.type(screen.getByLabelText('Message'), 'Clear the diagram{Enter}')
  await screen.findByText('REV 01')
  expect(screen.getAllByText('ARCHITECT', { exact: true })).toHaveLength(2) // Header plus opening message.
  expect(screen.getByLabelText('Message')).toHaveValue('')
  expect(screen.getByLabelText('Message')).toHaveFocus()
  await user.type(screen.getByLabelText('Message'), 'Explain that{Enter}')
  await screen.findByText('What are your recovery requirements?')
  const next = vi.mocked(provider.sendTurn).mock.calls[2][1]
  expect(next.messages).toContainEqual({ role: 'assistant', content: JSON.stringify(diagramOnly) })
  expect(next.architectureRevision).toBe(1)
  expect(screen.getByText('REV 01')).toBeVisible()
})

it('renders user input literally while rendering assistant formatting', async () => {
  const provider = fake()
  vi.mocked(provider.sendTurn).mockReturnValueOnce(Effect.succeed({ message: { html: '<p>Use <strong>independent</strong> backups.</p>' }, architecture: null }))
  const { user } = await connect(provider)
  await user.type(screen.getByLabelText('Message'), '<strong>My needs</strong>{Enter}')
  expect(await screen.findByText('independent')).toHaveProperty('tagName', 'STRONG')
  expect(screen.getByText('<strong>My needs</strong>')).toHaveProperty('tagName', 'P')
})

it('does not duplicate event subscriptions under StrictMode', async () => {
  const { StrictMode } = await import('react')
  const provider = fake()
  const user = userEvent.setup()
  render(<StrictMode><App provider={provider} /></StrictMode>)
  await user.type(screen.getByLabelText('API key'), 'fake')
  await user.click(screen.getByRole('button', { name: 'Connect to OpenAI' }))
  expect(await screen.findAllByText('Welcome to CCC.')).toHaveLength(1)
  expect(provider.sendTurn).toHaveBeenCalledTimes(1)
})
