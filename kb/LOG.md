# Research log

## 2026-11-04 to 2026-11-05: custody wiki

Task: implement [RESEARCH.md](RESEARCH.md), using the existing [wiki entry](wiki/ENTRY.md).
The research crossed midnight in Asia/Singapore. The final review date is 2026-11-05.

### Result and stopping criterion

The wiki contains 19 pages and 13,857 whitespace-delimited words.
It covers every technology family in the original skeleton and the main integration hints.
The pages explain applicability, attack surfaces, theft, loss of access, and composition.
The builder pages add explicit contracts, implementation boundaries, and behavioral acceptance tests.

The core research pass is complete. Remaining work below concerns deployment-specific evidence and continuing research.
A text reference cannot establish production readiness for a particular device, service, or contract.
No live keys, funded accounts, or custody deployments were used.

### Method

Used the ASD-STE100 skill for sentence structure and terminology.
Used the Exa Search skill for primary-source discovery and page extraction.
Organized the work into cryptography and backups, authentication and hardware, programmable custody, and integration and operations.

Ran 20 successful searches, each requesting five results. These are 100 result slots, not 100 unique validated sources.
The first four calls failed schema validation because the tool required an `objective` argument.
Repeated those calls with the required argument. They produced the first four successful searches.

Read source extracts rather than assuming that search placement proved a claim.
Exa page extraction often returned only the beginning of long specifications.
Targeted follow-up searches retrieved relevant sections for BIP-39, WebAuthn, timelock roles, and product policy semantics.
Those deliberate revisits resolved missing sections. They were not independent corroborating sources.

Preferred protocol specifications, official implementation documentation, and original vulnerability research.
Used vendor documents for vendor behavior, not for independent assurance or comparative security rankings.
Labeled derived architectural conclusions as design analysis or design requirements.
Did not reproduce promotional claims that a technology is universally safest or cannot be compromised.

### Main findings

- Backup secret sharing and threshold signing have different complete-key exposure during use.
- A generic curve or protocol name does not prove chain-signature compatibility.
- MuSig2 requires all aggregated participants. It is not a general threshold scheme.
- Recovery, export, modules, and upgrades can introduce weaker alternate spending paths.
- Several devices can share one seed, administrator, cloud account, or recovery dependency.
- MetaMask documents both SSS reconstruction and TSS signing variants. SDK selection matters.
- Google Cloud documents signer-quorum override of a negative transaction-policy verdict.
- Google's retrieved documentation labels its MPC service Preview and describes the v1beta transition.
- Google's algorithm table labels Ed25519/Solana support as coming soon. No deployed support claim follows from that entry.
- Ledger Seed Tool uses an SSKR-based workflow. Shamir-based formats are not automatically interoperable.
- A passkey can authenticate access to a signer without directly signing the chain transaction.
- A time delay needs independent monitoring, available responders, fee funding, and an executable response path.

### Coverage map

| Research requirement | Wiki pages |
| --- | --- |
| Foundational domain knowledge | fundamentals, chain-capabilities, threat-model |
| Hardware wallets, offline computers, phones | signers |
| Seeds, passphrases, Shamir, encrypted files | seeds-and-backups |
| HSM and enclave boundaries | hsm-and-enclaves |
| Multisig, MPC, FROST, MuSig2 | multisig, threshold-signatures |
| Passkeys, YubiKey, biometrics, IAM | authentication |
| OAuth and social login | embedded-wallets |
| Social recovery, inheritance, time locks | recovery-and-time-locks |
| Hot/cold separation and composition | composition |
| Enterprise approvals and audit | operations |
| Vendor evaluation | products |
| Architect handoff | design-contract |
| WalletConnect, EIP-1193, Snaps, standalone coordinator | implementation |
| Behavioral and recovery testing | validation |

### Access limits and contradictions

- `https://sparrowwallet.com/docs/multisig.html` returned `CRAWL_NOT_FOUND`. Used official best-practices and device workflow pages instead.
- `https://pse.dev/blog/social-recovery-sdk` returned only its title, author, and date. No SDK capability claim relies on that extract.
- MetaMask's MPC architecture page includes lifecycle text about SSS reconstruction. The wiki requires exact SDK evidence instead of merging the variants.
- Product pages and branch-based GitHub URLs are mutable. Pin versions and source revisions in any implementation record.
- Standards pages describe mechanisms. This pass did not prove activation on every network or support in every hardware model.
- Source extraction is not a full cryptographic audit. Protocol details must come from the exact implementation and full specification before coding.
- The official ASD dictionary was unavailable. The wiki states that its structural checks do not establish certified lexical compliance.

