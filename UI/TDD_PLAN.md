# UI test-driven development plan

This plan implements `DESIGN.md`. Application implementation is a subsequent task; no tests or framework are installed by this documentation change.

## Technology stack

Use the following stack for implementation under `/UI`. Resolve compatible stable package versions when scaffolding, commit `package-lock.json`, and record the supported Node.js LTS version in `.nvmrc` and `package.json` engines. Use npm locally and `npm ci` in CI.

| Area | Choice | Role |
| --- | --- | --- |
| Application | React + TypeScript with strict checking | Components and typed provider, session, and architecture contracts |
| Build and development | Vite with the React TypeScript template | Local dev server and static production bundle |
| Styling | CSS Modules, global CSS variables, and CSS Grid | Component styles, shared visual tokens, and the specified two-panel layout |
| State | React `useReducer` and Context | Explicit session and conversation transitions; local state for diagram presentation |
| Diagram | React Flow (`@xyflow/react`) | Controlled nodes/edges, selection, dragging, pan, zoom, and fit-to-view |
| Runtime validation | Zod | Validate provider turn results and architecture documents; infer TypeScript data types |
| Provider transport | Native `fetch` and `AbortController` behind the provider adapter | Authenticated requests and cancellation |
| Message rendering | React text rendering | Display plain text with preserved whitespace; no HTML or Markdown parser needed |
| Unit/component tests | Vitest, jsdom, React Testing Library, `user-event`, and `jest-dom` | Reducer/schema tests and user-facing form/chat behavior |
| Browser tests | Playwright Test | Real layout, graph interactions, and complete user journeys |
| Accessibility checks | `@axe-core/playwright` | Automated checks alongside manual keyboard and focus inspection |
| Static checks | TypeScript `tsc --noEmit` and ESLint with TypeScript/React Hooks rules | Type errors, code issues, and hook usage |

