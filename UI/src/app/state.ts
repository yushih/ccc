import { emptyArchitecture, type Architecture } from '../features/architecture/schema'
import type { Message } from '../providers/types'
import type { SessionEvent } from '../providers/session'
export type State = {
  phase: 'setup' | 'validating' | 'ready' | 'responding'
  messages: Message[]; transcript: Message[]; architecture: Architecture; error?: string; warning?: string; retry: boolean
  turnId?: number; responseAccepted: boolean
}
export const initialState = (): State => ({ phase: 'setup', messages: [], transcript: [], architecture: emptyArchitecture(), retry: false, responseAccepted: false })
export type Action =
  | { type: 'reset'; error?: string }
  | { type: 'validating' } | { type: 'connected' }
  | { type: 'failure'; message: string }
  | SessionEvent
export function reducer(state: State, action: Action): State {
  if ('turnId' in action && action.type !== 'started' && (state.phase !== 'responding' || action.turnId !== state.turnId)) return state
  switch (action.type) {
    case 'reset': return { ...initialState(), error: action.error }
    case 'validating': return { ...state, phase: 'validating', error: undefined }
    case 'connected': return { ...initialState(), phase: 'ready' }
    case 'started': {
      if (state.phase === 'setup' || state.phase === 'validating' || (state.turnId !== undefined && action.turnId <= state.turnId)) return state
      const added = action.messages.slice(state.messages.length).filter(message => message.role === 'user' && message.origin !== 'app')
      return { ...state, phase: 'responding', turnId: action.turnId, responseAccepted: false, messages: action.messages, transcript: [...state.transcript, ...added], error: undefined, warning: undefined, retry: false }
    }
    case 'responseReceived': return state.responseAccepted ? state : { ...state, responseAccepted: true,
      messages: [...state.messages, action.historyMessage],
      transcript: action.message ? [...state.transcript, { role: 'assistant', content: action.message.html }] : state.transcript,
      architecture: action.architecture ?? state.architecture, warning: action.warning,
    }
    case 'completed': return { ...state, phase: 'ready', retry: false }
    case 'failed': return action.error.kind === 'authentication'
      ? { ...initialState(), error: action.error.message }
      : { ...state, phase: 'ready', error: action.error.message, retry: true }
    case 'failure': return { ...state, phase: state.phase === 'validating' ? 'setup' : 'ready', error: action.message, retry: state.phase === 'responding' }
    case 'cancelled': return { ...state, phase: 'ready', warning: 'Response stopped.', retry: true }
  }
}
