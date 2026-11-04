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

MuSig2 is an `n-of-n` aggregate signature protocol. It is not an arbitrary `t-of-n` threshold scheme.
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
