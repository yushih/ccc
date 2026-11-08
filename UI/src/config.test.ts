// @vitest-environment node
import { mkdtempSync, copyFileSync, existsSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { afterEach, expect, it, vi } from 'vitest'
const directories: string[] = []
afterEach(() => {
  vi.unstubAllEnvs()
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true })
})
function freshCheckout() {
  vi.stubEnv('VITE_OPENAI_MODEL', undefined)
  const directory = mkdtempSync(join(tmpdir(), 'ccc-model-config-'))
  directories.push(directory)
  const config = fileURLToPath(new URL('../.env', import.meta.url))
  if (existsSync(config)) copyFileSync(config, join(directory, '.env'))
  return directory
}
it.each(['development', 'production'])('ships a model for %s without local files or shell configuration', mode => {
  expect(loadEnv(mode, freshCheckout()).VITE_OPENAI_MODEL).toBe('gpt-6-luna')
})
it('allows local and deployment overrides to take precedence over the public default', () => {
  const directory = freshCheckout()
  writeFileSync(join(directory, '.env.local'), 'VITE_OPENAI_MODEL=local-model\n')
  expect(loadEnv('development', directory).VITE_OPENAI_MODEL).toBe('local-model')
  vi.stubEnv('VITE_OPENAI_MODEL', 'deployment-model')
  expect(loadEnv('production', directory).VITE_OPENAI_MODEL).toBe('deployment-model')
})