## Sources used in the wiki

The following URLs supplied page text or relevant search extracts during this pass.
A source in this list was not necessarily retrieved in full. Follow the linked wiki pages for the claim and context.
Reuse these records before fetching the same source again.

| Source URL | Pages using the source |
| --- | --- |
| <https://blog.trezor.io/trezors-multi-layer-defense-against-supply-chain-attacks-54541f410389> | [signers](wiki/signers.md) |
| <https://docs.aws.amazon.com/kms/latest/developerguide/cryptographic-attestation.html> | [hsm-and-enclaves](wiki/hsm-and-enclaves.md) |
| <https://docs.aws.amazon.com/kms/latest/developerguide/symm-asymm-choose-key-spec.html> | [hsm-and-enclaves](wiki/hsm-and-enclaves.md), [products](wiki/products.md) |
| <https://docs.cloud.google.com/multi-party-compute/architecture> | [products](wiki/products.md) |
| <https://docs.cloud.google.com/multi-party-compute/overview> | [operations](wiki/operations.md), [products](wiki/products.md) |
| <https://docs.metamask.io/embedded-wallets/infrastructure/> | [products](wiki/products.md) |
| <https://docs.metamask.io/embedded-wallets/infrastructure/mpc-architecture/> | [embedded-wallets](wiki/embedded-wallets.md) |
| <https://docs.metamask.io/embedded-wallets/infrastructure/sss-architecture/> | [composition](wiki/composition.md), [embedded-wallets](wiki/embedded-wallets.md) |
| <https://docs.metamask.io/snaps/features/custom-evm-accounts/security/> | [implementation](wiki/implementation.md) |
| <https://docs.openzeppelin.com/contracts/5.x/access-control> | [recovery-and-time-locks](wiki/recovery-and-time-locks.md) |
| <https://docs.openzeppelin.com/contracts/5.x/api/governance> | [recovery-and-time-locks](wiki/recovery-and-time-locks.md) |
| <https://docs.safe.global/advanced/smart-account-fallback-handler> | [smart-accounts](wiki/smart-accounts.md) |
| <https://docs.safe.global/advanced/smart-account-fallback-handler/smart-account-fallback-handler-tutorial> | [smart-accounts](wiki/smart-accounts.md) |
| <https://docs.safe.global/advanced/smart-account-guards> | [smart-accounts](wiki/smart-accounts.md) |
| <https://docs.safe.global/advanced/smart-account-modules> | [composition](wiki/composition.md), [recovery-and-time-locks](wiki/recovery-and-time-locks.md), [smart-accounts](wiki/smart-accounts.md), [threat-model](wiki/threat-model.md) |
| <https://docs.safe.global/advanced/smart-account-overview> | [chain-capabilities](wiki/chain-capabilities.md), [products](wiki/products.md), [smart-accounts](wiki/smart-accounts.md) |
| <https://docs.walletconnect.network/custodians/contract-access-control> | [implementation](wiki/implementation.md) |
| <https://docs.walletconnect.network/wallet-sdk/web/usage> | [implementation](wiki/implementation.md) |
| <https://docs.walletconnect.network/wallet-sdk/web/verify> | [implementation](wiki/implementation.md) |
| <https://docs.yubico.com/hardware/yubikey/yk-tech-manual/yk5-apps-piv.html> | [authentication](wiki/authentication.md), [products](wiki/products.md) |
| <https://eips.ethereum.org/EIPS/eip-1193> | [implementation](wiki/implementation.md) |
| <https://eips.ethereum.org/EIPS/eip-1271> | [smart-accounts](wiki/smart-accounts.md) |
| <https://eips.ethereum.org/EIPS/eip-20> | [composition](wiki/composition.md), [operations](wiki/operations.md) |
| <https://eips.ethereum.org/EIPS/eip-2612> | [operations](wiki/operations.md) |
| <https://eips.ethereum.org/EIPS/eip-4337> | [chain-capabilities](wiki/chain-capabilities.md), [smart-accounts](wiki/smart-accounts.md) |
| <https://eips.ethereum.org/EIPS/eip-712> | [smart-accounts](wiki/smart-accounts.md) |
| <https://eips.ethereum.org/EIPS/eip-7702> | [chain-capabilities](wiki/chain-capabilities.md) |
| <https://eips.ethereum.org/EIPS/eip-7951> | [authentication](wiki/authentication.md), [chain-capabilities](wiki/chain-capabilities.md) |
| <https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki> | [fundamentals](wiki/fundamentals.md), [seeds-and-backups](wiki/seeds-and-backups.md) |
| <https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki> | [seeds-and-backups](wiki/seeds-and-backups.md) |
| <https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki> | [recovery-and-time-locks](wiki/recovery-and-time-locks.md) |
| <https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki> | [recovery-and-time-locks](wiki/recovery-and-time-locks.md) |
| <https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki> | [fundamentals](wiki/fundamentals.md), [implementation](wiki/implementation.md), [multisig](wiki/multisig.md), [signers](wiki/signers.md) |
| <https://github.com/bitcoin/bips/blob/master/bip-0327.mediawiki> | [chain-capabilities](wiki/chain-capabilities.md), [threshold-signatures](wiki/threshold-signatures.md) |
| <https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki> | [chain-capabilities](wiki/chain-capabilities.md), [validation](wiki/validation.md) |
| <https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki> | [chain-capabilities](wiki/chain-capabilities.md), [multisig](wiki/multisig.md) |
| <https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki> | [chain-capabilities](wiki/chain-capabilities.md), [multisig](wiki/multisig.md), [seeds-and-backups](wiki/seeds-and-backups.md) |
| <https://github.com/satoshilabs/slips/blob/master/slip-0039.md> | [fundamentals](wiki/fundamentals.md), [seeds-and-backups](wiki/seeds-and-backups.md) |
| <https://github.com/siv2r/bip-frost-signing> | [threshold-signatures](wiki/threshold-signatures.md) |
| <https://pse.dev/blog/social-recovery-sdk> | [recovery-and-time-locks](wiki/recovery-and-time-locks.md) |
| <https://solana.com/docs/core/transactions/partial-signing> | [chain-capabilities](wiki/chain-capabilities.md), [fundamentals](wiki/fundamentals.md), [validation](wiki/validation.md) |
| <https://solana.com/docs/core/transactions/transaction-structure> | [chain-capabilities](wiki/chain-capabilities.md) |
| <https://solana.com/docs/tokens/basics/set-authority> | [chain-capabilities](wiki/chain-capabilities.md), [fundamentals](wiki/fundamentals.md) |
| <https://sparrowwallet.com/docs/best-practices.html> | [composition](wiki/composition.md), [multisig](wiki/multisig.md), [threat-model](wiki/threat-model.md) |
| <https://sparrowwallet.com/docs/connected-wallet.html> | [products](wiki/products.md), [signers](wiki/signers.md) |
| <https://support.ledger.com/article/Seed-tool> | [products](wiki/products.md) |
| <https://www.fireblocks.com/blog/gg18-and-gg20-paillier-key-vulnerability-technical-report> | [threat-model](wiki/threat-model.md), [threshold-signatures](wiki/threshold-signatures.md) |
| <https://www.ledger.com/blog/seed-tool-app> | [products](wiki/products.md), [seeds-and-backups](wiki/seeds-and-backups.md) |
| <https://www.rfc-editor.org/rfc/rfc9106.html> | [seeds-and-backups](wiki/seeds-and-backups.md) |
| <https://www.rfc-editor.org/rfc/rfc9591.html> | [fundamentals](wiki/fundamentals.md), [threshold-signatures](wiki/threshold-signatures.md) |
| <https://www.rfc-editor.org/rfc/rfc9700.html> | [embedded-wallets](wiki/embedded-wallets.md) |
| <https://www.w3.org/TR/webauthn-3/> | [authentication](wiki/authentication.md) |

