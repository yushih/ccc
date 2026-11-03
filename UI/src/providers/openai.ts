import { Effect } from 'effect'
import { z } from 'zod'
import { turnJsonSchema } from '../features/architecture/schema'
import { error } from './errors'
import type { Provider } from './types'

const envelope = z.object({ status: z.literal('completed'), output: z.array(z.object({ type: z.string(), content: z.array(z.object({ type: z.string(), text: z.string().optional() })).optional() })) })
const turn = z.object({ text: z.string().trim().min(1).max(20000), architecture: z.unknown().optional() })
const responseError = () => error('response', 'OpenAI returned an incomplete or unreadable response. Please retry.')

export function createOpenAI(model: string, fetcher: typeof fetch = (...args) => fetch(...args)): Provider {
  const request = (key: string, path: string, body?: string) => Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: signal => fetcher(`https://api.openai.com/v1/${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        headers: { Authorization: `Bearer ${key}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        ...(body === undefined ? {} : { body }), signal,
      }),
      catch: () => error('network', 'Could not reach OpenAI. Check your connection and browser access, then retry.'),
    })
    if (!response.ok) {
      if (response.status === 401) return yield* Effect.fail(error('authentication', 'OpenAI rejected this API key. Check the key and reconnect.'))
      if (response.status === 403 || response.status === 404) return yield* Effect.fail(body === undefined
        ? error('permission', 'This key does not have permission to validate through the models endpoint. Check its API permissions.')
        : error('model-access', 'This key cannot access the configured model. Check model access and application configuration.'))
      if (response.status === 429) return yield* Effect.fail(error('rate-limit', 'OpenAI reports a rate or quota limit. Check your usage and retry later.'))
      if (response.status >= 500) return yield* Effect.fail(error('unavailable', 'OpenAI is temporarily unavailable. Please retry later.'))
      return yield* Effect.fail(error('response', 'OpenAI could not process this request. Check the model configuration and retry.'))
    }
    return response
  })
  return {
    validateCredentials: key => request(key, 'models').pipe(Effect.asVoid, Effect.timeoutFail({ duration: '20 seconds', onTimeout: () => error('timeout', 'Validation timed out. Please retry.') })),
    sendTurn: (key, input) => Effect.gen(function* () {
      if (!model.trim()) return yield* Effect.fail(error('configuration', 'No model is configured. Set VITE_OPENAI_MODEL and restart the application.'))
      const body = yield* Effect.try({
        try: () => JSON.stringify({ model, store: false,
          input: input.messages.map(({ role, content }) => ({ role, content })), text: { format: { type: 'json_schema', name: 'architect_turn', strict: true, schema: turnJsonSchema } },
        }), catch: responseError,
      })
      const response = yield* request(key, 'responses', body)
      const raw = yield* Effect.tryPromise({ try: () => response.json() as Promise<unknown>, catch: responseError })
      const parsed = yield* Effect.try({ try: () => envelope.parse(raw), catch: responseError })
      const content = parsed.output.filter(item => item.type === 'message').flatMap(item => item.content ?? [])
      if (content.some(item => item.type === 'refusal')) return yield* Effect.fail(error('response', 'OpenAI declined this request. Revise your message and try again.'))
      const text = content.filter(item => item.type === 'output_text').map(item => item.text ?? '').join('')
      return yield* Effect.try({ try: () => turn.parse(JSON.parse(text)), catch: responseError })
    }).pipe(Effect.timeoutFail({ duration: '120 seconds', onTimeout: () => error('timeout', 'The response timed out. Please retry.') })),
  }
}
