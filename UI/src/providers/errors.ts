import { Data } from 'effect'
export type ErrorKind = 'authentication' | 'permission' | 'model-access' | 'rate-limit' | 'unavailable' | 'network' | 'configuration' | 'response' | 'architecture' | 'timeout'
export class AppError extends Data.TaggedError('AppError')<{ kind: ErrorKind; message: string }> {}
export const error = (kind: ErrorKind, message: string) => new AppError({ kind, message })
