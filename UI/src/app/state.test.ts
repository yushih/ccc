import { expect, it } from 'vitest'
import { initialState, reducer } from './state'
import type { SessionEvent } from '../providers/session'
const response: SessionEvent = { type: 'responseReceived', turnId: 1, message: null, historyMessage: { role: 'assistant', content: '{"message":null}' }, architecture: { revision: 1, nodes: [], edges: [] } }
it('rejects duplicate content and obsolete events after completion, cancellation, and disconnect', () => {
  const ready = reducer(initialState(), { type: 'connected' })
  const started = reducer(ready, { type: 'started', turnId: 1, messages: [{ role: 'user', content: 'Clear it' }] })
  const accepted = reducer(started, response)
  expect(reducer(accepted, response)).toBe(accepted)
  expect(accepted.transcript).toEqual([{ role: 'user', content: 'Clear it' }])
  for (const state of [reducer(accepted, { type: 'completed', turnId: 1 }), reducer(started, { type: 'cancelled', turnId: 1 }), initialState()]) {
    expect(reducer(state, response)).toBe(state)
  }
  const newer = reducer(started, { type: 'started', turnId: 2, messages: started.messages })
  expect(reducer(newer, response)).toBe(newer)
  expect(reducer(newer, { type: 'failed', turnId: 1, error: { kind: 'network', message: 'late' } } as SessionEvent)).toBe(newer)
})
