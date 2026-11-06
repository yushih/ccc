import { z } from 'zod'
import { updateSchema } from '../features/architecture/schema'

const messageSchema = z.object({ html: z.string().trim().min(1).max(20000) }).strict()
// Strict provider schema; cross-field and graph semantics are checked locally.
export const turnJsonSchema = z.toJSONSchema(z.object({
  message: messageSchema.nullable(), architecture: updateSchema.nullable(),
}).strict())
// Keep diagram validation independent so a bad update cannot discard useful HTML.
export const responseSchema = z.object({
  message: messageSchema.nullable(), architecture: z.unknown(),
}).strict().refine(value => Object.hasOwn(value, 'architecture') && value.architecture !== undefined
  && (value.message !== null || value.architecture !== null))
export type TurnResult = z.infer<typeof responseSchema>
