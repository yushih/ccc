# Product evaluation and evidence

[Entry](ENTRY.md) · [Design contract](design-contract.md) · [Validation](validation.md)

Review date: 2026-11-05. This page records examples, not endorsements or a complete market ranking.
Product support, pricing, availability, and SDK behavior require a fresh check before implementation.

## Examples from the research hints

| Product or interface | Documented role | Boundary that requires verification |
| --- | --- | --- |
| Sparrow | Bitcoin coordinator with hardware and offline signing workflows | Exact script support, descriptor recovery, and device interoperability |
| Safe | EVM account with owner thresholds and extensions | Modules, guards, fallback handlers, deployed version, and administration |
| MetaMask Embedded Wallets | Identity-linked wallet SDKs with SSS and TSS variants | Key reconstruction, factor recovery, export, and selected SDK |
| Google Cloud Multi-party Compute | Managed threshold signing and governance | Preview status, algorithm availability, override authority, and exit |
| YubiKey | Hardware authentication and model-specific cryptographic interfaces | Algorithm, firmware, RP scope, PIN policy, and replacement |
| Ledger Seed Tool | Backup verification and secret-sharing workflow | SSKR format, device support, and independently tested restoration |
| AWS KMS | API-based signing with documented key types | Algorithm mode, digest handling, IAM, deletion, and service dependence |

Sources: [Sparrow](https://sparrowwallet.com/docs/connected-wallet.html),
[Safe](https://docs.safe.global/advanced/smart-account-overview),
[MetaMask](https://docs.metamask.io/embedded-wallets/infrastructure/),
[Google Cloud](https://docs.cloud.google.com/multi-party-compute/overview),
[Yubico](https://docs.yubico.com/hardware/yubikey/yk-tech-manual/yk5-apps-piv.html),
[Ledger](https://support.ledger.com/article/Seed-tool), and
[AWS](https://docs.aws.amazon.com/kms/latest/developerguide/symm-asymm-choose-key-spec.html).

Google's retrieved overview labels the product Preview and describes a v1beta API transition.
It lists Ed25519/Solana support as coming soon in its algorithm table.
Do not treat a roadmap entry as available production support.
Its policy description also permits signer-quorum override of a negative transaction verdict.

Google's [architecture page](https://docs.cloud.google.com/multi-party-compute/architecture) describes worker TEEs and separate coordination components.
This is a vendor description. Independent deployment evidence remains necessary for a custody decision.

Ledger's [Seed Tool article](https://www.ledger.com/blog/seed-tool-app) identifies an SSKR-based workflow.
Do not assume interoperability with SLIP-39 because both use Shamir sharing.
Do not equate the local Seed Tool workflow with a hosted recovery service.

## Required evidence before selection

1. Exact supported networks, signature schemes, transaction types, and versions.
2. A diagram showing every key, share, complete-key copy, and administrator.
3. Independent audits with scope, version, findings, and remediation evidence.
4. A demonstration of normal signing and each recovery route.
5. Export formats and a working independent restore tool where the provider claims portability.
6. Behavior during identity loss, service outage, regional outage, and provider shutdown.
7. Patch policy, supported lifetime, and incident notification procedures.
8. Contract addresses and code hashes for every network deployment.
9. Cost and latency under the required approval workflow.
10. Terms affecting access, data location, and operational support.

A protocol paper does not prove a product's implementation.
An audit of a library does not cover an application's recovery workflow.
A public repository does not prove that a hosted service runs that version.

## Evaluation record

For each candidate, record the claim, source URL, retrieval date, tested version, observed result, and unresolved dependency.
Use `verified`, `documented-only`, `failed`, or `unknown` as evidence status.
Do not turn `unknown` into `supported` during design generation.

The research hints also name Fireblocks, Zengo, Safeheron, Coinbase, Vultisig, and other providers.
This wiki covers their relevant technology families. It does not assert current feature parity or audit status for those products.
Evaluate any selected product with the same evidence requirements.
