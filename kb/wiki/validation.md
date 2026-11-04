# Validation and release evidence

[Entry](ENTRY.md) · [Threat model](threat-model.md) · [Design contract](design-contract.md)

These requirements apply to a custody implementation built from the wiki.
They do not claim that this documentation already implements or passes those tests.

## Test method

Use fake credentials, deterministic fixtures, local chains, and test assets for automated tests.
Block unexpected external requests.
Observe a behavioral test fail before implementing the corresponding control.
Do not put real seeds or private keys in fixtures, logs, screenshots, or model prompts.

Use published cryptographic vectors and independent verification where practical.
For example, [BIP-340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki) supplies exact signature requirements.
The test target is the selected implementation, not a simplified imitation of its protocol.

## Required scenarios

| Property | Test | Required evidence |
| --- | --- | --- |
| Payload binding | Change recipient, amount, calldata, or chain after approval. | Old approval cannot authorize the new payload. |
| Quorum | Submit duplicate, missing, unauthorized, and colluding participant sets. | Only intended sets satisfy the policy. |
| Replay | Reuse signatures across accounts, chains, sessions, and expired operations. | Invalid replay scopes fail. |
| Nonce durability | Crash and restore around threshold-signing rounds. | Consumed signature nonce material never returns to use. |
| Backup recovery | Restore with the required factors on replacement hardware. | Expected addresses and a test spend match. |
| Loss tolerance | Remove each failure set that the design claims to tolerate. | Normal or recovery operation completes within its target. |
| Theft tolerance | Compromise one component and its administrative dependencies. | The attacker cannot exceed the stated authority. |
| Policy limits | Submit concurrent requests and boundary-time requests. | Aggregate permitted exposure remains within the defined limit. |
| Contract paths | Exercise modules, guards, upgrades, recovery, and direct execution. | No path silently bypasses the specified restrictions. |
| Passkey validation | Change challenge, origin, RP ID, flags, credential, and signature. | Invalid assertions fail under the selected policy. |
| Identity recovery | Reset login credentials and replace a device. | Recovery does not grant unintended authority. |
| Service outage | Disable provider, identity service, RPC, bundler, or coordinator. | Documented fallback works or the limitation is explicit. |
| Chain disruption | Simulate expiry, high fees, reorganization, and uncertain submission. | No accidental duplicate payment or false finality. |
| Secret handling | Inspect logs, storage, errors, and exported diagnostics. | Only authorized protected storage contains secret material. |
| User verification | Inspect device displays and keyboard-accessible approval flows. | The user can identify and reject the exact requested action. |

Protocol-specific tests must include malformed inputs, size limits, invalid points, and invalid proofs where applicable.
Failure handling must not reveal secret data or weaken the quorum to complete a request.

## Chain-specific checks

For Bitcoin, test receive and change derivation, descriptor restore, PSBT compatibility, fees, and every script branch.
Test lock boundaries just before and after maturity.
Check that an unintended Taproot key path cannot bypass the intended policy.

For EVM accounts, inspect deployed bytecode, implementation identity, owners, thresholds, modules, guards, and upgrade authorities.
Test token approvals, permits, batch calls, delegated calls, and recovery interactions.
Check alternative submission when the normal bundler or service is unavailable.

For Solana, test exact serialized messages, account permissions, instruction order, transaction expiry, and supported durable-nonce behavior.
Check that the relevant program enforces the intended asset authority.
See [Solana partial signing](https://solana.com/docs/core/transactions/partial-signing).

## Recovery rehearsal

1. Begin with a complete inventory of test accounts and known addresses.
2. Make the planned failed device or service unavailable.
3. Retrieve only the factors that the procedure permits.
4. Restore the wallet or replace the authorized signer.
5. Check addresses and authority before signing.
6. Complete a test transfer under the recovered policy.
7. Record elapsed time, unexpected dependencies, and operator mistakes.
8. Update the procedure and repeat the failed portion.

A successful login is not a successful wallet recovery test.
A restored balance display is not proof that the system can spend.
Use an actual test transfer to demonstrate usable authority.

## Release record

Record software and firmware versions, contract addresses, code hashes, tested networks, test results, audit scope, and unresolved risks.
Require independent review of all spending and administration paths.
Require explicit resolution of unknown key ownership, unsupported cryptography, and untested recovery before funding.

Fund gradually according to an approved operating procedure.
Monitor the first transactions and repeat recovery checks after material changes.
Keep live-key exercises separate from automated tests and documentation generation.
