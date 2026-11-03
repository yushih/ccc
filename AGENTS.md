See [README.md](README.md) for the project purpose, [UI/DESIGN.md](UI/DESIGN.md) for UI behavior and data contracts, and [UI/TDD_PLAN.md](UI/TDD_PLAN.md) for the detailed implementation/testing sequence.

## Code map

- `UI/`: single-page interface for the architect and builder.
- `UI/src/app/`: shell, setup/chat UI, session reducer, and styles.
- `UI/src/providers/`: provider adapter, Effect service contract, typed errors, and private credential lifecycle.
- `UI/src/features/architecture/`: schema, revision-checked updates, placement, and diagram view.
- `UI/src/test/`: test setup; colocate unit/component tests as `*.test.ts(x)`. Browser journeys live in `UI/e2e/`.
- `kb/`: solution-space knowledge base; access belongs behind the agent boundary, not through browser filesystem assumptions.

## Stack

- Node 26 (`UI/.nvmrc`), npm, React, strict TypeScript, Vite; CSS Modules, global CSS variables, and CSS Grid.
- Effect for workflows and service dependencies; React `useReducer` for UI state; React Flow for diagrams; Zod for runtime validation; native `fetch` with cancellation behind provider adapters.
- Vitest, jsdom, React Testing Library, user-event, and jest-dom for unit/component tests; Playwright and axe for browser/accessibility checks; TypeScript and ESLint for static checks.

## Commands

Run from `UI/`. Use `nvm use` and `npm ci`; keep dependency versions and `package-lock.json` synchronized. For local setup, copy `.env.example` to `.env.local`. `VITE_OPENAI_MODEL` is public configuration, never a place for credentials.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite |
| `npm run test:watch` / `npm test` | TDD loop / unit and component suite |
| `npm run typecheck` / `npm run lint` | Static checks |
| `npm run build` / `npm run preview` | Build `dist/` / preview it |
| `npm run test:e2e` | Browser journeys against the dev server |
| `CI=1 npm run test:e2e` | Browser journeys against the production build; build first |

Install browser prerequisites with `npx playwright install --with-deps chromium firefox webkit`.

## Coding standards

- Compose workflows as Effects with explicit error types and injected services; execute them at the UI boundary. Wrap throwing library calls inside `Effect.try` and rejecting asynchronous calls inside `Effect.tryPromise`, mapping failures to typed application errors. Do not use `Effect.sync` or `Effect.promise` for expected failures.
- Keep provider-specific behavior behind adapters; verify current official documentation when changing endpoints, models, or structured-output formats.
- Keep credentials in a private in-memory session service, outside React state. Never commit, persist, log, export, or put keys in URLs or client environment variables.
- Treat model output as untrusted: render text safely and validate architecture updates. Keep domain data independent of React Flow types and presentation state.
- Make loading, failure, cancellation, and recovery explicit and accessible. Ignore obsolete results; preserve keyboard access and visible focus.

## Development procedure

- Use TDD: observe a behavioral test fail, implement the smallest passing change, then refactor. Test observable behavior and contracts rather than component internals.
- Inject fake providers in component tests and intercept network calls in browser tests. Block unexpected external requests; use fake credentials and controllable promises for race tests. CI must not need real keys or paid calls.
- Use browser tests for geometry and graph interactions. Run common journeys in Chromium, Firefox, and WebKit; detailed geometry checks run in Chromium. Include axe checks and manual keyboard/focus inspection.
- Before delivery, run typecheck, lint, unit/component tests, build, and relevant browser journeys. Report results and any unverified live-provider behavior. Keep real-key smoke tests manual and separate from CI.
