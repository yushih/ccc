# Recovery, inheritance, and time locks

[Entry](ENTRY.md) · [Backups](seeds-and-backups.md) · [Composition](composition.md)

## Recovery mechanisms are different

| Mechanism | What it restores or changes | Authority consequence |
| --- | --- | --- |
| Seed restoration | Recreates existing keys. | Restored keys bypass the original device. |
| Secret-share recovery | Reconstructs a secret from a quorum. | Recovery holders can regain complete key authority. |
| Threshold participant replacement | Creates usable protocol shares. | Depends on the protocol and surviving participants. |
| Social recovery | Guardians authorize owner replacement. | Guardian policy becomes an alternate control path. |
| Delayed recovery branch | Another spend becomes valid after a time condition. | The delayed authority can act once conditions hold. |
| Inheritance procedure | Transfers practical access to successors. | Operational and legal identity checks can affect access. |

A recovery process must define both theft resistance and completion when the normal owner is unavailable.
A recovery design that always requires the lost key does not solve loss of that key.

## Social recovery

Guardians approve a change to the account's authorized owners or keys.
A contract can require a guardian threshold and a waiting period.
An off-chain service can instead release or reconfigure key material.
These designs have different enforcement boundaries.

**Applicability:** programmable accounts can implement owner replacement directly.
Bitcoin requires a pre-existing spending policy, a cooperative service, or a separate backup process.
Social relationships alone cannot change an existing Bitcoin output's script.

**Theft:** enough colluding guardians can satisfy the recovery rule.
Impersonation can persuade honest guardians to approve an attacker's replacement key.
Shared email recovery can compromise several guardians together.

**Lock:** too few surviving guardians, stale contacts, lost guardian keys, or a broken recovery module can block replacement.
An owner veto can prevent theft but can also let a compromised owner key block legitimate recovery.
The design must resolve that conflict explicitly.

**Composition:** separate guardians from routine signers when that separation improves the threat model.
Bind approvals to the account, new owner, chain, recovery nonce, and expiry.
Use independent notification and a tested response route.
Account extensions remain security-critical, as [Safe's module documentation](https://docs.safe.global/advanced/smart-account-modules) explains.

The [PSE social-recovery article](https://pse.dev/blog/social-recovery-sdk) was reachable only as a title in this research pass.
This wiki does not infer that SDK's features or deployment readiness from the title.

## Bitcoin absolute and relative locks

`CHECKLOCKTIMEVERIFY`, or CLTV, restricts a script branch until an absolute height or time condition is met.
`CHECKSEQUENCEVERIFY`, or CSV, supports relative age conditions with the corresponding transaction rules.
See [BIP-65](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki) and
[BIP-112](https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki).

A transaction's `nLockTime` alone delays that transaction. It does not stop an authorized signer from creating a different immediate transaction.
A script-enforced condition constrains the relevant spending branch.
Every alternate branch must be reviewed separately.

A relative lock starts from the relevant output's confirmation under the protocol rules.
It does not start from the owner's last website login.
Time-based locks use chain time rules, not a guaranteed wall-clock appointment.

**Theft:** an unprotected immediate branch can bypass a delayed branch.
**Lock:** wrong units, incompatible sequence flags, or an excessive delay can block the intended spend.
**Composition:** combine a normal quorum with a delayed recovery quorum when supported by tested wallet tooling.
Record the exact script and signing procedure. Do not translate illustrative Boolean policy directly into unreviewed script code.

## EVM queued operations

A timelock contract can require an operation to be scheduled before execution.
The delay gives observers time to react. The contract must actually control the protected action.
An administrator with a separate immediate route can defeat the intended delay.

OpenZeppelin's TimelockController separates proposer, executor, canceller, and administrator roles.
Losing required roles can lock the controlled system.
See [access control](https://docs.openzeppelin.com/contracts/5.x/access-control) and
[timelock API](https://docs.openzeppelin.com/contracts/5.x/api/governance).

Design analysis: protect delay changes and upgrades with comparable controls.
Test cancellation, rescheduling, duplicate execution, dependent operations, and role loss.
An emergency bypass improves availability but adds another theft path.

## Dead-man switches and inheritance

A dead-man switch grants authority after a defined absence of renewal or activity.
It detects a missing signal. It does not prove death or incapacity.
A stolen renewal credential can delay inheritance. A missed renewal can enable premature recovery.

Specify the signal, clock, renewal authority, grace period, recipient, and execution mechanism.
Ordinary smart contracts do not execute merely because time passes. A caller must submit the relevant transaction.
A service-based trigger also depends on service availability and policy.

For Bitcoin, refreshing a relative-lock inheritance design can require moving funds into new outputs.
A heartbeat in an unrelated application does not reset their age.
Pre-signed transactions introduce fee, input-conflict, and storage dependencies that need separate review.

## Delay budget and rehearsal

Choose a delay greater than the worst credible response time plus a safety margin.
Include detection, notification, human availability, key retrieval, fee preparation, and chain inclusion.
Do not choose a short delay from average response time alone.

Rehearse recovery with test assets and replacement devices.
Test owner incapacity, guardian loss, provider outage, expired credentials, and high fees.
Check the resulting authority after recovery. Revoke obsolete access where the protocol permits revocation.
See [validation](validation.md) for release criteria.
