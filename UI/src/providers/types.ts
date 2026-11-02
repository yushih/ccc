import { Context, type Effect } from 'effect'
import type { Architecture } from '../features/architecture/schema'
import type { AppError } from './errors'
export type Message = { role: 'user' | 'assistant'; content: string }
export type TurnInput = { messages: Message[]; architecture: Architecture }
export type TurnResult = { text: string; architecture?: unknown }
export interface Provider {
  validateCredentials: (key: string) => Effect.Effect<void, AppError>
  sendTurn: (key: string, input: TurnInput) => Effect.Effect<TurnResult, AppError>
}
export class ModelProvider extends Context.Tag('ModelProvider')<ModelProvider, Provider>() {}
