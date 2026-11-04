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
