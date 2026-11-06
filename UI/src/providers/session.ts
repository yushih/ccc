import { Effect, Either } from 'effect'
import { acceptUpdate, type Architecture } from '../features/architecture/schema'
import { error, type AppError } from './errors'
import { responseSchema, type TurnResult } from './response'
import { ModelProvider, type Message, type TurnInput } from './types'

export type SessionEvent =
  | { type: 'started'; turnId: number; messages: Message[] }
  | { type: 'responseReceived'; turnId: number; message: TurnResult['message']; historyMessage: Message; architecture?: Architecture; warning?: string }
  | { type: 'completed' | 'cancelled'; turnId: number }
  | { type: 'failed'; turnId: number; error: AppError }

// Credentials and event subscriptions belong to this in-memory session only.
export function createSession() {
  let key: string | undefined
  let generation = 0
  let active: { turnId: number; generation: number } | undefined
  const listeners = new Set<(event: SessionEvent) => void>()
  const publish = (event: SessionEvent) => { for (const listener of listeners) listener(event) }
  const cancel = () => {
    const previous = active
    active = undefined
    if (previous) publish({ type: 'cancelled', turnId: previous.turnId })
  }
  return {
    subscribe: (listener: (event: SessionEvent) => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    cancel,
    clear: () => { generation++; active = undefined; key = undefined },
    connect: (candidate: string) => Effect.gen(function* () {
      const submitted = candidate.trim()
      if (!submitted) return yield* Effect.fail(error('authentication', 'Enter an API key to continue.'))
      const attempt = ++generation
      const provider = yield* ModelProvider
      yield* provider.validateCredentials(submitted)
      yield* Effect.sync(() => { if (attempt === generation) key = submitted })
    }),
    respond: (input: TurnInput, currentArchitecture: Architecture, turnId: number): Effect.Effect<void, AppError, ModelProvider> => Effect.suspend(() => {
      cancel()
      const attempt = { turnId, generation }
      active = attempt
      const current = () => active === attempt && generation === attempt.generation
      return Effect.gen(function* () {
        yield* Effect.sync(() => publish({ type: 'started', turnId, messages: input.messages }))
        if (!key) return yield* Effect.fail(error('authentication', 'Reconnect to OpenAI to continue.'))
        const provider = yield* ModelProvider
        const raw = yield* provider.sendTurn(key, { ...input, architectureRevision: currentArchitecture.revision })
        const result = yield* Effect.try({ try: () => responseSchema.parse(raw), catch: () => error('response', 'The model returned an unreadable response. Please retry.') })
        let architecture: Architecture | undefined
        let warning: string | undefined
        if (result.architecture !== null) {
          const update = yield* Effect.either(acceptUpdate(currentArchitecture, result.architecture))
          if (Either.isRight(update)) architecture = update.right
          else warning = update.left.message
        }
        const content = yield* Effect.try({ try: () => JSON.stringify(result), catch: () => error('response', 'The model returned an unreadable response. Please retry.') })
        // No asynchronous boundary between content and completion notifications.
        yield* Effect.sync(() => {
          if (!current()) return
          publish({ type: 'responseReceived', turnId, message: result.message, historyMessage: { role: 'assistant', content }, ...(architecture ? { architecture } : {}), warning })
          if (!current()) return
          active = undefined
          publish({ type: 'completed', turnId })
        })
      }).pipe(
        Effect.tapError(failure => Effect.sync(() => {
          if (!current()) return
          active = undefined
          publish({ type: 'failed', turnId, error: failure })
        })),
        Effect.onInterrupt(() => Effect.sync(() => { if (current()) cancel() })),
      )
    }),
  }
}
