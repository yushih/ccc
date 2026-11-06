export const architectureContext = (revision: number) => `The application's accepted architecture revision is ${revision}. Use this baseRevision for any architecture update. Previous proposals may have been rejected.`

// Persistent architect guidance, supplied separately on every turn.
export const ARCHITECT_INSTRUCTIONS = `
You are a crypto custody solution expert. Now you are working with the user to design a custodial solution.

Return only the requested structured JSON object with message and architecture fields. Set either field to null when it is not needed; at least one must be non-null.
message is { "html": "..." }: user-facing HTML, not Markdown. Use only p, br, ul, ol, li, strong, em, code, pre, blockquote, and a tags. Links must use absolute https:// or http:// URLs. Do not include scripts, styles, images, forms, embedded content, or event handlers.
architecture is a complete replacement { "baseRevision": number, "nodes": [...], "edges": [...] }, not a patch. Use the accepted revision supplied in the latest application context, not a revision inferred from previous proposals. Null leaves the diagram unchanged. Empty nodes and edges explicitly clear it. A diagram-only response is allowed; never invent filler text.

Design the solution with the user. Use user expertise in crypto custody. Also reference the custodial wiki supplied in the opening context.

Let the user clear know the characteristics of the design, specifically:
1. under what conditions the assets are going to be unrecoverably locked
2. under what conditions the assets are going to be stolen
For example, if the solution is a single hardware wallet, then the assets are locked if the device malfunctions and there is no available seed phrase backup. The assets will be stolen if the physical device, its locking PIN and the extra BIP39 passphrase (if supported by the device and used) are taken, or the device is implanted (show links to news), or the backup seed phrase is leaked and there is no BIP39 extra passphrase.

Ask user if she/he is personal user or a corporate one. Offer the latter enterprise governance solutions that enable teams to operate cooperatively and safely.

Ask the user if she/he needs Shamir backup when applicable. Offer a concise explanation of what it is and let the user ask for more details if desired.

Gauge the user's level of cryptographic, computer system and security knowledge during the conversation. Adjust the style of languages you use accordingly.

`

