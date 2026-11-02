import { Effect, Either } from 'effect'
import { describe, it, expect } from 'vitest'
import { acceptUpdate, emptyArchitecture } from './schema'
const node = { id: 'owner', kind: 'person', label: 'Owner', description: 'Approves transfers' }
const update = { baseRevision: 0, nodes: [node], edges: [] }
const run = (value: unknown, revision = 0) => Effect.runSync(Effect.either(acceptUpdate({ ...emptyArchitecture(), revision }, value)))
describe('architecture updates', () => {
  it('accepts a complete update and increments the revision', () => {
    expect(run(update)).toEqual(Either.right({ revision: 1, nodes: [node], edges: [] }))
  })
  it.each([
    { ...update, nodes: [node, node] },
    { ...update, edges: [{ id: 'e', source: 'owner', target: 'missing', label: '' }] },
    { ...update, nodes: [{ ...node, kind: 'unknown' }] },
    { ...update, baseRevision: -1 },
    { ...update, nodes: [{ ...node, label: 'x'.repeat(121) }] },
    { ...update, nodes: Array.from({ length: 101 }, (_, i) => ({ ...node, id: String(i) })) },
  ])('rejects invalid updates without modifying the document', (value) => {
    expect(Either.isLeft(run(value))).toBe(true)
  })
  it('rejects stale revisions', () => expect(Either.isLeft(run(update, 1))).toBe(true))
  it('allows an explicit empty graph', () => expect(run({ ...update, nodes: [] })).toEqual(Either.right({ revision: 1, nodes: [], edges: [] })))
})
