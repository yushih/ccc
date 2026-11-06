import { Effect, Either } from 'effect'
import { describe, it, expect, vi } from 'vitest'
import { createOpenAI } from './openai'
import { INITIAL_PROMPT } from '../prompts'
const message = { role: 'user' as const, content: 'Help me design custody' }
const input = { messages: [message], instructions: 'Act as a custody architect.' }
const response = (text: string) => new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text }] }] }))
describe('OpenAI adapter', () => {
  it('validates without generation and sends credentials only in headers', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}'))
    await Effect.runPromise(createOpenAI('gpt-6-luna', fetcher).validateCredentials('test-key'))
    expect(fetcher.mock.calls[0][0]).toBe('https://api.openai.com/v1/models')
    expect(fetcher.mock.calls[0][1]?.headers).toEqual({ Authorization: 'Bearer test-key' })
  })
  it.each([[401, 'authentication'], [403, 'permission'], [429, 'rate-limit'], [503, 'unavailable']])('maps status %s safely', async (status, kind) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('SECRET PROVIDER BODY', { status: Number(status) }))
    const result = await Effect.runPromise(Effect.either(createOpenAI('model', fetcher).validateCredentials('fake')))
    expect(Either.isLeft(result) && result.left.kind).toBe(kind)
    expect(JSON.stringify(result)).not.toContain('SECRET')
  })
  it('captures both synchronous exceptions and rejected promises as network errors', async () => {
    for (const fetcher of [vi.fn(() => { throw new Error('private') }), vi.fn().mockRejectedValue(new Error('private'))]) {
      const result = await Effect.runPromise(Effect.either(createOpenAI('model', fetcher).validateCredentials('fake')))
      expect(Either.isLeft(result) && result.left.kind).toBe('network')
    }
  })
  it('requires model configuration before sending a turn', async () => {
    const fetcher = vi.fn<typeof fetch>()
    const result = await Effect.runPromise(Effect.either(createOpenAI('', fetcher).sendTurn('fake', input)))
    expect(Either.isLeft(result) && result.left.kind).toBe('configuration')
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('uses Responses structured output and retains text with malformed architecture data', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(JSON.stringify({ text: 'A proposal', architecture: { broken: true } })))
    const result = await Effect.runPromise(createOpenAI('gpt-6-luna', fetcher).sendTurn('fake', input))
    expect(result).toEqual({ text: 'A proposal', architecture: { broken: true } })
    const body = JSON.parse(String(fetcher.mock.calls[0][1]?.body))
    expect(body.model).toBe('gpt-6-luna')
    expect(body.store).toBe(false)
    expect(body.text.format.type).toBe('json_schema')
    expect(body.input).toEqual([message])
    expect(JSON.stringify(body)).not.toContain('fake')
  })
  it('turns malformed JSON into a typed response error', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response('not JSON'))
    const result = await Effect.runPromise(Effect.either(createOpenAI('model', fetcher).sendTurn('fake', input)))
    expect(Either.isLeft(result) && result.left.kind).toBe('response')
  })
  it('rejects incomplete output without committing partial text', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('{"status":"incomplete","output":[]}'))
    const result = await Effect.runPromise(Effect.either(createOpenAI('model', fetcher).sendTurn('fake', input)))
    expect(Either.isLeft(result) && result.left.kind).toBe('response')
  })
})

it('sends instructions separately from the shared opening context', async () => {
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(JSON.stringify({ text: 'Hello', architecture: null })))
  await Effect.runPromise(createOpenAI('model', fetcher).sendTurn('fake', { ...input, messages: [{ role: 'user', content: INITIAL_PROMPT, origin: 'app' }] }))
  const body = JSON.parse(String(fetcher.mock.calls[0][1]?.body))
  expect(body.instructions).toBe(input.instructions)
  expect(body).not.toHaveProperty('architecture')
  expect(body.input).toEqual([{ role: 'user', content: INITIAL_PROMPT }])
})
