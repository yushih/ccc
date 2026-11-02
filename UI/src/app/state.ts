import { emptyArchitecture, type Architecture } from '../features/architecture/schema'
import type { Message } from '../providers/types'
export type State = {
  phase: 'setup' | 'validating' | 'ready' | 'responding'
  messages: Message[]; architecture: Architecture; error?: string; warning?: string; retry: boolean
}
export const initialState = (): State => ({ phase: 'setup', messages: [], architecture: emptyArchitecture(), retry: false })
export type Action =
  | { type: 'reset'; error?: string }
  | { type: 'validating' } | { type: 'connected' }
  | { type: 'start'; messages: Message[] }
  | { type: 'result'; text: string; architecture: Architecture; warning?: string }
  | { type: 'failure'; message: string }
  | { type: 'stop' }
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'reset': return { ...initialState(), error: action.error }
    case 'validating': return { ...state, phase: 'validating', error: undefined }
    case 'connected': return { ...initialState(), phase: 'ready' }
    case 'start': return { ...state, phase: 'responding', messages: action.messages, error: undefined, warning: undefined, retry: false }
    case 'result': return { ...state, phase: 'ready', messages: [...state.messages, { role: 'assistant', content: action.text }], architecture: action.architecture, warning: action.warning, retry: false }
    case 'failure': return { ...state, phase: state.phase === 'validating' ? 'setup' : 'ready', error: action.message, retry: state.phase === 'responding' }
    case 'stop': return { ...state, phase: 'ready', warning: 'Response stopped.', retry: true }
  }
}
