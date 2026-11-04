# Threat model

[Entry](ENTRY.md) · [Composition](composition.md) · [Validation](validation.md)

This page gives design analysis. Use the linked technique pages for the underlying mechanisms.
Assess theft and loss of access separately. A control that reduces one risk can increase the other.

## Assets and boundaries

Protect signing keys, shares, recovery secrets, wallet configuration, and transaction intent.
Also protect policy administration, deployment credentials, identity recovery, and the software update process.
Public metadata needs integrity even when confidentiality is optional.

Draw boundaries around the browser, coordinator, signer, identity service, cloud account, contract, and blockchain node.
Record who can change code or policy at each boundary.
Include administrators who can reset another administrator's credentials.

## Failure analysis

| Event | Mechanism | Theft or lock result | Control and residual risk |
| --- | --- | --- | --- |
| Host malware changes a destination | The signer approves bytes from an untrusted host. | Funds move to the attacker. | Independently decode and display the signed payload. Human review can still fail. |
| Device or firmware is malicious | It leaks secrets or signs unauthorized data. | One signing authority becomes hostile. | Independent signer quorum limits one-device compromise. Shared firmware can defeat independence. |
| Backup theft | The attacker restores a key outside normal controls. | Device PIN and service policy become irrelevant. | Protect backup authority with the same rigor as signing authority. |
| Backup loss | Too few valid recovery factors survive. | Funds remain on-chain but inaccessible. | Test restoration across independent failure domains. |
| Identity takeover | Recovery resets unlock several factors. | An apparent quorum becomes one administrative account. | Separate identity recovery paths and administrators. |
| Malicious contract module | Another execution path bypasses normal owners. | Funds move despite the owner threshold. | Enumerate modules and administrative paths. Audit exact deployments. |
| Signer refuses or service fails | The protocol cannot reach its threshold. | Operations stop or recovery fails. | Test provider-independent recovery and degraded signing. |
| RPC lies or becomes stale | The coordinator sees false state or a wrong chain. | Wrong actions, hidden receipts, or failed transactions. | Check chain identity and critical state through independent sources. |
| Approval race | Concurrent requests each pass the same balance or limit check. | Aggregate spending exceeds the limit. | Reserve capacity atomically and bind approvals to exact requests. |
| Supply-chain compromise | A dependency or deployment update changes wallet behavior. | All users can receive malicious signing requests. | Pin releases, check artifacts, and restrict deployment authority. |
| Coercion or collusion | Enough authorized people cooperate with an attacker. | Cryptography accepts their signatures. | Separate locations and roles. Evaluate delayed recovery and response capability. |
| Chain disruption | Reorganization, congestion, or censorship delays execution. | A response misses its safety deadline. | Include confirmation and fee margins in time assumptions. |

[Safe modules](https://docs.safe.global/advanced/smart-account-modules) illustrate an alternate spending path.
[BitForge research](https://www.fireblocks.com/blog/gg18-and-gg20-paillier-key-vulnerability-technical-report) illustrates protocol-level key exposure.
[Sparrow's operational guidance](https://sparrowwallet.com/docs/best-practices.html) explains device and location separation.

## Minimum compromise sets

Write a Boolean condition for each spend path. Use identities that represent actual control, not product labels.
For `(A AND B) OR C`, compromise of `C` is sufficient.
For a 2-of-3 wallet, the minimal sets are `{A,B}`, `{A,C}`, and `{B,C}`.

Then substitute shared dependencies.
If one cloud administrator controls `A` and `B`, that administrator is a one-event compromise set.
If one backup contains both keys, theft of that backup has the same effect.
If the user must use one website to recover all shares, that website is an availability dependency.

Evaluate loss sets too. A 2-of-3 scheme tolerates one unavailable participant under its protocol assumptions.
Two permanently lost participants can remove normal spending authority.
Do not calculate independent failure probabilities when components share location, software, identity, or administration.

## Questions for the architect

1. What is the maximum acceptable loss before detection?
2. How long can normal signing remain unavailable?
3. Which people can collude, disappear, or face coercion together?
4. Which credentials can reset another factor?
5. What can each vendor do during a compromise or shutdown?
6. Who notices an unauthorized recovery request?
7. Can that person complete a response before the delay expires?
8. Which failures cannot be recovered without moving assets?

Record assumptions with owners and review dates in the [design contract](design-contract.md).
Do not accept an unexplained claim such as “MPC makes this secure.”