## Search ledger and additional candidates

These queries returned the listed candidates. Inclusion here does not mean that the candidate supports a wiki claim.
Some result sets contained irrelevant pages or third-party commentary. Those pages were not used as technical authority.
The first discovery pass used these four queries:

- Bitcoin BIP 32 BIP 39 BIP 174 BIP 380 wallet backup descriptors specifications
- RFC 9591 FROST threshold signatures nonce reuse security BIP340 compatibility
- Safe smart account modules guards fallback handler security documentation
- WebAuthn passkeys YubiKey PIV supported algorithms secp256k1 cryptocurrency

Additional first-pass candidates included:

- <https://crypto.stackexchange.com/questions/113304/does-frost-threshold-signing-go-well-with-bip340> — discovery only. Used primary specifications instead.
- <https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md> — related implementation documentation.
- <https://bitcoin.org/bip/174/> — alternate BIP rendering. Used the canonical repository citation.
- <https://bitcoin.org/bip/391/> — related descriptor-format proposal, not used as a deployed compatibility claim.
- <https://github.com/safe-global/safe-smart-account/blob/main/contracts/Safe.sol> — version-sensitive implementation lead.
- <https://developers.yubico.com/yubico-piv-tool/YubiKey_PIV_introduction.html> — related PIV documentation.
- <https://developers.yubico.com/PIV/Introduction/YubiKey_and_PIV.html> — related model and firmware documentation.
- <https://developers.yubico.com/WebAuthn/WebAuthn%5FDeveloper%5FGuide/Algorithms.html> — related algorithm negotiation documentation.
- <https://www.spark.money/research/bitcoin-passkey-wallet-authentication> — discovery only. Used W3C and protocol specifications for technical claims.

