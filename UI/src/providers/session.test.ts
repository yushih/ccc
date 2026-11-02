import { Effect, Either } from 'effect'
import { it, expect, vi } from 'vitest'
import { createSession } from './session'
import { ModelProvider, type Provider } from './types'
const graph = { revision: 0, nodes: [], edges: [] }
const provider: Provider = { validateCredentials: () => Effect.void, sendTurn: vi.fn(() => Effect.succeed({ text: 'Explanation', architecture: { baseRevision: 0, nodes: [], edges: [] } })) }
it('never exposes credentials and clears them on disconnect', async () => {
  const session = createSession()
  await Effect.runPromise(session.connect('fake').pipe(Effect.provideService(ModelProvider, provider)))
  expect(JSON.stringify(session)).not.toContain('fake')
  session.clear()
  const result = await Effect.runPromise(session.respond({ messages: [], architecture: graph }).pipe(Effect.provideService(ModelProvider, provider), Effect.either))
  expect(Either.isLeft(result) && result.left.kind).toBe('authentication')
})
it('keeps assistant text and the previous diagram when an update is malformed', async () => {
  const session = createSession()
  const invalid: Provider = { ...provider, sendTurn: () => Effect.succeed({ text: 'Useful explanation', architecture: { broken: true } }) }
  await Effect.runPromise(session.connect('fake').pipe(Effect.provideService(ModelProvider, invalid)))
  const result = await Effect.runPromise(session.respond({ messages: [], architecture: graph }).pipe(Effect.provideService(ModelProvider, invalid)))
  expect(result.text).toBe('Useful explanation')
  expect(result.architecture).toBe(graph)
  expect(result.warning).toContain('previous diagram is unchanged')
})
