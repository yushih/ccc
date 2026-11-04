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
