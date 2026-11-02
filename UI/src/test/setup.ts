import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
afterEach(cleanup)
// No unit or component test may accidentally contact a real provider.
vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected network request in test') }))
