import { Effect, Either } from 'effect'
import { acceptUpdate, type Architecture } from '../features/architecture/schema'
import { error } from './errors'
import { ModelProvider, type TurnInput } from './types'

// The active credential is private to this session and never part of UI state.
export function createSession() {
  let key: string | undefined
  let generation = 0
  return {
    clear: () => { generation++; key = undefined },
    connect: (candidate: string) => Effect.gen(function* () {
      const submitted = candidate.trim()
      if (!submitted) return yield* Effect.fail(error('authentication', 'Enter an API key to continue.'))
      const attempt = ++generation
      const provider = yield* ModelProvider
      yield* provider.validateCredentials(submitted)
      yield* Effect.sync(() => { if (attempt === generation) key = submitted })
    }),
    respond: (input: TurnInput, currentArchitecture: Architecture) => Effect.gen(function* () {
      if (!key) return yield* Effect.fail(error('authentication', 'Reconnect to OpenAI to continue.'))
      const provider = yield* ModelProvider
      const result = yield* provider.sendTurn(key, input)
      if (result.architecture === undefined || result.architecture === null) return { text: result.text, architecture: currentArchitecture, warning: undefined }
      const update = yield* Effect.either(acceptUpdate(currentArchitecture, result.architecture))
      return Either.isRight(update)
        ? { text: result.text, architecture: update.right, warning: undefined }
        : { text: result.text, architecture: currentArchitecture, warning: update.left.message }
    }),
  }
}
