# Multisignature wallets

[Entry](ENTRY.md) · [Threshold signatures](threshold-signatures.md) · [Composition](composition.md)

## Mechanism and applicability

A multisig spending rule requires signatures from several independent keys.
A `t-of-n` rule accepts at least `t` authorized keys from `n` registered keys.
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
| Cosigner refusal | Fewer than `t` available keys cannot satisfy the rule. | Choose a loss-tolerant threshold or explicit recovery path. |
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
