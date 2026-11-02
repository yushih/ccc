# UI test-driven development plan

This plan implements `DESIGN.md`. Application implementation is a subsequent task; no tests or framework are installed by this documentation change.

## Method and test boundaries

For each slice below, write a behavioral test and observe it fail for the expected missing behavior, implement the smallest change that passes, then refactor. Commit-sized slices should leave the existing suite passing. Prefer assertions on visible behavior and provider contracts over internal component structure or snapshots.

Use unit tests for schema and state rules, component tests for form/chat behavior, and browser tests for layout and complete journeys. Mock the provider at the network boundary for browser tests and inject a fake adapter for focused component tests. Deny unexpected external network requests. Use fake credentials and deterministic deferred responses for race conditions; no live model calls in CI.

## 0. Establish implementation prerequisites

- Select the framework, graph library, test runner, and browser test tooling, checking their current documentation.
- Verify the current OpenAI credential-validation request, browser transport, supported model, and structured response format. Record the decisions in the design and application configuration.
- Define the architecture schema's allowed kinds, size limits, and normalized provider error categories.
- Add the minimum application and test harness under `/UI`, with scripts for development, type checking, unit/component tests, browser tests, and production build.
- Keep real credential verification optional and manual. If browser transport requires a relay, resolve its design before writing dependent integration code.

Exit: the harness runs a failing initial-render test, and provider contracts are concrete enough to mock accurately.

## 1. Render the two-panel shell

Write failing tests that initial load exposes the provider dropdown with OpenAI selected, masked key input, and confirmation button in order; chat is absent and the architecture empty state is present.

Implement the shell and setup form. Add a browser layout assertion comparing the conversation panel's measured width to 80 times the shell font size. At a wide viewport, assert that the diagram consumes the remaining width. At a narrow viewport, assert that both panels remain reachable through the specified horizontal overflow. Check independent transcript/diagram scrolling once transcript content exists.

Exit: initial content and both wide/narrow layout behaviors pass.

## 2. Validate credentials and gate chat

Write tests for blank input without a network call, trimmed submission, pending feedback, duplicate-submit prevention, successful transition to chat, and retry after failure. Table-test rejected credentials, network failure, rate limiting, and provider outage with their distinct safe messages.

Implement setup states and the adapter's credential-validation contract. Assert that credentials travel only in the designated authenticated request field, never in the URL or displayed error. Resolve a pending validation after disconnect/unmount and assert it cannot activate chat.

Exit: chat can be entered only after a successful validation response, with deterministic recovery paths for failures.

## 3. Add one complete conversation turn

Write tests for empty-message rejection, visible user content, pending assistant feedback, a successful assistant response, and the correct conversation/model passed to the adapter. Cover Enter, Shift+Enter, and IME composition. Verify that one active turn prevents a second concurrent send.

Implement transcript, composer, and nonstreaming turn handling. Test missing model configuration and a valid key without model access as separate failures. Verify malicious HTML in a response renders inertly.

Exit: a mocked architect turn works through the UI using the active session and configured model.

## 4. Define and validate architecture updates

Write unit tests for a valid graph, duplicate IDs, dangling edge references, unsupported node kinds, invalid revisions, and strings/collections exceeding the agreed limits. Include optional updates, an explicit empty graph, and malformed structured output.

Implement schema validation and atomic replacement. Test that stale base revisions and results from obsolete requests leave the current graph untouched. A valid update increments the local revision; no update preserves it. Invalid graph data must not discard otherwise valid assistant text.

Exit: all accepted graph data satisfies the contract, and rejected updates preserve the last accepted document.

## 5. Render and interact with the architecture

Write component/browser tests that a successful turn displays the expected nodes and connections, selection reveals details, and fit-to-view works. Exercise pan, zoom, dragging, and keyboard controls in browser tests where geometry matters. Assert that dragging does not alter semantic node or edge data.

Implement the graph view and accessible textual alternative. Test preservation of surviving node positions across updates and removal of selection when the selected entity disappears. Verify that labels and descriptions cannot inject active HTML.

Exit: the user can inspect and arrange a valid architecture with pointer and keyboard paths.

## 6. Complete cancellation, retry, and session cleanup

Write tests for stopping a pending turn, ignoring late results, retrying a failed turn without duplicating user messages, and retaining the last valid graph after a transient failure. Use controllable promises rather than timed sleeps.

Test disconnect during validation and chat, authentication rejection during chat, and page reload. Assert that keys, transcript, graph, and active requests follow the documented cleanup rules. Verify that a result from the old session cannot affect a newly validated session. Assert that application storage and logging hooks never receive the credential.

Exit: cancellation and recovery cannot mix sessions, duplicate turns, or restore cleared state.

## 7. Validate complete user journeys

Use network mocks in a small browser suite covering:

1. Fresh page → validate key → chat → receive valid architecture → inspect diagram → disconnect.
2. Rejected key → edit → retry → successful chat entry.
3. Valid credentials → model-access failure → actionable feedback with no false invalid-key message.
4. Successful diagram update → malformed update → warning with the prior diagram preserved.
5. Pending turn → stop or disconnect → delayed response ignored.

Check labels, focus movement from setup into chat, pending/error announcements, keyboard access, and wide/narrow viewport behavior. Run automated accessibility checks where supported and manually inspect focus visibility and graph usability.

Exit: the core journey works against provider-shaped responses without live network access.

## Completion checks

Run type checks, the relevant unit/component suite, the browser journey suite, and a production build. Confirm that the build contains no embedded credentials and that documentation explains startup, model configuration, session-only credentials, and narrow-screen behavior. Record commands and results when implementation is delivered.

If the user elects to perform a live smoke test, use their key only in the running setup form and keep it out of test fixtures, command lines, screenshots, and reports. A manual provider check complements the mocked suite; it is not a CI requirement.