Subsequent searches:

### site.docs.metamask.io embedded wallets authentication key reconstruction export recovery MPC

- <https://docs.metamask.io/embedded-wallets/infrastructure/mpc-architecture/>
- <https://docs.metamask.io/embedded-wallets/features/mpc/>
- <https://docs.metamask.io/embedded-wallets/infrastructure/sss-architecture/>
- <https://docs.metamask.io/embedded-wallets/infrastructure/>
- <https://docs.metamask.io/embedded-wallets/dashboard/advanced/key-export/>

### site:docs.cloud.google.com multi-party-compute overview wallet signing

- <https://docs.cloud.google.com/multi-party-compute/overview>
- <https://docs.cloud.google.com/multi-party-compute/architecture>
- <https://docs.cloud.google.com/multi-party-compute/bitcoin-custody>
- <https://docs.cloud.google.com/multi-party-compute/policy-evaluation>
- <https://docs.cloud.google.com/multi-party-compute/writing-rules>

### site:docs.walletconnect.network wallet session requests verify security

- <https://docs.walletconnect.network/wallet-sdk/web/verify>
- <https://docs.walletconnect.network/custodians/contract-access-control>
- <https://docs.walletconnect.network/wallet-sdk/ios/usage>
- <https://docs.walletconnect.network/wallet-sdk/android/verify>
- <https://docs.walletconnect.network/wallet-sdk/android/usage>

### site:docs.metamask.io snaps account management keyring api security

- <https://docs.metamask.io/snaps/features/custom-evm-accounts/security/>
- <https://docs.metamask.io/snaps/reference/permissions/>
- <https://docs.metamask.io/snaps/reference/keyring-api/account-management/>
- <https://docs.metamask.io/snaps/features/custom-evm-accounts/create-account-snap/>
- <https://docs.metamask.io/snaps/learn/best-practices/security-guidelines/>

### site:solana.com/docs core transactions signatures recent blockhash token authority multisig

- <https://solana.com/docs/core/transactions/transaction-structure>
- <https://solana.com/docs/core/transactions>
- <https://solana.com/docs/core/transactions/partial-signing>
- <https://solana.com/docs/core/transactions/transaction-pipeline>
- <https://solana.com/docs/tokens/basics/set-authority>

### site:docs.aws.amazon.com KMS ECC_SECG_P256K1 signing Nitro enclaves attestation

- <https://docs.aws.amazon.com/kms/latest/developerguide/symm-asymm-choose-key-spec.html>
- <https://docs.aws.amazon.com/kms/latest/developerguide/cryptographic-attestation.html>
- <https://docs.aws.amazon.com/kms/latest/developerguide/attested-calls.html>
- <https://docs.aws.amazon.com/kms/latest/developerguide/conditions-nitro-enclave.html>
- <https://docs.aws.amazon.com/AWSJavaSDK/latest/javadoc/com/amazonaws/services/kms/AWSKMSAsyncClient.html>

### site:sparrowwallet.com docs multisig wallet descriptor backup hardware

- <https://sparrowwallet.com/docs/connected-wallet.html>
- <https://sparrowwallet.com/docs/best-practices.html>
- <https://sparrowwallet.com/docs/airgapped-wallet-sdcard.html>
- <https://sparrowwallet.com/features/>
- <https://sparrowwallet.com/docs/airgapped-wallet-qr.html>

### site:trezor.io learn hardware wallet security passphrase supply chain shamir backup

