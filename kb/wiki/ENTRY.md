# Cryptocurrency custody knowledge base

This wiki helps an architect select custody controls. It helps a builder turn those controls into a testable system.
Start with authority, failure, and recovery. Product names alone do not define security.

Research review date: **2026-11-05**. Product documentation can change. Check deployed versions before implementation.
The scope covers Bitcoin, Ethereum-compatible networks, and Solana. Other networks require a separate capability check.

## Rules for agents

1. Read [fundamentals](fundamentals.md) and the [threat model](threat-model.md).
2. Record user requirements with the [design contract](design-contract.md).
3. Check [chain capabilities](chain-capabilities.md) before selecting a technique.
4. Read every selected technique page, including its failure modes.
5. Enumerate all spending, recovery, export, and administration paths.
6. Apply the [composition method](composition.md).
7. Give the builder the [implementation contract](implementation.md) and [validation requirements](validation.md).

A recovery route is spending authority. A backup can bypass a device PIN or an approval service.
A signature can authorize theft without exposing a key. A valid signature does not prove informed consent.
More components can increase failure risk. Count independent control boundaries, not devices, accounts, or vendors.

Do not infer chain support from a shared curve name. Check the signature scheme, encoding, transaction format, and deployed verifier.
Do not describe an interface rule as a chain rule. State exactly where each rule operates and who can bypass it.

## Technique index

| Question | Load this page |
| --- | --- |
| What does a wallet control? What is custody? | [Fundamentals and terms](fundamentals.md) |
| Which network can enforce this design? | [Chain capabilities](chain-capabilities.md) |
| How can funds be stolen or become inaccessible? | [Threat model](threat-model.md) |
| How do seeds, passphrases, and shares work? | [Seeds and backups](seeds-and-backups.md) |
| What do hardware and offline wallets protect? | [Hardware and software signers](signers.md) |
| What do HSMs, cloud KMS, and enclaves protect? | [HSMs and enclaves](hsm-and-enclaves.md) |
| When should several keys approve a spend? | [Multisignature wallets](multisig.md) |
| Can several parties sign without assembling a key? | [MPC and threshold signatures](threshold-signatures.md) |
| Can a contract enforce limits or recovery? | [Smart accounts](smart-accounts.md) |
| What do passkeys, YubiKeys, and biometrics authorize? | [Authentication](authentication.md) |
| How do OAuth and social-login wallets hold keys? | [Embedded wallets](embedded-wallets.md) |
| How can owners recover, inherit, or delay access? | [Recovery and time locks](recovery-and-time-locks.md) |
| How do approval groups and audit controls work? | [Enterprise operations](operations.md) |
| How do the controls fit together? | [Composition and worked designs](composition.md) |
| Which vendor claims need verification? | [Product evaluation](products.md) |
| How does the architect specify a solution? | [Design contract](design-contract.md) |
| How does software request and produce signatures? | [Implementation](implementation.md) |
| How does the builder test safety and recovery? | [Validation](validation.md) |

## Evidence and limits

Technique pages link to specifications, official documentation, and original security research.
Statements marked **design analysis** explain consequences of those mechanisms. They are not vendor guarantees.
A specification defines a mechanism. It does not prove that a product implements that mechanism correctly.
An audit covers a stated scope and version. It does not prove that a deployment is secure.

The wiki uses short sentences and defined technical terms under the ASD-STE100 writing approach.
The official dictionary was not available for a complete lexical check. This wiki does not claim certified STE compliance.

Read the [research log](../LOG.md) for visited sources, access limits, and maintenance tasks.
This wiki is a design reference, not an audited signing implementation or jurisdiction-specific legal advice.
