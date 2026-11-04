# Smart accounts and programmable policy

[Entry](ENTRY.md) · [Recovery](recovery-and-time-locks.md) · [Implementation](implementation.md)

## Mechanism and applicability

A smart account uses contract code to check authority and execute actions.
The code can check owner quorums, passkeys, time conditions, or delegated permissions.
The account's security includes every execution and administration path.

**Applicability:** a target network must support the selected contracts and their verification operations.
EVM compatibility alone does not prove identical precompiles, deployed addresses, or service availability.
Record the chain ID, account address, implementation version, factory, and all extensions.

ERC-4337 defines a `UserOperation` workflow through bundlers and an EntryPoint contract.
An optional paymaster can sponsor fees. The account's validation code determines which operations it accepts.
ERC-4337 does not itself select a secure owner policy.
See [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337).

## Safe as a concrete example

Safe's base account uses an owner threshold. Extensions can add other behavior.
A module can initiate execution without the ordinary owner-confirmation flow.
A guard can reject transactions. A broken guard can therefore block access.
A fallback handler adds behavior for calls outside the core interface.

Sources: [account overview](https://docs.safe.global/advanced/smart-account-overview),
[modules](https://docs.safe.global/advanced/smart-account-modules),
[guards](https://docs.safe.global/advanced/smart-account-guards), and
[fallback handlers](https://docs.safe.global/advanced/smart-account-fallback-handler).

Design analysis: a “3-of-5 Safe” description is incomplete if an enabled module can spend alone.
Check which guards apply to each execution path in the deployed version.
Do not assume an ordinary transaction guard covers module transactions.
Enumerate owner changes, module changes, fallback changes, and implementation changes as authority-bearing actions.

## Session keys and spending limits

A session key delegates a restricted set of actions for a limited period.
Define the account, chain, permitted target, function, asset, amount, expiry, and replay protection.
A destination-only allowlist is insufficient if that destination accepts arbitrary calls.
A permitted router can forward value to another destination.

A spending limit needs precise accounting.
Define whether it counts native transfers, token transfers, approvals, swaps, fees, and batched calls.
Define the time window and how concurrent requests reserve capacity.
A token approval can create future transfer authority without an immediate balance change.

These are design requirements, not automatic properties of an account-abstraction standard.
Test every permitted call against the intended economic limit.
Include session revocation, outstanding requests, and emergency access in the design.

## Message signatures

ERC-1271 lets a contract report whether a signature is valid for that account.
Validation can depend on current state. An old off-chain validation result can become stale after owner or policy changes.
See [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271).

EIP-712 defines typed data hashing and domain separation. It does not supply replay protection by itself.
The consuming protocol must check nonces, deadlines, and the intended domain.
A typed display can improve comprehension but can still describe a harmful approval.
See [EIP-712](https://eips.ethereum.org/EIPS/eip-712).

## Attack surface and failures

**Theft:** faulty authorization, malicious modules, unsafe upgrades, signature replay, uninitialized accounts, or misleading batched calls.
An upgrade authority can replace enforcement code if the architecture grants that power.
A recovery authority can replace owners if its conditions permit that action.

**Lock:** a rejecting guard, lost owners, unavailable bundlers, paymaster refusal, insufficient fees, or broken upgrade logic.
Some service failures only block the normal interface. Others affect the only supported execution route.
Prove the alternative route with the exact account implementation.

**Composition:** use independent owner devices and a separate, delayed recovery path where appropriate.
Constrain modules to the smallest necessary authority.
Give policy changes protection comparable to transfers, because a policy change can enable a later transfer.

Do not deploy tutorial code as a custody system without a separate implementation review.
[Safe's fallback tutorial](https://docs.safe.global/advanced/smart-account-fallback-handler/smart-account-fallback-handler-tutorial) explicitly identifies its example as unaudited.