- <https://blog.trezor.io/trezors-multi-layer-defense-against-supply-chain-attacks-54541f410389>
- <https://trezor.io/learn/advanced/standards-proposals/what-is-shamir-backup>
- <https://blog.trezor.io/10-common-faqs-around-passphrases-in-trezor-wallets-07f30c7e6a91>
- <https://trezor.io/guides/trezor-devices/trezor-safe-3/trezor-safe-3-faqs>
- <https://trezor.io/learn/security-privacy/personal-security-standards/security-threats-to-crypto-wallets-and-how-trezor-defends-against-them>

### site:ledger.com seed tool app security entropy

- <https://www.ledger.com/blog/seed-tool-app>
- <https://support.ledger.com/article/Seed-tool>
- <https://www.ledger.com/blog/part-1-genesis-of-ledger-recover-self-custody-without-compromise>
- <https://support.ledger.com/article/360010073520-zd>
- <https://donjon.ledger.com/threat-model/os-random-number-generation/>

### site:pse.dev social recovery sdk guardians timelock

- <https://pse.dev/blog/social-recovery-sdk>
- <https://maci.pse.dev/docs/guides/sdk>
- <https://maci.pse.dev/docs/v2.x/technical-references/smart-contracts/Gatekeepers>
- <https://js.semaphore.pse.dev/>
- <https://docs.semaphore.pse.dev/guides/groups>

### site:github.com bitcoin bips bip-0327 MuSig2 n of n security

- <https://github.com/bitcoin/bips/blob/master/bip-0327.mediawiki>
- <https://github.com/bitcoin/bips/pull/1964>
- <https://github.com/bitcoin/bips/blob/master/bip-0327/reference.py>
- <https://github.com/siv2r/bip-frost-signing/issues/7>
- <https://github.com/input-output-hk/musig2/security>

### site:fireblocks.com MPC TSS wallet vulnerabilities BitForge technical

- <https://www.fireblocks.com/blog/gg18-and-gg20-paillier-key-vulnerability-technical-report>
- <https://www.fireblocks.com/blog/bitforge-fireblocks-researchers-uncover-vulnerabilities-in-over-15-major-wallet-providers>
- <https://www.fireblocks.com/blog/lindell17-abort-vulnerability-technical-report>
- <https://info.fireblocks.com/hubfs/A_Note_on_the_Security_of_GG.pdf>
- <https://www.fireblocks.com/bitforge>

### site:docs.openzeppelin.com contracts 5.x TimelockController proposer executor canceller delay lock

- <https://docs.openzeppelin.com/contracts/5.x/governance>
- <https://docs.openzeppelin.com/contracts/5.x/access-control>
- <https://docs.openzeppelin.com/contracts/5.x/api/governance>
- <https://docs.openzeppelin.com/contracts/5.x/api/access>
- <https://docs.openzeppelin.com/contracts/5.x/changelog>

### site:w3.org TR webauthn-3 verifying authentication assertion challenge origin rpIdHash user verification

- <https://www.w3.org/TR/webauthn-3/>
- <https://www.w3.org/TR/2026/CR-webauthn-3-20260113/>
- <https://www.w3.org/TR/2023/WD-webauthn-3-20230927/>
- <https://www.w3.org/TR/2021/WD-webauthn-3-20210427/>
- <https://lists.w3.org/Archives/Public/public-webauthn/2021Nov/0007.html>

### site:github.com bitcoin bips bip-0039 PBKDF2 2048 passphrase every passphrase

- <https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki>
- <https://github.com/iancoleman/bip39/issues/655>
- <https://github.com/libbitcoin/libbitcoin-system/blob/master/src/wallet/mnemonics/mnemonic.cpp>
- <https://github.com/bitcoinj/bitcoinj/blob/master/core/src/main/java/org/bitcoinj/crypto/MnemonicCode.java>
- <https://github.com/treib-holdings/learnbitcoin-content/blob/main/glossary/bip-39.md>

### site:docs.safe.global ERC1271 signatures modules guard recovery

- <https://docs.safe.global/advanced/smart-account-signatures>
- <https://docs.safe.global/advanced/smart-account-fallback-handler/smart-account-fallback-handler-tutorial>
- <https://docs.safe.global/advanced/smart-account-guards>
- <https://docs.safe.global/reference-smart-account/guards/setModuleGuard>
- <https://docs.safe.global/advanced/smart-account-guards/smart-account-guard-tutorial>


