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
