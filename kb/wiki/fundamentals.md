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
| Threshold `t-of-n` | At least `t` of `n` participants must cooperate. |
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
