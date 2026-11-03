# CCC single-page UI design

This document defines UI behavior and data contracts. See [../README.md](../README.md) for the project purpose and [../AGENTS.md](../AGENTS.md) for the code map, stack, commands, coding standards, and development procedures.

## Purpose and scope

CCC combines custody technologies around a user's requirements and resources. The architect agent gathers those requirements through conversation and diagrams and eventually produces a design specification for the builder agent.

The UI is a single-page web application in `/UI` for the architect and builder agents. It provides user-supplied model credentials, AI conversation, and a synchronized interactive architecture diagram. The LLM API key is a provider credential, not a custody key.

## Page layout

The application occupies the browser viewport and has two side-by-side panels:

| Panel | Width | Contents |
| --- | --- | --- |
| Conversation | `80em`, fixed rather than a percentage | Provider setup initially; chat after successful validation |
| Architecture | Remaining available width | Interactive nodes and connections describing the solution |

Use a grid with an `80em` first track and a flexible second track. Define `em` relative to the application shell's font size so the width is predictable. At a 16px shell font size, `80em` is 1280px. Each panel scrolls independently as needed; the composer remains available while the transcript scrolls.

Proposed narrow-screen behavior: give the diagram a minimum usable width of `24rem` and allow horizontal scrolling of the panel container when both tracks cannot fit. This preserves the specified `80em` panel rather than silently shrinking it. The minimum is an implementation default, not an original requirement. A stacked mobile layout or narrower conversation panel would require revisiting the width requirement.

The diagram panel is always present. Before there is a solution, show an empty-state explanation; do not invent a sample custody architecture that might be mistaken for the user's design.

## Setup and validation

The initial left panel contains only the setup form and its instructions or feedback:

1. A labeled provider dropdown, initially containing and selecting OpenAI.
2. A labeled masked API-key input with autocomplete and spellchecking disabled.
3. A confirmation button beneath the fields.

Reject an empty or whitespace-only key locally. Do not enforce a particular key prefix. Trim surrounding whitespace before validation. On confirmation, take a snapshot of the submitted credentials, disable duplicate submissions and field edits, and expose a visible and screen-reader-accessible validating state.

The OpenAI adapter makes a minimal documented authenticated request that does not generate conversation content. The adapter uses `GET https://api.openai.com/v1/models` with Bearer authentication. A key restricted from listing models receives a permission error. Browser compatibility must also be checked from the deployed origin. A successful response establishes credential validity for that request; it does not prove permission, quota, or availability for every model.

On success, store the active provider session in memory, clear the setup form's copy of the key, and replace the form with chat. On failure, keep the form and permit retry. Differentiate rejected credentials from network/CORS problems, rate limiting, and provider outages; do not call all failures an invalid key. Display safe, actionable error messages rather than raw provider error bodies.

## State and session lifecycle

| State | UI and permitted transitions |
| --- | --- |
| `setup.idle` | Editable setup; valid local input can start validation |
| `setup.validating` | Pending feedback; success enters `chat.ready`, failure enters `setup.error` |
| `setup.error` | Safe error text and editable fields; resubmission retries validation |
| `chat.ready` | Transcript, composer, and disconnect action; a nonempty message starts a turn |
| `chat.responding` | Pending assistant feedback and stop action; block another turn until completion or cancellation |
| `chat.error` | Preserve transcript and draft; show recovery actions appropriate to the error |

Use request identifiers and cancellation signals so late results cannot restore a disconnected session or overwrite a newer turn. Stopping a turn returns to ready without committing an unfinished assistant response or diagram update. Disconnect clears the key, transcript, diagram, and pending work and returns to setup. Reload also starts a new setup session; session data is not persisted.

An authentication rejection during chat invalidates the session and returns to setup with a safe explanation. Clear the session's transcript and diagram consistently with disconnect. Other failures preserve the conversation and architecture and allow retry; retries must not duplicate the user's transcript message.

## Chat behavior