Vite provides the development/build foundation, React Flow supplies graph interactions, and Zod validates untrusted data at runtime. See the official [Vite guide](https://vite.dev/guide/), [React Flow guide](https://reactflow.dev/learn), and [Zod documentation](https://zod.dev/).

Vitest runs the fast tests; React Testing Library exercises components through their rendered UI. Playwright handles browser behavior and network interception, with axe for accessibility checks. See [Vitest](https://vitest.dev/guide/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [Playwright](https://playwright.dev/docs/intro), [network mocking](https://playwright.dev/docs/mock), and [accessibility testing](https://playwright.dev/docs/accessibility-testing).

Keep the API key in a private in-memory session service and pass only session status through React state. Do not put credentials in Vite environment variables: client configuration is public. The model identifier can use a documented public configuration value such as `VITE_OPENAI_MODEL`. Transport remains subject to the browser compatibility check in step 0.

Use a deterministic grid placement function for new graph nodes and preserve existing positions. React Flow renders and manipulates the graph; application code owns semantic validation and positioning. A router, database, and backend are not required for the documented single-page, session-only workflow.

## Source organization

```text
UI/
  src/
    app/             # Shell, session reducer/context, global styles
    features/
      setup/         # Provider and API-key form
      chat/          # Transcript, composer, conversation controller
      architecture/  # Schema, update controller, React Flow view, placement
    providers/       # Adapter contract, OpenAI adapter, private session service
    test/            # Test setup, fake adapter, provider response fixtures
  e2e/               # Playwright journeys and network mocks
  package.json
  package-lock.json
  vite.config.ts
  vitest.config.ts
  playwright.config.ts
  tsconfig.json
```

Colocate unit/component tests with their modules as `*.test.ts` or `*.test.tsx`. Keep provider-shaped fixtures shared between adapter and browser tests. Domain data must not depend on React Flow's node/edge types; map between them in the diagram view.

## Development commands to implement

Run these scripts from `/UI` after scaffolding:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite |
| `npm run test:watch` | Run Vitest during red/green/refactor cycles |
| `npm test` | Run Vitest once |
| `npm run test:e2e` | Run Playwright journeys |
| `npm run typecheck` | Run TypeScript checking without emitting files |
| `npm run lint` | Run ESLint |
| `npm run build` | Type-check and build static assets into `dist/` |
| `npm run preview` | Serve the production build locally |

Configure Playwright to start the Vite server for local tests and the production preview server for CI journeys. Run journeys in Chromium, Firefox, and WebKit; use Chromium for the detailed geometry checks. CI installs the matching Playwright browsers, runs static checks and Vitest, builds the app, then tests the production bundle. These scripts and configuration files are planned deliverables, not files installed by this document.

## Method and test boundaries

For each slice below, write a behavioral test and observe it fail for the expected missing behavior, implement the smallest change that passes, then refactor. Commit-sized slices should leave the existing suite passing. Prefer assertions on visible behavior and provider contracts over internal component structure or snapshots.

Use unit tests for schema and state rules, component tests for form/chat behavior, and browser tests for layout and complete journeys. Mock the provider at the network boundary for browser tests and inject a fake adapter for focused component tests. Deny unexpected external network requests. Use fake credentials and deterministic deferred responses for race conditions; no live model calls in CI.

## 0. Establish implementation prerequisites

- Scaffold the React TypeScript Vite application with the stack above. Verify package compatibility and lock dependency versions; configure strict TypeScript, ESLint, Vitest/jsdom, and Playwright.
- Verify the current OpenAI credential-validation request, browser transport, supported model, and structured response format. Record the decisions in the design and application configuration.
- Define the architecture schema's allowed kinds, size limits, and normalized provider error categories.
- Add the minimum application and test harness under `/UI`, with scripts for development, type checking, unit/component tests, browser tests, and production build.
- Keep real credential verification optional and manual. If browser transport requires a relay, resolve its design before writing dependent integration code.

Exit: the harness runs a failing initial-render test, and provider contracts are concrete enough to mock accurately.

## 1. Render the two-panel shell

Write failing tests that initial load exposes the provider dropdown with OpenAI selected, masked key input, and confirmation button in order; chat is absent and the architecture empty state is present.

Implement the shell and setup form with React and CSS Modules/Grid. Add a browser layout assertion comparing the conversation panel's measured width to 80 times the shell font size. At a wide viewport, assert that the diagram consumes the remaining width. At a narrow viewport, assert that both panels remain reachable through the specified horizontal overflow. Check independent transcript/diagram scrolling once transcript content exists.

Exit: initial content and both wide/narrow layout behaviors pass.

## 2. Validate credentials and gate chat

Write tests for blank input without a network call, trimmed submission, pending feedback, duplicate-submit prevention, successful transition to chat, and retry after failure. Table-test rejected credentials, network failure, rate limiting, and provider outage with their distinct safe messages.

Implement setup states with the session reducer and the adapter's credential-validation contract with `fetch`. Test adapter request/response handling using an injected fake fetch implementation; component tests use a fake adapter. Assert that credentials travel only in the designated authenticated request field, never in the URL or displayed error. Resolve a pending validation after disconnect/unmount and assert it cannot activate chat.

Exit: chat can be entered only after a successful validation response, with deterministic recovery paths for failures.

## 3. Add one complete conversation turn

Write tests for empty-message rejection, visible user content, pending assistant feedback, a successful assistant response, and the correct conversation/model passed to the adapter. Cover Enter, Shift+Enter, and IME composition. Verify that one active turn prevents a second concurrent send.

Implement transcript, composer, and nonstreaming turn handling. Test missing model configuration and a valid key without model access as separate failures. Verify malicious HTML in a response renders inertly.

Exit: a mocked architect turn works through the UI using the active session and configured model.

## 4. Define and validate architecture updates

Write unit tests for a valid graph, duplicate IDs, dangling edge references, unsupported node kinds, invalid revisions, and strings/collections exceeding the agreed limits. Include optional updates, an explicit empty graph, and malformed structured output.

Implement Zod schema validation, including cross-reference checks, and atomic replacement in the architecture controller. Test these pure domain functions with Vitest. Test that stale base revisions and results from obsolete requests leave the current graph untouched. A valid update increments the local revision; no update preserves it. Invalid graph data must not discard otherwise valid assistant text.

Exit: all accepted graph data satisfies the contract, and rejected updates preserve the last accepted document.

## 5. Render and interact with the architecture

Write component/browser tests that a successful turn displays the expected nodes and connections, selection reveals details, and fit-to-view works. Exercise pan, zoom, dragging, and keyboard controls in browser tests where geometry matters. Assert that dragging does not alter semantic node or edge data.

Implement the controlled React Flow view, deterministic node placement, and accessible textual alternative. Use Playwright for graph geometry and pointer interactions rather than relying on jsdom layout. Test preservation of surviving node positions across updates and removal of selection when the selected entity disappears. Verify that labels and descriptions cannot inject active HTML.

Exit: the user can inspect and arrange a valid architecture with pointer and keyboard paths.

## 6. Complete cancellation, retry, and session cleanup

Write tests for stopping a pending turn, ignoring late results, retrying a failed turn without duplicating user messages, and retaining the last valid graph after a transient failure. Use controllable promises rather than timed sleeps.

Test disconnect during validation and chat, authentication rejection during chat, and page reload. Assert that keys, transcript, graph, and active requests follow the documented cleanup rules. Verify that a result from the old session cannot affect a newly validated session. Assert that application storage and logging hooks never receive the credential.

Exit: cancellation and recovery cannot mix sessions, duplicate turns, or restore cleared state.

## 7. Validate complete user journeys

Use Playwright request routing to return provider-shaped fixtures and reject unexpected external requests in a small browser suite covering:

1. Fresh page → validate key → chat → receive valid architecture → inspect diagram → disconnect.
2. Rejected key → edit → retry → successful chat entry.
3. Valid credentials → model-access failure → actionable feedback with no false invalid-key message.
4. Successful diagram update → malformed update → warning with the prior diagram preserved.
5. Pending turn → stop or disconnect → delayed response ignored.

Check labels, focus movement from setup into chat, pending/error announcements, keyboard access, and wide/narrow viewport behavior. Run `@axe-core/playwright` accessibility checks and manually inspect focus visibility and graph usability.

Exit: the core journey works against provider-shaped responses without live network access.

## Completion checks

Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e`. Confirm that the build contains no embedded credentials and that documentation explains startup, model configuration, session-only credentials, and narrow-screen behavior. Record commands and results when implementation is delivered.

If the user elects to perform a live smoke test, use their key only in the running setup form and keep it out of test fixtures, command lines, screenshots, and reports. A manual provider check complements the mocked suite; it is not a CI requirement.
