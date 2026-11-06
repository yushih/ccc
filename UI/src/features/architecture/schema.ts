import { Effect } from 'effect'
import { z } from 'zod'
import { error } from '../../providers/errors'
const id = z.string().min(1).max(80)
export const nodeSchema = z.object({ id, kind: z.enum(['person', 'wallet', 'device', 'service', 'policy', 'backup']), label: z.string().min(1).max(120), description: z.string().max(2000) }).strict()
export const edgeSchema = z.object({ id, source: id, target: id, label: z.string().max(120) }).strict()
export const updateSchema = z.object({ baseRevision: z.number().int().nonnegative(), nodes: z.array(nodeSchema).max(100), edges: z.array(edgeSchema).max(200) }).strict()
export type Architecture = { revision: number; nodes: z.infer<typeof nodeSchema>[]; edges: z.infer<typeof edgeSchema>[] }
export const emptyArchitecture = (): Architecture => ({ revision: 0, nodes: [], edges: [] })
export const acceptUpdate = (current: Architecture, candidate: unknown) => Effect.gen(function* () {
  const update = yield* Effect.try({ try: () => updateSchema.parse(candidate), catch: () => error('architecture', 'The architecture update was invalid. Your previous diagram is unchanged.') })
  const nodeIds = new Set(update.nodes.map(n => n.id))
  const edgeIds = new Set(update.edges.map(e => e.id))
  if (nodeIds.size !== update.nodes.length || edgeIds.size !== update.edges.length || update.edges.some(e => !nodeIds.has(e.source) || !nodeIds.has(e.target))) {
    return yield* Effect.fail(error('architecture', 'The architecture contains duplicate IDs or missing connections. Your previous diagram is unchanged.'))
  }
  if (update.baseRevision !== current.revision) return yield* Effect.fail(error('architecture', 'The architecture update is out of date. Your previous diagram is unchanged.'))
  return { revision: current.revision + 1, nodes: update.nodes, edges: update.edges }
})
