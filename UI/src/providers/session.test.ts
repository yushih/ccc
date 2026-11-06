import { Effect, Either } from 'effect'
import { it, expect, vi } from 'vitest'
import { createSession, type SessionEvent } from './session'
import { ModelProvider, type Provider } from './types'
import { error } from './errors'
const graph = { revision: 0, nodes: [], edges: [] }
const input = { messages: [], instructions: 'Architect guidance' }
const provider: Provider = { validateCredentials: () => Effect.void, sendTurn: vi.fn(() => Effect.succeed({ message: { html: '<p>Explanation</p>' }, architecture: { baseRevision: 0, nodes: [], edges: [] } })) }
async function setup(fake = provider) {
  const session = createSession()
  const events: SessionEvent[] = []
  const unsubscribe = session.subscribe(event => events.push(event))
  const run = <A>(effect: Effect.Effect<A, import('./errors').AppError, ModelProvider>) => Effect.runPromise(effect.pipe(Effect.provideService(ModelProvider, fake)))
  await run(session.connect('fake'))
  return { session, events, unsubscribe, run }
}
it('never exposes credentials and clears them on disconnect', async () => {
  const { session } = await setup()
  expect(JSON.stringify(session)).not.toContain('fake')
  session.clear()
  const result = await Effect.runPromise(session.respond(input, graph, 1).pipe(Effect.provideService(ModelProvider, provider), Effect.either))
  expect(Either.isLeft(result) && result.left.kind).toBe('authentication')
})
it('returns void and publishes a complete response atomically before completion', async () => {
  const { session, events, run } = await setup()
  expect(await run(session.respond(input, graph, 1))).toBeUndefined()
  expect(events.map(event => event.type)).toEqual(['started', 'responseReceived', 'completed'])
  expect(events[1]).toMatchObject({ turnId: 1, message: { html: '<p>Explanation</p>' }, architecture: { revision: 1 } })
})
it('keeps valid HTML when a diagram update is malformed', async () => {
  const { session, events, run } = await setup({ ...provider, sendTurn: () => Effect.succeed({ message: { html: 'Useful explanation' }, architecture: { broken: true } }) })
  await run(session.respond(input, graph, 1))
  expect(events[1]).toMatchObject({ message: { html: 'Useful explanation' }, warning: expect.stringContaining('previous diagram is unchanged') })
  expect(events[1]).not.toHaveProperty('architecture')
})
it('sends accepted revision context and rejects a stale update', async () => {
  const sendTurn = vi.fn(() => Effect.succeed({ message: { html: 'Updated' }, architecture: { baseRevision: 2, nodes: [], edges: [] } }))
  const { session, events, run } = await setup({ ...provider, sendTurn })
  await run(session.respond(input, { ...graph, revision: 2 }, 1))
  expect(sendTurn).toHaveBeenCalledWith('fake', { ...input, architectureRevision: 2 })
  expect(events[1]).toMatchObject({ architecture: { revision: 3 } })
  await run(session.respond(input, { ...graph, revision: 3 }, 2))
  expect(events[4]).toMatchObject({ warning: expect.stringContaining('out of date') })
  expect(events[4]).not.toHaveProperty('architecture')
})
it('publishes failures once and supports unsubscribe', async () => {
  const { session, events, run, unsubscribe } = await setup({ ...provider, sendTurn: () => Effect.fail(error('network', 'Retry')) })
  await expect(run(session.respond(input, graph, 1))).rejects.toThrow('Retry')
  expect(events.map(event => event.type)).toEqual(['started', 'failed'])
  unsubscribe()
  await expect(run(session.respond(input, graph, 2))).rejects.toThrow('Retry')
  expect(events).toHaveLength(2)
})
it.each(['cancel', 'clear'] as const)('ignores late results after %s even without interrupting the effect', async action => {
  let finish!: (value: import('./types').TurnResult) => void
  const fake: Provider = { ...provider, sendTurn: () => Effect.tryPromise({ try: () => new Promise(resolve => { finish = resolve }), catch: () => error('network', 'Failed') }) }
  const { session, events, run } = await setup(fake)
  const pending = run(session.respond(input, graph, 1))
  session[action]()
  finish({ message: { html: 'Late' }, architecture: { baseRevision: 0, nodes: [], edges: [] } })
  await pending
  expect(events.some(event => event.type === 'responseReceived')).toBe(false)
})
