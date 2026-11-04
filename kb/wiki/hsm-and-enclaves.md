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