After validation, show the active provider, an empty transcript with a short architect introduction, a labeled multiline composer, a send button, and a disconnect action. The introduction is local UI copy, not a fabricated model response. Send submits nonempty content; Enter sends and Shift+Enter inserts a newline, while IME composition must not accidentally submit.

The architect asks about requirements and resources and explains the proposed solution. Each turn sends the relevant conversation and current accepted architecture through the provider adapter. Responses are delivered as complete messages. Present pending feedback immediately.

The setup dropdown chooses a provider, not a model. Keep the model identifier in explicit application configuration. Configure it with `VITE_OPENAI_MODEL`; `.env.example` uses `gpt-6-luna`, which supports structured output. The adapter uses `POST /v1/responses` with `text.format` set to a strict JSON schema and `store: false`. See the official [models endpoint](https://developers.openai.com/api/reference/resources/models/methods/list), [structured output guide](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses), and [model documentation](https://developers.openai.com/api/docs/models/gpt-6-luna). Missing configuration must produce a clear configuration error. A valid key with no access to that model produces a model-access error during chat, not a claim that the key is invalid.

Messages are displayed as plain text with whitespace preserved. Chat does not authorize tools to deploy infrastructure or sign transactions.

## Architecture representation and interaction

The serializable architecture document has this shape:

```text
ArchitectureDocument
  revision: nonnegative integer
  nodes: [{ id, kind, label, description }]
  edges: [{ id, source, target, label }]
```

IDs must be unique within their collection; edges must reference existing nodes; strings and collection sizes must have documented bounds. Node kinds come from an explicit allowlist suitable for the architect domain. Allow node kinds `person`, `wallet`, `device`, `service`, `policy`, and `backup`. Limit a document to 100 nodes and 200 edges, IDs to 80 characters, labels to 120 characters, and descriptions to 2,000 characters. IDs and node labels must be nonempty. Selection, viewport, and dragged positions are local presentation state, not architectural meaning.

Support pan, zoom, fit-to-view, selecting nodes or edges to inspect details, and dragging nodes to arrange the view. Provide accessible controls and a keyboard-operable textual node/connection list so the diagram's meaning is available without a pointer. The user requests semantic changes to nodes and connections through chat.

Use a provider-independent turn result containing assistant text and an optional full architecture replacement, together with the revision on which it is based. A replacement is acceptable only when its schema is valid, the request is still current, and its base revision matches the accepted document. Commit the complete document atomically and increment the local revision. Preserve positions for surviving node IDs and lay out new nodes. An empty replacement is valid only as an explicit update, not as the default for missing data.

If an architecture update is malformed or stale, retain the last valid diagram and show a recoverable warning alongside any valid assistant text. A response without an update leaves the diagram unchanged. Do not parse arbitrary prose as executable graph commands. Structured-output support and encoding belong in the provider adapter and must be verified for the chosen model.

## Agent integration

Knowledge retrieval and the final builder specification contract require separate designs.

## Credential and network boundary

The transport calls the provider directly from the browser. Setup copy must explain that the key is accessible to browser code and is sent to OpenAI. Serve the deployed app over HTTPS and avoid third-party analytics or scripts that could capture credentials. Credential-handling standards are defined in `../AGENTS.md`.

Verify the chosen request works from the deployed browser origin before committing to this transport. If provider restrictions require a backend relay, revise this design to specify its authentication, credential retention, and deployment boundary before implementing it. Do not introduce a shared server key as a silent fallback.

## Acceptance criteria

- Initial load shows the specified setup form on the left and an empty diagram on the right.
- The left panel measures `80em`; the diagram fills the remainder when space permits, with the documented overflow behavior on smaller screens.
- Only successful credential validation replaces setup with chat; all failure categories can be understood and retried.
- A conversation turn uses the user's active provider credentials and configured model, displays the response, and can apply a valid architecture update.
- Invalid or stale updates never corrupt the accepted architecture; cancellation and disconnect ignore late results.
- Diagram interactions and keyboard alternatives work without changing solution semantics.

See `TDD_PLAN.md` for the sequence that turns these criteria into executable tests.
