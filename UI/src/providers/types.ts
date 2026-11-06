import { Context, type Effect } from 'effect'
import type { AppError } from './errors'
import type { TurnResult } from './response'
export type Message = { role: 'user' | 'assistant'; content: string; origin?: 'app' }
export type TurnInput = { instructions: string; messages: Message[]; architectureRevision?: number }
export type { TurnResult } from './response'
export interface Provider {
  validateCredentials: (key: string) => Effect.Effect<void, AppError>
  sendTurn: (key: string, input: TurnInput) => Effect.Effect<TurnResult, AppError>
}
export class ModelProvider extends Context.Tag('ModelProvider')<ModelProvider, Provider>() {}
