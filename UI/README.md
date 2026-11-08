# CCC UI

A single-page custody architect workspace: connect your own OpenAI key, discuss requirements, and inspect the architecture alongside the conversation.

## Run locally

Use Node 26 (the tested version is in `.nvmrc`). From this directory:

```sh
nvm use
npm ci
npm run dev
```

Open the local URL printed by Vite. `VITE_OPENAI_MODEL` is public application configuration. The checked-in `.env` selects `gpt-6-luna`, so a fresh checkout works without local setup. To override it, copy `.env.example` to `.env.local` and edit the model, or set the variable in the build environment. Your account must have access to the selected model. Changing the model requires restarting Vite, or rebuilding for production. An explicitly empty override produces a configuration error when sending a message.

Enter the API key only in the setup form. Never put it in an environment file. Validation calls OpenAI's models endpoint; chat calls its Responses API. The key remains in a private in-memory service and is cleared on disconnect or reload. Conversation and architecture state are also session-only. Messages are sent directly to OpenAI; the app does not provide a backend relay.

The conversation panel is exactly `80em` (1280px at the shell's 16px font size). The diagram fills the remaining space with a 24rem minimum; smaller screens scroll horizontally. Use the diagram controls to pan/zoom/fit, drag nodes to arrange them, and select items through the graph or the component list. Ask for architecture changes in chat.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npx playwright install --with-deps chromium firefox webkit
npm run build
CI=1 npm run test:e2e
```

`npm run test:watch` runs the fast TDD loop. Browser tests use fake credentials and intercept provider requests. Unexpected external requests are blocked. CI runs browser journeys against the production bundle; local browser tests use Vite. Geometry checks run in Chromium; common journeys also run in Firefox and WebKit.

For a local production preview, run `npm run build` followed by `npm run preview`. Deploy `dist/` to an HTTPS static host. Model overrides must be set at build time; setting them only when starting preview cannot change an already-built bundle. No real key or paid provider call is needed for the automated suite.

## Code architecture

- `src/providers`: Effect service contract, OpenAI transport, typed errors, and private credential lifecycle.
- `src/app`: UI state reducer, Effect execution boundary, layout, setup, and chat.
- `src/features/architecture`: Zod validation, atomic revision-checked updates, node placement, and React Flow view.
- `src/test` and colocated tests: network-denying setup and unit/component behavior tests.
- `e2e`: complete browser journeys and accessibility checks.

Expected thrown exceptions and promise rejections are wrapped with `Effect.try` / `Effect.tryPromise` at integration boundaries. The UI aborts the running Effect and ignores obsolete completions when a response is stopped or a session ends. Graph validation failures preserve valid assistant HTML and the last accepted architecture. Structured responses may contain a conversational HTML message, a diagram replacement, or both. The session publishes typed events, and the UI sanitizes assistant HTML with DOMPurify. Provider history retains every response envelope, including diagram-only turns, separately from the visible transcript.

## Verification limits

Automated tests mock OpenAI. Successful live authentication, model access, and CORS from the actual deployment origin need a manual check with the user's key. The prototype does not read `/kb`, execute builder deployments, or sign transactions; those integrations require their own contracts.

The dependency audit at implementation time reported moderate development-only findings through ESLint's transitive `minimatch`; no high/critical findings were reported. Do not apply npm's suggested downgrade to ESLint 4. Recheck upstream fixes when updating the lockfile.
