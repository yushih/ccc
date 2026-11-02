See README.md for the purpose and the overarching structure of this project.

## Directory structure

- /UI is the UI of the architect and the builder.

- /kb is the solution space knowledge base used by agents.

## UI requirements

Follow `/UI/DESIGN.md` for the UI design and `/UI/TDD_PLAN.md` for the implementation and testing sequence.

## Development workflow

- Use test-driven development for UI behavior: write a failing behavioral test, implement the smallest working change, then refactor with tests passing.
- Mock provider responses in automated tests; do not require real API keys or paid API calls in CI.
- Keep provider-specific API behavior behind an adapter. Verify the current provider documentation when implementing API calls; do not invent endpoints or model identifiers.
- Keep loading, failure, cancellation, and recovery states explicit and accessible.

