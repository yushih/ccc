# Composition and worked designs

[Entry](ENTRY.md) · [Threat model](threat-model.md) · [Design contract](design-contract.md)

The examples below are design analyses. They are not audited deployment recipes.
Select concrete implementations only after compatibility and recovery tests.

## Method

1. List every way to spend, export, recover, replace owners, or change policy.
2. Express each path as required authorities and conditions.
3. Join alternate paths with OR.
4. Replace nominal authorities with their real control dependencies.
5. Find the smallest compromise sets and permanent-loss sets.
6. Check transaction understanding on every normal signing path.
7. Check time and availability assumptions on every recovery path.
8. Remove complexity that provides no independent protection.

An AND requires several conditions. An OR adds another sufficient route.
A threshold protects only the paths that actually require that threshold.
Backup holders and upgrade administrators must appear in the same analysis as normal signers.

## Example 1: hardware and phone, with a cold fallback

The skeleton proposes a hot route requiring a hardware wallet and a phone, plus an independent cold laptop route.
Its authority is `(hardware AND phone) OR laptop`.

Compromise of the laptop alone can authorize a spend.
The hot route resists one-device compromise, but that does not raise the cold route's threshold.
Keeping the laptop offline reduces exposure. It does not change its unilateral authority.

A possible revision adds a separate recovery authority and delay:
`(hardware AND phone) OR (recovery_A AND recovery_B AND elapsed_delay)`.
This changes availability, cost, and monitoring requirements.
The chain or deployed contract must enforce the expression. A coordinator setting cannot substitute for that enforcement.

For Bitcoin, test the exact script and all Taproot paths.
For EVM accounts, inspect modules and upgrade authority.
See [time locks](recovery-and-time-locks.md) and [chain capabilities](chain-capabilities.md).

## Example 2: individual Bitcoin reserves

Assume the owner can manage three independent keys and accepts manual signing.
Use a tested 2-of-3 script policy, independent hardware devices, and separate backup locations.
Keep a watch-only coordinator with a complete public descriptor.

Normal spending needs two keys. Loss of one key leaves two usable keys.
Theft of one key alone does not satisfy the script.
Two backups stored together would defeat the intended separation.

A malicious coordinator can still deceive both signers or substitute a policy during enrollment.
Check wallet policy and receive addresses independently.
Rehearse recovery with one device unavailable and replacement coordinator software.

Tradeoffs include device cost, descriptor management, travel, and transaction fees.
For a user unable to maintain these procedures, added complexity can increase permanent-loss risk.
[Sparrow's guidance](https://sparrowwallet.com/docs/best-practices.html) supports independent devices and locations.

## Example 3: limited daily spending and separate reserves

Assume the user needs convenient daily transactions but can tolerate a manual reserve transfer.
Keep a bounded amount in a hot account. Keep reserves under a separate independent quorum.

Hot-account compromise then exposes the hot balance and any additional delegated authority.
Automatic replenishment can defeat the balance cap if the attacker repeatedly drains and triggers refill.
Require reserve approval or a separately enforced aggregate replenishment limit.

Do not grant the hot account unlimited allowances over reserve assets.
ERC-20 allowances authorize later `transferFrom` calls.
See [ERC-20](https://eips.ethereum.org/EIPS/eip-20).

This design reduces expected exposure through separation of assets.
It does not make the hot signer itself more resistant to key theft.

## Example 4: enterprise EVM treasury

Assume multiple staff members approve operations and the organization can maintain contract and recovery procedures.
Use a reviewed smart account with an independent owner quorum.
An HSM or threshold service can implement one owner when chain compatibility is proven.

Use an application workflow for business approval, but bind the final owner signatures to exact transaction bytes.
Restrict routine delegation by asset, target, amount, and expiry.
Require comparable control for policy changes, modules, recovery, and upgrades.

Check whether contract owners can bypass service-level spending limits.
Check whether a module bypasses owners.
Check whether one identity administrator can reset a quorum.
[Safe's module model](https://docs.safe.global/advanced/smart-account-modules) demonstrates why these checks matter.

Failure recovery must work without the normal coordinator and at least one planned service dependency.
Test the direct or alternate execution route, including fees and contract state discovery.

## Example 5: consumer embedded wallet

Assume low-friction login is important and an independent recovery factor is practical.
Use a documented SDK variant with explicit factor locations and tested recovery.
Determine whether signing reconstructs the key in application memory.

Social login plus a backup in the same identity account may not provide independent factors.
A separate guardian or hardware factor can reduce this shared dependency.
A contract limit can bound damage only when every relevant path honors the limit.

Document provider shutdown behavior and account export.
MetaMask's [SSS architecture](https://docs.metamask.io/embedded-wallets/infrastructure/sss-architecture/) illustrates why SDK variants matter.

## Avoid false independence

| Apparent protection | Shared failure that can defeat it |
| --- | --- |
| Three keys in three cloud regions | One cloud administrator can operate all three. |
| Two hardware wallets | Both restore from the same seed. |
| Passkey plus email recovery | The email account restores the synchronized passkey. |
| MPC plus emergency export | One administrator can reconstruct and export the complete key. |
| Owner quorum plus recovery module | The module has a weaker independent spend path. |
| Cold storage plus strong PIN | An unencrypted backup remains available to an attacker. |
| Several approvers | All approve labels from one compromised decoder. |

The correct number of layers depends on independent failure coverage and operational capacity.
Do not maximize component count as a security objective.
