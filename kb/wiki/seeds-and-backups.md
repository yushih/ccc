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

A `t-of-n` scheme divides a secret into shares. At least `t` shares reconstruct it.
Fewer than `t` shares do not reveal the secret under the scheme's assumptions.
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
