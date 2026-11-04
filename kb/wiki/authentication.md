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
