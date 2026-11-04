# Enterprise approvals and operations

[Entry](ENTRY.md) · [Threat model](threat-model.md) · [Validation](validation.md)

This page gives design requirements. Product-specific enforcement must be checked separately.

## Separate responsibilities

| Role | Intended power | Dangerous combination |
| --- | --- | --- |
| Requester | Propose a transaction. | Sole approval and signing authority |
| Approver | Review business intent and exact payload. | Ability to change approved bytes silently |
| Signer | Produce a signature after policy checks. | Unrestricted policy administration |
| Policy administrator | Propose limits and membership changes. | Immediate unilateral weakening of those limits |
| Recovery custodian | Participate in exceptional restoration. | Complete unmonitored recovery authority |
| Auditor | Read evidence and reconcile state. | Ability to change the only audit copy |
| Deployment operator | Release reviewed software. | Ability to replace every independent verifier |

A role name does not create separation. Check who can reset credentials or grant the role.
An approval group is meaningful only when distinct authorized members must approve.
Reject duplicate approvals from the same effective principal.

## Bind approval to a precise operation

Include chain, account, recipient, asset identifier, integer amount, calldata, fee bounds, replay scope, expiry, and policy version.
For a batch, include every call in order.
For a contract change, include the replacement code or implementation identity and resulting authority.

Store an immutable digest of the approved payload.
Any change that affects authorization must require new approval.
A friendly description is useful evidence but cannot replace the signed bytes.

A signed token permit can grant future spending authority without an immediate transfer.
[ERC-2612](https://eips.ethereum.org/EIPS/eip-2612) defines one such approval mechanism.
Treat messages, allowances, owner changes, and module changes as potentially value-bearing actions.

## Limits and concurrency

Specify per-transaction, rolling-window, and aggregate exposure limits where needed.
Use exact integer units for assets. Define decimals from verified asset metadata.
Reserve limit capacity atomically before releasing signatures.

Maintain reservations through uncertain broadcast results.
A timeout does not prove that a transaction failed or that its signature is unusable.
Reconcile pending transactions before releasing reservations or creating replacements.

A reset at midnight can allow two adjacent full limits. Document whether that behavior is acceptable.
If the limit uses a price feed, specify stale-price and feed-failure behavior.
Do not silently convert an unavailable price into an unlimited allowance.

## Enforcement boundaries

An off-chain rule controls only the signer or service that applies it.
A complete key export can bypass that rule.
A chain-enforced rule controls the relevant on-chain execution paths, subject to upgrades and alternate authorities.

Google Cloud's MPC overview states that enough signers can approve a transaction despite a denied transaction-policy result.
The policy verdict therefore differs from an unoverrideable on-chain restriction.
See the [product documentation](https://docs.cloud.google.com/multi-party-compute/overview).
Record override authority as part of the design.

## Audit evidence

Record request ID, payload digest, policy version, decision, authenticated approver, timestamps, signature identifier, and chain result.
Record rejected requests, membership changes, exports, recoveries, and privileged deployments.
Preserve evidence in storage that a signing administrator cannot silently rewrite.

Do not log private keys, shares, seed phrases, recovery secrets, bearer tokens, or decrypted backup content.
Public addresses and transaction metadata can still reveal sensitive business information.
Define access control, retention, and deletion rules for audit data.

Reconcile internal intent against chain state.
An RPC acceptance response is not finality. A successful outer transaction may need additional checks for the intended asset result.
[ERC-20](https://eips.ethereum.org/EIPS/eip-20) requires callers to handle a false return value.

## Incident response

1. Stop new signing requests through the affected path.
2. Identify the components that the attacker controls, including keys, shares, policy, and interfaces.
3. Preserve relevant evidence without copying secrets into logs.
4. Check pending signatures and transactions that remain executable.
5. Activate the reviewed replacement or evacuation procedure.
6. Revoke sessions, allowances, roles, or owners where supported.
7. Reconcile final chain state before resuming normal operation.

Stopping a server does not revoke a signature already released.
Changing a password does not revoke an exposed blockchain private key.
When an attacker controls complete spending authority, recovery often requires moving assets or replacing on-chain authority.

## Continuing operation

Schedule recovery rehearsals and review changes in employees, vendors, firmware, contracts, and network support.
Keep gas or fee resources available for emergency actions.
Document who can respond outside normal working hours.
A delay provides useful protection only when monitoring and response can act within it.