## Further research and maintenance

These tasks do not imply that the generic technique coverage is missing.
They become necessary when selecting a particular deployment or extending the wiki's network scope.

- [ ] Pin the full specification and test vectors for the selected threshold library. Inspect DKG, refresh, backup, and malicious-participant assumptions.
- [ ] Check BIP-340 FROST implementation maturity and independent audits before recommending a particular library: <https://github.com/siv2r/bip-frost-signing>.
- [ ] Recheck Google Cloud launch stage, supported algorithms, exit facilities, and v1beta migration: <https://docs.cloud.google.com/multi-party-compute/overview>.
- [ ] Resolve MetaMask SDK-specific reconstruction and export behavior with versioned SDK tests: <https://docs.metamask.io/embedded-wallets/infrastructure/mpc-architecture/>.
- [ ] Retrieve the complete PSE article through a working rendering path before documenting its SDK: <https://pse.dev/blog/social-recovery-sdk>.
- [ ] Check EIP-7951 activation and invalid-point test vectors on each selected network: <https://eips.ethereum.org/EIPS/eip-7951>.
- [ ] Test each selected hardware model's display, policy registration, script support, and backup restoration.
- [ ] Test a selected Ledger SSKR backup with an independent compatible restore implementation.
- [ ] Add separate profiles for other chains when user requirements name them. Do not extrapolate from curve support alone.
- [ ] Add specialized guides for validator withdrawal keys, Lightning channel state, bridges, and protocol positions when those assets enter scope.
- [ ] Obtain jurisdiction-specific legal review when a design needs legal custody classification or inheritance enforcement.
- [ ] Revisit source dates after material product, firmware, protocol, or contract changes.

Unvisited research leads from the original hints remain in [RESEARCH.md](RESEARCH.md).
Useful deeper leads include the following. They were not treated as verified sources in this pass:

- <https://www.nccgroup.com/research/state-of-the-art-of-private-key-security-in-blockchain-ops-1-concepts-types-of-wallets-and-signing-strategies/>
- <https://www.nccgroup.com/research/state-of-the-art-of-private-key-security-in-blockchain-ops-3-private-key-storage-and-signing-module/>
- <https://www.nccgroup.com/research/state-of-the-art-of-private-key-security-in-blockchain-ops-4-approvals-and-policies/>
- <https://mpc.cs.berkeley.edu/categories/crypto-wallet/>
- <https://zengo.com/one-engine-many-championships/>
- <https://vultisig.com/mpc>
- <https://www.coinbase.com/en-sg/blog/building-user-focused-web3-wallets-at-coinbase>

## Validation record

- All 19 wiki pages are reachable from `wiki/ENTRY.md`.
- Every local Markdown target exists. No dangling page or broken local link was found.
- The wiki contains 52 distinct cited external URLs. Sources were checked through research extracts, not a separate exhaustive HTTP link audit.
- The ASD-STE100 linter reports zero findings after revision. This does not replace a full official-dictionary review.
- UI typecheck: passed.
- UI lint: passed.
- UI unit/component tests: 38 passed across five files.
- UI production build: passed, with the existing large-chunk warning.
- Browser suite: 23 passed and four intentionally skipped across Chromium, Firefox, and WebKit.
- Geometry-specific tests run only in Chromium, which accounts for the four skips.
- The first browser attempt could not start the preview server inside the sandbox.
- The next attempt reached the app but failed because the production build lacked `VITE_OPENAI_MODEL`.
- Rebuilt with `VITE_OPENAI_MODEL=gpt-6-luna`, then reran the production browser suite successfully.
- No UI source change was required. No additional manual keyboard inspection was performed for this documentation-only change.
- No live-provider or live-custody behavior was tested.

The pre-existing modification in `UI/src/prompts.ts` was left untouched.
Read Entire CLI guidance and listed open trails. The project returned no open trails.
No trail, commit, checkpoint, or external message was created.

Commands used from `UI/`, with Node 26.8.1 on `PATH`:

```sh
npm run typecheck
npm run lint
npm test
VITE_OPENAI_MODEL=gpt-6-luna npm run build
PLAYWRIGHT_BROWSERS_PATH=/tmp/ccc-playwright CI=1 npm run test:e2e
```

Wiki checks used the ASD-STE100 skill's `scripts/ste-lint.py`, a local-link traversal from `ENTRY.md`, and `git diff --check`.
The link traversal also checked the research log's local links.