// Hidden opening context; retained in conversation history as reference material.
export const INITIAL_PROMPT = `Start by gathering requirements and available resources.

The custodial wiki begins here:

---
ENTRY.md
---
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
---
authentication.md
---
# Passkeys, YubiKeys, biometrics, and IAM

[Entry](ENTRY.md) · [Embedded wallets](embedded-wallets.md) · [HSMs](hsm-and-enclaves.md)

## Authentication is not spending authority

Authentication proves control of a credential to a verifier.
The verifier then applies authorization rules.
A passkey used to log into a signing service does not itself establish the service's blockchain spending policy.
Identify the actual chain key and every route that can use it.

## WebAuthn and passkeys

WebAuthn registers a public-key credential scoped to a relying party, identified by an RP ID.
An authentication assertion signs authenticator data and a hash of client data.
The client data binds the ceremony to a challenge and origin.
See [WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/).

**Applicability:** passkeys can authenticate users to chain-independent software.
A compatible smart account can check a WebAuthn assertion as authorization.
Ordinary Bitcoin and Ethereum EOA signing require different transaction-signature handling.
A common P-256 passkey is not a secp256k1 blockchain key.

| Pattern | Where the chain key exists | Main boundary |
| --- | --- | --- |
| Passkey authenticates to a service | Service, HSM, or enclave | Service policy and account recovery |
| Passkey unlocks encrypted local material | Local software after decryption | Browser or operating-system integrity |
| Passkey authorizes a threshold participant | Distributed protocol participants | Share access and protocol policy |
| Smart account verifies WebAuthn | Credential key stays with its authenticator | Contract verifier and recovery policy |

The WebAuthn PRF extension can supply credential-associated output for key protection in supported implementations.
It is not ordinary extraction of the credential private key.
If software decrypts a blockchain key with that output, the decrypted key still enters that software's trust boundary.
Check extension support and recovery across the intended authenticators.

## Verification requirements

Use a reviewed WebAuthn verifier. Apply the standard's complete validation procedure.
At minimum, the design must account for these checks:

1. Match the registered credential and public key.
2. Check the ceremony type, challenge, origin, and RP ID hash.
3. Check user-presence and required user-verification flags.
4. Check the signature over the exact required data.
5. Apply appropriate counter and backup-state handling.
6. Reject a consumed or expired authorization challenge.

For spending, bind the challenge to the exact operation, account, chain, and replay scope.
A generic successful login must not silently authorize an unrelated transfer.
An authenticator touch or biometric prompt does not necessarily display the transaction's economic effect.

A P-256 precompile only performs a cryptographic verification primitive.
[EIP-7951](https://eips.ethereum.org/EIPS/eip-7951) does not replace origin, challenge, flag, or replay checks.
Check deployed support and full assertion validation separately.

## Device-bound and synchronized credentials

A device-bound credential depends on its authenticator's availability and replacement procedure.
A synchronized credential also depends on the synchronization provider and its recovery controls.
Several credentials restored through one cloud account may share one compromise path.

**Theft:** compromised client code can request harmful actions. Weak account recovery can restore credentials to an attacker.
**Lock:** lost authenticators, inaccessible synchronization accounts, changed RP domains, or missing credential metadata can prevent authorization.
Register and test an independent recovery factor before relying on one device.

## YubiKey and other security keys

A YubiKey can provide FIDO authentication and, on supported models, PIV cryptographic operations.
These are different interfaces with different keys and access rules.
PIV algorithm support depends on firmware. Yubico lists P-256, P-384, RSA, and newer Ed25519 support for specific versions.
Do not assume secp256k1 support.
See [YubiKey PIV specifications](https://docs.yubico.com/hardware/yubikey/yk-tech-manual/yk5-apps-piv.html).

A security key often authenticates a person to custody software rather than signing the chain's transaction directly.
A device touch proves interaction, not informed approval of a recipient and amount.
Treat PIN, touch policy, management keys, reset behavior, and spare credentials as separate configuration decisions.

**Composition:** use hardware credentials for administrator and approver authentication.
Keep a separate transaction-verification path and independent recovery control.
Two keys assigned to one person improve availability but do not create two independent human approvers.

## Biometrics

A fingerprint or face check commonly unlocks a local credential.
It is not normally the blockchain private key or a chain-verifiable identity proof.
WebAuthn can report user verification without disclosing the biometric to the relying party.

Design analysis: evaluate false acceptance, sensor spoofing, coercion, device fallback PINs, and recovery.
Biometric injury or sensor failure can block access. A fallback can also weaken the intended control.
Do not derive wallet entropy directly from biometric measurements. Biometrics are neither stable secret strings nor replaceable passwords.

## Identity and access management

IAM defines which authenticated principals can invoke operations or change policy.
Apply least privilege to signing, recovery, enrollment, export, deployment, and administration.
An administrator who can reset several approvers may control the effective quorum.

Document each role's recovery path. Log privileged changes outside the administrator's sole control.
Use independent approval for changes that can create signing authority.
See [enterprise operations](operations.md) for separation of duties and audit records.
---
chain-capabilities.md
---
# Chain capabilities

[Entry](ENTRY.md) · [Implementation](implementation.md) · [Product evaluation](products.md)

## Compatibility layers

Check five layers: curve, signature scheme, message encoding, account rules, and available tooling.
Two systems can use the same curve and still reject each other's signatures.
An address on one network does not prove that the same account policy exists on another network.

| Network or account | Normal authorization | Composition options | Main constraints |
| --- | --- | --- | --- |
| Bitcoin legacy and SegWit v0 | secp256k1 ECDSA under script rules | Script multisig, CLTV, CSV, compatible threshold ECDSA | Preserve scripts and derivation metadata. Check signer support. |
| Bitcoin Taproot | BIP-340 Schnorr and optional script paths | MuSig2, compatible threshold Schnorr, Tapscript policies | Generic Schnorr or FROST is not sufficient evidence of BIP-340 compatibility. |
| Ethereum EOA | secp256k1 ECDSA transaction authority | Hardware, software, HSM, compatible threshold ECDSA | Off-chain approval policy is invisible to the chain. |
| EVM smart account | Deployed contract validation | Owner quorums, recovery, limits, passkeys, ERC-4337 | Code, modules, upgrades, and every alternate path define authority. |
| Solana ordinary signer | Ed25519 signature over a transaction message | Compatible threshold EdDSA, hardware or software signing | Exact message bytes and transaction lifetime matter. |
| Solana program-controlled account | Program logic controls its permitted actions | Program multisig and recovery | Program version, authorities, and upgrade control matter. |

Bitcoin specifications: [BIP-340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki),
[BIP-341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki), and
[BIP-327](https://github.com/bitcoin/bips/blob/master/bip-0327.mediawiki).
Contract accounts: [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337).
Solana: [transaction structure](https://solana.com/docs/core/transactions/transaction-structure).

## Bitcoin details

Bitcoin spends unspent transaction outputs, called UTXOs. Each output commits to a spending condition.
Changing a wallet's configuration does not change conditions on existing outputs.
Rotation usually requires a transaction to new outputs under the replacement policy.

A script can require several signatures or make a branch available after a time condition.
A Taproot key path can coexist with script paths. Every path must satisfy the intended security model.
An unsafe key path can bypass a carefully designed recovery script.
See [BIP-341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki).

Preserve descriptors, key origins, derivation paths, receive branches, and change branches.
Private keys alone do not fully describe a wallet's output scripts.
[BIP-380](https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki) explains this recovery problem.

## EVM details

An ordinary EOA does not gain chain-enforced approval groups because a service requires several employees to click approve.
A contract account can enforce a quorum, but its modules or upgrade administrator can introduce different authority.
Inspect the exact contract state, not only the application interface.
See [Safe account architecture](https://docs.safe.global/advanced/smart-account-overview).

EIP-7702 lets an EOA authorize code delegation. The original key remains a critical authority for changing that delegation.
Do not assume that contract validation removes the original key's power.
Review initialization, replay scope, storage, and delegate replacement under [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702).

A P-256 precompile can reduce verification cost for compatible smart accounts.
[EIP-7951](https://eips.ethereum.org/EIPS/eip-7951) specifies this operation. It does not itself implement WebAuthn validation.
Check activation on the target network with known valid and invalid vectors.
Do not infer activation from the presence of the proposal or a deployment on another chain.

## Solana details

Multiple transaction signatures do not automatically create a general asset multisig.
The relevant program must require those authorities for the action.
Token authorities also differ from ownership of native SOL.
Check the program and [authority type](https://solana.com/docs/tokens/basics/set-authority) for each asset operation.

Changing the blockhash, account list, fee payer, or instruction data invalidates existing signatures.
Use a supported durable-nonce workflow when offline approval exceeds the ordinary transaction lifetime.
The nonce authority and nonce consumption become part of custody operations.
See [partial signing](https://solana.com/docs/core/transactions/partial-signing).

## Assets and networks outside the matrix

For another chain, identify the verifier, account model, replay rules, key derivation, and recovery tooling before selecting products.
For bridges and wrapped tokens, identify the bridge's separate signing or contract authority.
For staking, identify withdrawal authority separately from operational validator keys.
These are design checks, not claims of universal support.
---
composition.md
---
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
Its authority is \`(hardware AND phone) OR laptop\`.

Compromise of the laptop alone can authorize a spend.
The hot route resists one-device compromise, but that does not raise the cold route's threshold.
Keeping the laptop offline reduces exposure. It does not change its unilateral authority.

A possible revision adds a separate recovery authority and delay:
\`(hardware AND phone) OR (recovery_A AND recovery_B AND elapsed_delay)\`.
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
ERC-20 allowances authorize later \`transferFrom\` calls.
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
---
design-contract.md
---
# Architect-to-builder design contract

[Entry](ENTRY.md) · [Composition](composition.md) · [Implementation](implementation.md)

This is a proposed knowledge-base contract. It is not a schema already implemented in the CCC interface.
The architect must resolve material unknowns before the builder deploys custody controls.
Never include private keys, shares, seed phrases, or credential values in this document.

## User requirements

| Field | Required content |
| --- | --- |
| Assets | Chain, network, asset contract or mint, native balance, and protocol positions |
| Exposure | Maximum acceptable loss and reserve allocation |
| Operations | Frequency, transaction types, fee budget, and signing latency |
| People | Approvers, technical skills, availability, and succession requirements |
| Resources | Devices, secure locations, cloud services, and operating budget |
| Availability | Tolerated outage duration and recovery completion target |
| Threats | Malware, physical theft, coercion, insider collusion, and provider failure assumptions |
| Constraints | Privacy, accessibility, travel, organizational, and legal review requirements |

Describe user capabilities realistically. A procedure that the user cannot maintain is not a working control.
Record rejected alternatives and the concrete reason for rejection.

## Authority specification

For each asset location, provide:

1. Normal spending conditions.
2. Recovery and inheritance conditions.
3. Key export conditions.
4. Owner, module, policy, and implementation change conditions.
5. Administrative credential-reset conditions.
6. Minimal compromise sets and permanent-loss sets.
7. Every enforcement location and permitted override.

Give each authority a stable identifier.
Map it to the actual person, device, service, backup location, and administrator.
State which authorities share a failure domain.

## Component record

Use this template for each component:

\`\`\`yaml
id: signer_A
role: independent owner signer
implementation: selected product and exact version
network: explicit chain and network
key_scheme: exact curve and signature scheme
secret_reference: protected inventory reference only
controller: person or organization identifier
administrators: explicit identifiers
failure_domains: explicit identifiers
inputs: accepted formats and authenticated callers
outputs: signature or public metadata only
policy_enforcement: exact local or chain checks
backup: format and protected location reference
recovery: procedure identifier
exit: provider-independent procedure or explicit limitation
evidence: source URLs and test record identifiers
status: verified or documented-only or unknown
\`\`\`

Replace every descriptive placeholder before implementation.
Unknown chain support, recovery authority, or key ownership is a blocking design issue.

## Transaction and recovery contracts

Define the exact approval payload and its canonical digest.
Define the permitted assets, targets, calls, amounts, fees, lifetime, and replay scope.
Define how the system handles uncertain broadcast results and stale approvals.

For recovery, define the initiating authority, required quorum, notification route, delay, cancellation route, and completion action.
State what changes after recovery and which old credentials remain dangerous.
Include fee funding and provider-outage behavior.

## Evidence and acceptance

Attach a source date and implementation version to each external capability claim.
Link tests to security properties, not only to components.
For example: “One compromised coordinator cannot cause a reserve spend without two independent approvals.”
Then provide a test that changes the payload after the first approval and demonstrates rejection.

Require a restore rehearsal, a provider-failure exercise, and an authority-path review before funding.
Use the [validation checklist](validation.md) as the minimum test plan.
The builder must report deviations instead of silently weakening requirements.
---
embedded-wallets.md
---
# OAuth, social login, and embedded wallets

[Entry](ENTRY.md) · [Authentication](authentication.md) · [Threshold signatures](threshold-signatures.md)

## Mechanism and applicability

OAuth authorizes access to services. OpenID Connect adds identity authentication on top of OAuth.
A social-login wallet uses identity evidence to release, reconstruct, or authorize access to wallet material.
The login protocol does not define the wallet's custody model.
See [OAuth security practice, RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html).

**Applicability:** embedded wallets can support different chains through their actual signing adapters.
The identity provider does not determine chain support.
Determine whether the wallet reconstructs a complete key or runs a threshold signing protocol.

## MetaMask Embedded Wallets example

MetaMask's infrastructure documentation distinguishes SSS-based Embedded Wallet SDKs from the MPC Core Kit.
The SSS architecture reconstructs the key on the user's device.
The threshold-signing architecture aims to sign without reconstructing that key.
See [SSS architecture](https://docs.metamask.io/embedded-wallets/infrastructure/sss-architecture/) and
[MPC architecture](https://docs.metamask.io/embedded-wallets/infrastructure/mpc-architecture/).

These documents also describe authentication, device, and backup factors.
Do not infer that every application configures the same factors or recovery threshold.
The MPC architecture page includes SSS-related lifecycle descriptions. Check the exact SDK behavior through version-specific evidence and testing.
A product-wide “MPC” label is insufficient.

## Attack surface

The trust graph includes the identity provider, token verifier, application origin, device storage, provider infrastructure, and recovery service.
The same email account may reset several of those components.
A nominal two-factor setup can therefore collapse into one identity-recovery path.

For OAuth integrations, use the security controls required by the selected flow.
These include exact redirect validation, PKCE where applicable, and protection against request substitution.
For identity tokens, check issuer, audience, signature, expiry, and the required nonce binding.
Do not identify a wallet solely by an unverified email string.
[RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html) explains current OAuth threat handling.

## Theft and lock modes

| Event | Consequence |
| --- | --- |
| Identity recovery gives an attacker enough factors | The attacker gains wallet authority through a legitimate recovery flow. |
| Malicious application code observes reconstruction | The complete key can escape despite distributed backup storage. |
| A verifier accepts a token for the wrong audience | Another application's credential can unlock wallet access. |
| Device storage disappears | The user needs a working backup or recovery factor. |
| Provider or identity service becomes unavailable | Normal access or reconstruction can stop. |
| Account mapping changes | Login can select a different wallet or fail to find the original wallet. |
| Export uses a proprietary format or the provider prevents export | Vendor exit may require the unavailable vendor. |

These are design analyses. Test them against the selected SDK and application configuration.
A provider outage is not necessarily permanent loss if an independent recovery path works.
A documented export button is not proof that export works during provider shutdown.

## Composition and acceptance

Use a separate recovery factor whose reset does not depend on the same login account.
For larger reserves, use the embedded wallet as one limited authority within a broader policy.
A smart-account limit must cover all execution and upgrade paths to constrain that authority.

Before selection, demonstrate the following:

1. Login on a new device recovers the expected account.
2. Loss of the original device does not require its unavailable storage.
3. Identity takeover alone cannot satisfy the intended threshold.
4. Export or recovery works under the documented provider-failure assumptions.
5. The exported material works in independent signing software when the provider claims portability.
6. Application logs, errors, and analytics contain no keys, shares, or tokens.

Record SDK version, plan constraints, factor locations, and recovery dependencies in the [design contract](design-contract.md).
Recheck product terms and capabilities before procurement or deployment.
---
fundamentals.md
---
# Fundamentals and terms

[Entry](ENTRY.md) · [Chain capabilities](chain-capabilities.md) · [Threat model](threat-model.md)

## What custody controls

A blockchain records assets and rules for their transfer. A wallet manages the data and authority needed to satisfy those rules.
A private key usually produces signatures. A public key lets a verifier check those signatures without learning the private key.
An address identifies a destination under chain-specific rules. An address is not always a public key.

A seed is input to key derivation. A mnemonic encodes backup material as words.
A wallet can derive many keys from one seed. Losing that seed can affect several accounts and chains.
A watch-only wallet can identify receipts and prepare transactions without private signing keys.
[BIP-32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) specifies one widely used derivation method.

A transaction changes chain state. Its signature covers a chain-specific message or digest.
The signer must know what that message permits. Hash verification alone does not explain the economic effect.
Bitcoin signatures use defined spending rules. Solana signatures cover a serialized transaction message.
See [BIP-174](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki) and [Solana partial signing](https://solana.com/docs/core/transactions/partial-signing).

## Custody is an authority relationship

| Model | Authority question | Main dependency |
| --- | --- | --- |
| Single-owner self-custody | Can the owner spend and recover without another organization? | Owner's devices and backups |
| Cooperative custody | Which combinations of owner and service can spend? | Quorum availability and export route |
| Third-party custody | Can the provider spend without the user? | Provider security and withdrawal access |
| Contract-controlled custody | Which contract paths can transfer or replace owners? | Contract code and administrators |

These are analytical categories. A product's legal custody classification requires separate legal review.
A provider can block access without being able to steal funds. A provider can also control recovery despite normal signing requiring the user.
Document both powers separately.

## Terms used throughout the wiki

| Term | Meaning |
| --- | --- |
| Authorization | A rule permits an action. |
| Authentication | A system checks control of an identity credential. |
| Quorum | A set of participants that satisfies a threshold rule. |
| Threshold \`t-of-n\` | At least \`t\` of \`n\` participants must cooperate. |
| Multisig | A spending rule checks several independent signing keys. |
| Threshold signature | Several key shares jointly produce one signature. |
| Secret sharing | Shares reconstruct a secret when a threshold is met. |
| DKG | Distributed key generation creates shares without one dealer holding the complete key. |
| Nonce | A value with a protocol-specific uniqueness or freshness requirement. |
| Signature nonce | Secret per-signature material used by certain signature schemes. |
| Account nonce | Public sequence data that helps prevent transaction replay. |
| Recovery | A process restores usable spending authority. |
| Rotation | A process replaces keys or authorized participants. |
| Refresh | A threshold protocol replaces shares, often without changing the public key. |
| Hot signer | A signer available to an online transaction workflow. |
| Cold signer | A signer kept outside routine online operation. |
| RPC | A remote procedure call used to query or submit chain data. |
| Finality | The chain's assurance that accepted state will not reverse. |
| Failure domain | Components that one event or administrator can compromise together. |

Secret sharing and threshold signing have different exposure during use.
A reconstructed key exists in one execution environment. A threshold protocol can avoid that concentration.
Compare [SLIP-39](https://github.com/satoshilabs/slips/blob/master/slip-0039.md) with [RFC 9591](https://www.rfc-editor.org/rfc/rfc9591.html).

## Security properties

**Confidentiality** protects secret material. **Integrity** protects transaction content and policy.
**Availability** means a valid action can complete when needed. **Durability** means authority survives permanent component loss.
**Privacy** limits disclosure of balances, ownership, and transaction relationships.

Design analysis: no single property implies the others.
An HSM can protect a key while a stolen API credential requests a valid malicious signature.
A quorum can prevent theft while insufficient surviving signers permanently lock funds.
A complete public descriptor can restore address discovery while exposing financial relationships.

## What signatures do not protect

A correct signature does not stop an issuer from exercising a token's freeze authority.
It does not remove bridge, lending, staking, or contract risk after funds enter those systems.
Solana documents separate [mint, freeze, owner, and close authorities](https://solana.com/docs/tokens/basics/set-authority).
Evaluate each asset's external authorities separately from wallet keys.
---
hsm-and-enclaves.md
---
# HSMs, cloud KMS, and enclaves

[Entry](ENTRY.md) · [Authentication](authentication.md) · [Operations](operations.md)

## HSM and KMS mechanisms

A hardware security module, or HSM, performs cryptographic operations within a protected device boundary.
A key management service, or KMS, exposes key operations through an API and access policy.
Some KMS products use HSMs. The product name does not establish the full security boundary.

A non-exportable key can prevent ordinary application code from reading the private key.
That control does not stop an authorized caller from requesting a harmful signature.
Separate permission to sign from permission to administer, disable, destroy, or change key access.

**Applicability:** check the curve, signature scheme, digest handling, signature encoding, and service availability.
AWS KMS documents secp256k1 ECDSA and specific Ed25519 modes.
Those capabilities do not imply BIP-340 signing support or automatic chain transaction encoding.
See the [AWS key-spec reference](https://docs.aws.amazon.com/kms/latest/developerguide/symm-asymm-choose-key-spec.html).

For ECDSA integrations, test raw-message versus digest inputs and DER conversion.
Apply chain-required signature normalization and recovery metadata with a reviewed adapter.
For Ed25519, distinguish ordinary signing from prehash variants. An algorithm name containing Ed25519 is not sufficient.
Check every output against the chain's actual verifier before accepting the integration.

## Attack surface and failures

| Boundary | Theft mechanism | Lock mechanism |
| --- | --- | --- |
| Signing API | Stolen credentials invoke valid signatures. | IAM denial or service outage blocks signing. |
| Administration | An administrator grants unauthorized signing access. | Key deletion or policy error removes access. |
| Hardware and firmware | A device vulnerability exposes keys or changes operations. | Hardware failure requires a supported restore route. |
| Application decoder | A safe-looking request maps to malicious bytes. | Unsupported transaction formats prevent valid use. |
| Backup and replication | Every complete-key replica becomes another compromise target. | Incomplete or incompatible backups fail restoration. |

These are design analyses. Check each product's documented export, replication, and deletion semantics.
A certification applies to a module, configuration, and evaluation scope. It does not certify the surrounding wallet workflow.

**Composition:** an HSM can hold one independent multisig key or one supported threshold-protocol share.
Ordinary HSM signing support does not imply support for MPC arithmetic inside the device.
Two HSM keys under one unrestricted administrator may provide little protection against that administrator.

## Trusted execution environments

A trusted execution environment, or TEE, isolates selected code and data from parts of the host environment.
Remote attestation supplies signed evidence about that environment and its measured code.
The verifier must check the attestation chain, expected measurements, freshness, and binding to the session key.

AWS documents a pattern where KMS encrypts released data to a key in an attestation document.
The result targets the corresponding enclave rather than the ordinary caller.
See [cryptographic attestation](https://docs.aws.amazon.com/kms/latest/developerguide/cryptographic-attestation.html).

**Applicability:** an enclave can run chain-specific signing software or threshold protocol code if its platform supports the workload.
It does not add a new blockchain signature type.
Its security depends on the platform, approved code, provisioning, and persistent-state design.

**Attack surface:** enclave code, host-controlled inputs, attestation policy, update authority, side channels, and persistent-state rollback.
An approved but vulnerable binary can leak secrets. Attestation proves a measurement, not program correctness.
An administrator who can approve arbitrary measurements can change the intended trust boundary.

**Lock modes:** lost sealed data, unavailable attestation services, hardware migration failures, or policy that rejects the replacement image.
**Theft modes:** vulnerable enclave code, incorrect attestation checks, rollback of nonce state, or a hostile approved update.
Treat these as threats to evaluate, not claims that every TEE has each defect.

**Composition:** bind key release to reviewed measurements and separate update authority from transaction authority.
Use independent quorum members when a single platform compromise is in scope.
Test recovery across machine replacement and software upgrades without restoring reusable signature nonces.
---
implementation.md
---
# Signing software and integration boundaries

[Entry](ENTRY.md) · [Design contract](design-contract.md) · [Validation](validation.md)

## Architecture boundary

A wallet coordinator gathers intent, reads chain state, constructs payloads, collects approvals, and broadcasts signed transactions.
A signer checks requests and produces signatures within its own trust boundary.
An indexer helps discover history and balances. It does not inherently control spending.

An indexer API key is a service credential, not a wallet private key.
A browser application cannot keep a credential secret from its own code or user.
Use origin-restricted public client credentials only when the provider supports that model.
Use a separate authenticated service for privileged credentials when needed.

The current CCC chat and diagram are design interfaces. Their LLM provider key is not a custody key.
This wiki does not authorize an agent to retrieve wallet secrets or sign live transactions.
Treat model-generated transaction descriptions as untrusted input to deterministic validation.

## Transaction state machine

Use explicit states:

\`\`\`text
proposed -> decoded -> policy_checked -> awaiting_approvals
         -> authorized -> signing -> signed -> submitted -> confirmed -> finalized
\`\`\`

Allow explicit \`rejected\`, \`cancelled\`, \`expired\`, and \`failed\` outcomes where appropriate.
A \`signed\` operation can remain executable after local cancellation.
An unknown submission result requires reconciliation, not automatic construction of another payment.

Assign a unique operation ID and immutable payload digest.
Bind approvals to the digest, account, network, policy version, and expiry.
Invalidate approvals when relevant content or authority changes.
Persist enough nonsecret state to reconcile retries after a crash.

## Deterministic validation

1. Check the network identity and selected account.
2. Parse bounded input using maintained libraries.
3. Decode all outputs, instructions, or contract calls.
4. Identify asset amounts in integer base units.
5. Check fees, replay scope, expiry, and policy limits.
6. Present the exact effects to the approver.
7. Collect the required independent approvals.
8. Send the immutable signing payload to the signer.
9. Check the returned signature against that payload.
10. Broadcast without changing signed fields.
11. Reconcile receipt, state changes, and finality.

Simulation can detect some harmful effects. It does not guarantee future state or protect against a dishonest RPC service.
A contract's state can change between simulation and inclusion.
Bind safe execution constraints into the transaction where the protocol permits them.

## Bitcoin and PSBT

Use the PSBT version supported by every participant.
Check previous outputs, script ownership, key derivation, every output, change, fees, and the requested sighash mode.
A sighash mode controls which transaction parts the signature commits to.
Reject unexpected modes rather than assuming every signature covers everything.

Do not trust PSBT labels or change claims from the coordinator.
Derive expected scripts from the registered wallet policy.
After combining signatures, check the final transaction before broadcast.
See [BIP-174](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki).

## EIP-1193 provider interface

EIP-1193 defines a JavaScript provider API with a \`request\` method and events such as \`accountsChanged\` and \`chainChanged\`.
It does not define custody or guarantee that a provider is trustworthy.
See [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193).

Treat provider objects and returned values as untrusted.
Handle user rejection, unauthorized methods, unsupported methods, and disconnection explicitly.
On account or chain change, invalidate pending assumptions and require fresh validation.
Do not confuse an RPC connection with permission to use an account.

A browser coordinator can call an external wallet through this interface.
That pattern avoids giving the coordinator a private key, but malicious coordinator code can still request harmful signatures.
Preserve independent transaction review.

## WalletConnect

WalletConnect transports proposals and requests between applications and wallets.
A wallet approves session namespaces that identify allowed chains, accounts, methods, and events.
A session approval is not blanket approval for every later transaction.
See the [Wallet SDK workflow](https://docs.walletconnect.network/wallet-sdk/web/usage).

Check the session, request ID, chain, account, method, and expiry before each action.
Reject duplicate or obsolete requests according to a defined policy.
Remove permissions and pending requests when a session ends.
Do not expose pairing material or session secrets in logs.

WalletConnect’s domain-verification API supplies domain-risk signals. Its documentation explicitly limits its guarantees.
A valid domain result does not prove that a transaction is safe.
See [Domain verification](https://docs.walletconnect.network/wallet-sdk/web/verify) and
[contract access control](https://docs.walletconnect.network/custodians/contract-access-control).

## MetaMask account-management Snap

An account-management Snap can implement custom account behavior through the Keyring API.
The builder must select the exact supported account type, SDK, permissions, and user interface.
A Snap is an integration boundary, not automatic proof of secure custody.

MetaMask directs builders to use \`onKeyringRequest\` for account-management requests.
Its security guidance requires restricted caller origins and method access.
Account objects can reach dapps and must not contain secrets.
See [account-management security](https://docs.metamask.io/snaps/features/custom-evm-accounts/security/).

Keep request IDs bound to immutable payloads during asynchronous approval.
Check redirect origins. Sanitize errors and remove secret-bearing logs.
Do not load remote executable code into the Snap.
Reject export or account-management methods that the design does not authorize.

## Browser-only coordinator versus local signer

A browser-only coordinator suits watch-only discovery and external-wallet signing.
A local or remote signer can retain key material behind a narrow authenticated API.
An offline signer requires a defined transport and a complete, verifiable payload.

If the browser holds a key, document that any authorized hostile browser deployment can access or misuse it.
JavaScript memory clearing does not provide a reliable hardware-style zeroization guarantee.
Avoid promising hardware isolation from a software-only vault.

## Builder implementation rules

Use reviewed cryptographic libraries and published test vectors.
Keep chain adapters separate from identity, policy, and transport code.
Use explicit typed errors for parsing, policy denial, cancellation, signer failure, and uncertain submission.
Prevent late responses from authorizing an obsolete request.

Do not implement a new threshold protocol from prose in this wiki.
Pin compatible protocol versions and test interoperability before adding funds.
Complete the [validation plan](validation.md) for every authority path.
---
multisig.md
---
# Multisignature wallets

[Entry](ENTRY.md) · [Threshold signatures](threshold-signatures.md) · [Composition](composition.md)

## Mechanism and applicability

A multisig spending rule requires signatures from several independent keys.
A \`t-of-n\` rule accepts at least \`t\` authorized keys from \`n\` registered keys.
The chain or account program checks that rule. A coordinator collects requests and signatures but should not hold a spending quorum.

Bitcoin scripts support multisig conditions. EVM contracts such as Safe support owner thresholds.
Other chains require compatible account or program rules.
Solana's multiple transaction signatures alone do not establish a general wallet policy.
See [chain capabilities](chain-capabilities.md).

Multisig differs from splitting one seed into backup shares.
Independent keys remain separate during ordinary multisig signing.
A backup quorum can reconstruct one key and then sign without the other backup holders.

## Bitcoin workflow

1. Generate each signing key within its intended trust boundary.
2. Exchange public key information and key origins.
3. Construct a descriptor with the threshold and script type.
4. Register or check that policy on each supported signing device.
5. Compare receive addresses before funding.
6. Preserve the complete descriptor with each recovery package.
7. Build and circulate a PSBT for spending.
8. Check inputs, outputs, change, fees, and signature scope on each signer.
9. Combine valid signatures and broadcast the final transaction.

[BIP-380](https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki) defines descriptor structure.
[BIP-174](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki) defines PSBT roles and data exchange.
[Sparrow](https://sparrowwallet.com/docs/best-practices.html) gives operational guidance for independent hardware signers.

Treat a PSBT as untrusted input. Its labels and claimed ownership are not proof.
A malicious coordinator can substitute cosigners during setup or present misleading change information.
Check the registered policy and derive expected addresses independently.

## Attack surface and failure modes

| Failure | Technical reason | Design response |
| --- | --- | --- |
| Quorum compromise | The chain accepts the required valid signatures. | Separate people, devices, locations, and backup control. |
| Shared seed across owners | One root secret derives several owner keys. | Generate independent roots for independent authorities. |
| Lost configuration | Keys do not uniquely identify scripts and derivation paths. | Preserve descriptors and known address checks. |
| Cosigner refusal | Fewer than \`t\` available keys cannot satisfy the rule. | Choose a loss-tolerant threshold or explicit recovery path. |
| Shared transaction deception | Every signer approves the same malicious proposal. | Use independent decoding and destination validation. |
| Unsupported wallet software | Tools cannot construct or recognize the spending policy. | Test recovery and spending with replacement tooling. |
| Contract bypass | A module or administrator has alternate authority. | Analyze every contract path. |

A 2-of-3 wallet can tolerate one unavailable signer. It cannot tolerate two colluding signers.
A 3-of-3 wallet rejects any single absent signer, which can make permanent loss more likely.
Increasing the threshold changes both theft resistance and availability.

## Fees, privacy, and rotation

Bitcoin script multisig can reveal several keys and the threshold when the spend reveals the script.
More signatures can increase transaction size and fees.
Taproot can hide unused branches, but the selected spend path determines what becomes public.
See [BIP-341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki).

Bitcoin key rotation usually moves outputs to a new policy.
A contract wallet can update owners while preserving its address, if its code permits that update.
Old token allowances or delegated authority may survive owner changes. Review them during rotation.

## Composition

A multisig owner can use hardware, software, an HSM, or a compatible threshold-signing service.
Each owner must still contribute independent authority.
If one provider controls two owners in a 2-of-3 account, the provider can meet the threshold alone.

A cold recovery key connected by an OR condition is another spending path, not an extra required approval.
Use [composition analysis](composition.md) to calculate the weakest path before selecting a threshold.
---
operations.md
---
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
---
products.md
---
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
Use \`verified\`, \`documented-only\`, \`failed\`, or \`unknown\` as evidence status.
Do not turn \`unknown\` into \`supported\` during design generation.

The research hints also name Fireblocks, Zengo, Safeheron, Coinbase, Vultisig, and other providers.
This wiki covers their relevant technology families. It does not assert current feature parity or audit status for those products.
Evaluate any selected product with the same evidence requirements.
---
recovery-and-time-locks.md
---
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

\`CHECKLOCKTIMEVERIFY\`, or CLTV, restricts a script branch until an absolute height or time condition is met.
\`CHECKSEQUENCEVERIFY\`, or CSV, supports relative age conditions with the corresponding transaction rules.
See [BIP-65](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki) and
[BIP-112](https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki).

A transaction's \`nLockTime\` alone delays that transaction. It does not stop an authorized signer from creating a different immediate transaction.
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
---
seeds-and-backups.md
---
# Seeds, passphrases, and backups

[Entry](ENTRY.md) · [Signers](signers.md) · [Recovery](recovery-and-time-locks.md)

## BIP-39 and deterministic wallets

BIP-39 encodes computer-generated entropy with a checksum. Twelve words encode 128 entropy bits. Twenty-four words encode 256 entropy bits.
The words are not a password that the user invents.
The checksum detects some transcription errors. It does not authenticate the backup or prevent theft.
See [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).

BIP-39 derives a seed from the mnemonic and an optional passphrase using PBKDF2-HMAC-SHA512 with 2,048 iterations.
The passphrase affects the seed itself. It does not add a login check to the same wallet.
Every passphrase produces a seed, including a mistyped passphrase. An empty wallet can therefore indicate the wrong passphrase.

**Applicability:** many Bitcoin and other wallets use BIP-39, but not every wallet does.
Record the exact format, language, normalization rules, derivation method, paths, and account indices.
A phrase that passes a checksum can still belong to the wrong wallet.

**Theft:** anyone with sufficient seed material can derive keys outside the original device.
A weak passphrase can permit offline guessing after mnemonic theft. Device retry limits do not restrict that attack.
Entering the mnemonic into a browser exposes it to browser code.

**Lock:** losing the passphrase can permanently remove access despite an intact mnemonic.
A forgotten account path can hide funds during discovery. A missing multisig descriptor can remove essential script information.

**Composition:** store the passphrase separately when the threat model requires two separate compromise events.
Provide an inheritance route for both items. Test known addresses before depositing significant funds.
Do not describe the passphrase as an independent signer.

## Entropy and key generation

Entropy measures uncertainty in the generated secret. More words do not increase security when the source of randomness is predictable.
Use the wallet's reviewed cryptographic random generator. Do not choose mnemonic words from memory or personal information.
BIP-39 explicitly describes computer-generated randomness rather than user-created sentences.

Design analysis: a malicious generator can select a key that the attacker already knows.
An unbiased generator can also fail if the surrounding software reuses stored output or copies one seed to several owners.
A seed checksum cannot detect these failures because it checks encoding consistency, not unpredictability.

Independent roots reduce the effect of one faulty generator only when the spend requires another independent authority.
Generating several owners from one root preserves the root's common failure risk.
Adding dice input does not defeat a malicious device that ignores that input or leaks the final seed.
A supported entropy-mixing workflow needs a reviewed construction and a trustworthy verification method.

Preserve evidence of the generation procedure without recording secret values.
Test randomness interfaces and failure handling with fake material.
Statistical tests alone cannot prove that an attacker does not know a generated key.

## BIP-32 derivation

BIP-32 derives a tree of keys from seed material.
An extended public key, or xpub, permits public derivation for non-hardened descendants.
This supports watch-only address discovery without spending authority.

An xpub exposes a family of addresses and can reveal financial relationships.
An exposed non-hardened child private key and its parent extended public key can reveal the parent private key.
Hardened derivation prevents that specific public derivation relationship.
See the security discussion in [BIP-32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).

Design analysis: avoid distributing child private keys from a shared non-hardened branch.
Use separate roots when administrative independence matters. Several accounts under one seed share a root compromise risk.

## Shamir secret sharing

A \`t-of-n\` scheme divides a secret into shares. At least \`t\` shares reconstruct it.
Fewer than \`t\` shares do not reveal the secret under the scheme's assumptions.
This property depends on correct randomness, implementation, and the chosen threshold.

SLIP-39 adds mnemonic encoding, checksums, identifiers, and group thresholds.
It is a backup format, not a distributed signing protocol.
During recovery, a device reconstructs secret material. That device then becomes a complete-secret exposure boundary.
See [SLIP-39](https://github.com/satoshilabs/slips/blob/master/slip-0039.md).

| Condition | Technical consequence |
| --- | --- |
| An attacker obtains a recovery quorum | The attacker can restore signing authority. |
| One location contains a quorum | One physical event can defeat the distribution. |
| Too many shares are lost | Interpolation cannot recover the secret. |
| Shares belong to different backup sets | The intended threshold may not reconstruct anything. |
| An attacker controls the recovery device | Distribution no longer protects the reconstructed secret. |
| Old shares remain valid | Creating another backup does not necessarily revoke the old one. |

A 2-of-3 backup tolerates loss of one share. It also gives any two share holders recovery authority.
Use independent storage locations and record the exact threshold configuration.
Do not cut a seed phrase into word groups. That exposes partial information and does not implement Shamir sharing.

SLIP-39 and BIP-39 are not interchangeable formats.
Ledger's Seed Tool describes an SSKR-based BIP-39 round trip. Do not treat its shares as SLIP-39 shares.
Check the exact application, encoding, and restore procedure before conversion.
See [Ledger's technical description](https://www.ledger.com/blog/seed-tool-app).

## Password-encrypted files

**Applicability:** encrypted files can protect seeds, shares, descriptors, or operational backups on any chain.
The encryption format must preserve everything needed for decryption, including algorithm identifiers and parameters.

Use a maintained authenticated-encryption format. Use a password derivation function with an explicit salt and cost parameters.
Argon2id provides memory-hard password derivation. Tune its parameters on the actual recovery devices.
[RFC 9106](https://www.rfc-editor.org/rfc/rfc9106.html) defines the algorithm and test vectors.

Design analysis: encryption protects stored ciphertext, not a running wallet after decryption.
Malware can capture the password or plaintext. A weak password permits offline guessing without server rate limits.
Losing the password or encryption metadata can lock an otherwise intact backup.
Keep a tested recovery copy with independent storage and access control.

Do not change BIP-39 derivation parameters to make it “stronger.” That creates an incompatible wallet.
An outer encrypted backup and BIP-39's internal derivation are separate mechanisms.

## Complete recovery package

Record the following without putting secrets in the research wiki or design document:

1. Backup format and tested restore software version.
2. Chain, network, script or account type, and derivation paths.
3. Multisig threshold, all public keys, and complete descriptors when applicable.
4. Secret locations and access procedures, using references rather than secret values.
5. Passphrase requirements and independent retrieval procedures.
6. Known receive addresses for restoration checks.
7. Contract addresses, modules, owners, and upgrade information when applicable.
8. A dated recovery rehearsal and the observed result.

Protect public configuration against modification. A descriptor checksum detects mistakes, not malicious replacement.
[BIP-380](https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki) explains why keys alone are insufficient.
---
signers.md
---
# Hardware and software signers

[Entry](ENTRY.md) · [Backups](seeds-and-backups.md) · [Multisig](multisig.md)

## Hardware wallets

A hardware wallet isolates signing keys from the general-purpose host.
The host supplies a transaction. The device signs inside its own execution boundary.
A device display can provide an independent view of the destination and amount.
This benefit depends on what the device actually decodes and displays.
See [Sparrow's connected-device workflow](https://sparrowwallet.com/docs/connected-wallet.html).

**Applicability:** support depends on the device, firmware, chain application, transaction type, and wallet integration.
A supported coin name does not prove support for a multisig script or every contract operation.
Check address verification, change detection, typed data, and backup compatibility for the selected workflow.

**Attack surface:** firmware, secure elements, general-purpose processors, host parsers, USB or radio interfaces, update tools, and physical supply chains.
A malicious device can leak key material or request a misleading approval.
A secure element does not independently prove that the display describes the signed bytes.

**Theft modes:** malicious firmware, substituted receive addresses, blind signing, exposed backups, or physical extraction under a model-specific vulnerability.
**Lock modes:** lost backups, unsupported restore formats, forgotten passphrases, device failure, or unavailable firmware tooling.
A PIN protects device access. It does not protect a stolen unencrypted mnemonic.

Trezor's [supply-chain report](https://blog.trezor.io/trezors-multi-layer-defense-against-supply-chain-attacks-54541f410389) describes a concrete authenticity-check bypass and its limits.
The report does not establish that the attack extracted private keys.
Do not generalize one device's attack or protection to all models.

**Composition:** use independent devices as separate multisig owners when one-device compromise is in scope.
Different vendors can reduce shared implementation risk. Shared hosts, backups, or administrators can still collapse independence.
Check receive addresses and wallet policy on trusted devices before funding.

## Offline software wallets

A software wallet holds or reconstructs keys in general-purpose memory.
An offline computer can reduce remote attack opportunities. It still trusts its operating system, software, storage, and input parsers.
A formerly online phone does not become trustworthy merely because the user disables networking.

**Applicability:** any chain with compatible offline transaction construction and signing tooling.
Bitcoin PSBT provides a standard exchange format for partial and offline signing.
Other chains require their own complete signing payload and lifetime rules.
See [BIP-174](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki).

**Attack surface:** installation media, firmware, removable storage, QR decoders, cameras, printers, and software updates.
USB storage can carry malicious files or exploit a parser.
QR transfer removes an electrical connection but still feeds attacker-controlled data into software.
Bluetooth creates a radio connection and is not an air gap.

**Theft modes:** malware captures plaintext keys, changes displayed intent, or encodes secrets in returned data.
**Lock modes:** storage failure, lost encryption passwords, obsolete dependencies, or transaction expiry during manual transport.
Backups can restore keys but may not restore the full wallet configuration.

**Composition:** use an offline machine as one signer, with another independently managed signer checking the same spend.
Limit accepted formats and sizes. Transfer only the data needed for the protocol.
Preserve a reproducible installation procedure and test recovery on replacement hardware.

## Connected software wallets and browser wallets

Browser wallets are convenient for frequent interactions. Their execution environment includes browser code, extensions, dependencies, and update infrastructure.
An encrypted local vault protects storage while locked. It does not protect plaintext during authorized use.

A single-page application can coordinate an external signer without receiving its private key.
If the application reconstructs a key, malicious application code can capture that key.
CSP and dependency pinning reduce some injection risks. They do not protect against an authorized malicious deployment.
These are design consequences of the execution boundary.

Limit online balances and permissions according to the user's loss tolerance.
Separate interaction accounts from reserves. Review token approvals as well as direct transfers.
A compromised application can request a damaging signature without ever extracting a key.

## Signing ceremony

1. Check the chain and account on an independent display or trusted verifier.
2. Decode the exact destination, amount, fee, and contract permissions.
3. Check every output and change destination for Bitcoin.
4. Check all calls and approval effects for a contract transaction.
5. Approve only the payload that the signer will sign.
6. Check the returned signature before broadcast.
7. Monitor chain inclusion and finality after broadcast.

Reject unsupported decoding unless an explicitly reviewed procedure covers the opaque payload.
A label from the requesting website is not independent transaction verification.
See [implementation](implementation.md) for message and transport controls.
---
smart-accounts.md
---
# Smart accounts and programmable policy

[Entry](ENTRY.md) · [Recovery](recovery-and-time-locks.md) · [Implementation](implementation.md)

## Mechanism and applicability

A smart account uses contract code to check authority and execute actions.
The code can check owner quorums, passkeys, time conditions, or delegated permissions.
The account's security includes every execution and administration path.

**Applicability:** a target network must support the selected contracts and their verification operations.
EVM compatibility alone does not prove identical precompiles, deployed addresses, or service availability.
Record the chain ID, account address, implementation version, factory, and all extensions.

ERC-4337 defines a \`UserOperation\` workflow through bundlers and an EntryPoint contract.
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
---
threat-model.md
---
# Threat model

[Entry](ENTRY.md) · [Composition](composition.md) · [Validation](validation.md)

This page gives design analysis. Use the linked technique pages for the underlying mechanisms.
Assess theft and loss of access separately. A control that reduces one risk can increase the other.

## Assets and boundaries

Protect signing keys, shares, recovery secrets, wallet configuration, and transaction intent.
Also protect policy administration, deployment credentials, identity recovery, and the software update process.
Public metadata needs integrity even when confidentiality is optional.

Draw boundaries around the browser, coordinator, signer, identity service, cloud account, contract, and blockchain node.
Record who can change code or policy at each boundary.
Include administrators who can reset another administrator's credentials.

## Failure analysis

| Event | Mechanism | Theft or lock result | Control and residual risk |
| --- | --- | --- | --- |
| Host malware changes a destination | The signer approves bytes from an untrusted host. | Funds move to the attacker. | Independently decode and display the signed payload. Human review can still fail. |
| Device or firmware is malicious | It leaks secrets or signs unauthorized data. | One signing authority becomes hostile. | Independent signer quorum limits one-device compromise. Shared firmware can defeat independence. |
| Backup theft | The attacker restores a key outside normal controls. | Device PIN and service policy become irrelevant. | Protect backup authority with the same rigor as signing authority. |
| Backup loss | Too few valid recovery factors survive. | Funds remain on-chain but inaccessible. | Test restoration across independent failure domains. |
| Identity takeover | Recovery resets unlock several factors. | An apparent quorum becomes one administrative account. | Separate identity recovery paths and administrators. |
| Malicious contract module | Another execution path bypasses normal owners. | Funds move despite the owner threshold. | Enumerate modules and administrative paths. Audit exact deployments. |
| Signer refuses or service fails | The protocol cannot reach its threshold. | Operations stop or recovery fails. | Test provider-independent recovery and degraded signing. |
| RPC lies or becomes stale | The coordinator sees false state or a wrong chain. | Wrong actions, hidden receipts, or failed transactions. | Check chain identity and critical state through independent sources. |
| Approval race | Concurrent requests each pass the same balance or limit check. | Aggregate spending exceeds the limit. | Reserve capacity atomically and bind approvals to exact requests. |
| Supply-chain compromise | A dependency or deployment update changes wallet behavior. | All users can receive malicious signing requests. | Pin releases, check artifacts, and restrict deployment authority. |
| Coercion or collusion | Enough authorized people cooperate with an attacker. | Cryptography accepts their signatures. | Separate locations and roles. Evaluate delayed recovery and response capability. |
| Chain disruption | Reorganization, congestion, or censorship delays execution. | A response misses its safety deadline. | Include confirmation and fee margins in time assumptions. |

[Safe modules](https://docs.safe.global/advanced/smart-account-modules) illustrate an alternate spending path.
[BitForge research](https://www.fireblocks.com/blog/gg18-and-gg20-paillier-key-vulnerability-technical-report) illustrates protocol-level key exposure.
[Sparrow's operational guidance](https://sparrowwallet.com/docs/best-practices.html) explains device and location separation.

## Minimum compromise sets

Write a Boolean condition for each spend path. Use identities that represent actual control, not product labels.
For \`(A AND B) OR C\`, compromise of \`C\` is sufficient.
For a 2-of-3 wallet, the minimal sets are \`{A,B}\`, \`{A,C}\`, and \`{B,C}\`.

Then substitute shared dependencies.
If one cloud administrator controls \`A\` and \`B\`, that administrator is a one-event compromise set.
If one backup contains both keys, theft of that backup has the same effect.
If the user must use one website to recover all shares, that website is an availability dependency.

Evaluate loss sets too. A 2-of-3 scheme tolerates one unavailable participant under its protocol assumptions.
Two permanently lost participants can remove normal spending authority.
Do not calculate independent failure probabilities when components share location, software, identity, or administration.

## Questions for the architect

1. What is the maximum acceptable loss before detection?
2. How long can normal signing remain unavailable?
3. Which people can collude, disappear, or face coercion together?
4. Which credentials can reset another factor?
5. What can each vendor do during a compromise or shutdown?
6. Who notices an unauthorized recovery request?
7. Can that person complete a response before the delay expires?
8. Which failures cannot be recovered without moving assets?

Record assumptions with owners and review dates in the [design contract](design-contract.md).
Do not accept an unexplained claim such as “MPC makes this secure.”
---
threshold-signatures.md
---
# MPC and threshold signatures

[Entry](ENTRY.md) · [Multisig](multisig.md) · [Backups](seeds-and-backups.md)

## Mechanism

Multi-party computation, or MPC, lets participants compute a result using private inputs.
A threshold signature scheme applies this approach to signing.
Each participant holds a share. A quorum runs a protocol that produces one signature under one public key.
Correct protocols do not need to reconstruct the complete private key during signing.

Distributed key generation creates shares without a single dealer receiving the complete secret.
A dealer-based setup starts with a complete secret and distributes shares afterward.
These setups have different initial exposure. Record which setup the product uses.

[RFC 9591](https://www.rfc-editor.org/rfc/rfc9591.html) defines two-round FROST signing and its security assumptions.
It does not define a complete custody product or every required key lifecycle protocol.

## Signature families and chain support

| Family | Potential use | Required compatibility evidence |
| --- | --- | --- |
| Threshold ECDSA | Ethereum EOAs and Bitcoin ECDSA paths | Exact curve, hashing, signature encoding, and protocol version |
| Threshold Schnorr | Bitcoin Taproot with a compatible construction | BIP-340 encoding, parity rules, challenges, and key tweaks |
| Threshold EdDSA | Solana and other compatible Ed25519 verifiers | Exact EdDSA variant and message processing |
| MuSig2 | Aggregated Bitcoin Taproot signing | All participants cooperate under BIP-327 |

RFC 9591's generic secp256k1 suite does not by itself establish Bitcoin compatibility.
The [BIP-340 FROST proposal](https://github.com/siv2r/bip-frost-signing) describes the extra compatibility requirements.
Treat that proposal as a specification candidate, not evidence of universal wallet support.

MuSig2 is an \`n-of-n\` aggregate signature protocol. It is not an arbitrary \`t-of-n\` threshold scheme.
[BIP-327](https://github.com/bitcoin/bips/blob/master/bip-0327.mediawiki) makes this distinction explicit.

## Key and signing lifecycle

1. Authenticate participants and their intended roles.
2. Select a reviewed protocol and exact implementation version.
3. Generate shares with a supported DKG or documented dealer procedure.
4. Check participant commitments and the resulting public key.
5. Store each share under separate control.
6. Bind every signing session to an immutable transaction digest.
7. Check protocol messages and required proofs.
8. Consume signature nonces according to the protocol.
9. Check the final signature before release.
10. Preserve recovery metadata and test participant replacement.

The coordinator must not change the message between approval and signing.
Each participant needs enough context to enforce its own policy.
A coordinator can block a session even when it cannot forge a signature.
Separate safety guarantees from progress guarantees.

## Nonce safety

Signature nonce reuse can expose a key or share in discrete-logarithm signature schemes.
A retry must not reuse consumed protocol nonce material.
A restored virtual-machine snapshot can restore old nonce state and create this failure.

Design analysis: reserve nonce material durably before use. Treat uncertain completion as consumed.
Prevent concurrent workers from receiving the same reservation.
Test process crashes, retries, and backup restoration around every protocol phase.
Do not invent deterministic nonce rules for a multi-party protocol.
Follow the selected protocol's requirements, including [BIP-327](https://github.com/bitcoin/bips/blob/master/bip-0327.mediawiki).

## Attack surface and failures

**Theft:** a threshold of compromised participants can sign. Shared administrators can compromise several nominally separate shares.
Invalid protocol proofs or unsafe parameters can also break the assumed threshold protection.
Fireblocks' [GG18/GG20 report](https://www.fireblocks.com/blog/gg18-and-gg20-paillier-key-vulnerability-technical-report) describes attacks involving unchecked Paillier parameters.
The finding concerns specified protocols and implementations. It does not prove that all MPC systems share that defect.

**Lock:** unavailable participants, incompatible protocol versions, lost metadata, or an unsupported recovery format can prevent signing.
A share file is not necessarily usable by another vendor's software.
A service can deny access without learning the complete key.

**Intent failure:** every party can faithfully produce a signature for a malicious transaction.
Threshold cryptography protects distributed authority. It does not supply transaction understanding.

## Refresh, rotation, and backups

A share refresh can keep the public key while replacing shares.
Security against compromise over time requires the protocol's assumptions, including safe disposal of obsolete material where required.
A complete old signing quorum can remain dangerous if an attacker preserved compatible old shares and software.
The chain sees the same public key and cannot inspect off-chain share epochs.

Key rotation changes the public key or account authority. It can require moving funds or updating contract owners.
Use rotation when old complete authority may be compromised.
Do not claim that refreshing shares revokes a previously exposed complete private key.

An emergency export can improve availability while creating a complete-key theft path.
Document who can authorize export, where reconstruction occurs, and what happens afterward.
Backups of shares must preserve cryptographic metadata but must not enable nonce reuse.

## Composition

Use threshold signing when one chain-compatible signature is valuable and the team can operate the protocol safely.
An HSM or enclave can protect a participant's share if the implementation supports that boundary.
Independent multisig outside the threshold system can limit one provider's compromise.
It also adds protocol, fee, and recovery complexity.

Before selection, demand an audit tied to the exact version, malicious-participant assumptions, recovery tests, and an exit demonstration.
The [product evaluation page](products.md) lists acceptance evidence.
---
validation.md
---
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


`
