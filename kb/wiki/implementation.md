# Signing software and integration boundaries

[Entry](ENTRY.md) · [Design contract](design-contract.md) · [Validation](validation.md)

## Architecture boundary

A wallet coordinator gathers intent, reads chain state, constructs payloads, collects approvals, and broadcasts signed transactions.
A signer checks requests and produces signatures within its own trust boundary.
An indexer helps discover history and balances. It does not inherently control spending.

An indexer API key is a service credential, not a wallet private key.
A browser application cannot keep a credential secret from its own code or user.
Use origin-restricted public client credentials only when the provider supports that model.
Use a separate authenticated service for privileged credentials when needed.

The current CCC chat and diagram are design interfaces. Their LLM provider key is not a custody key.
This wiki does not authorize an agent to retrieve wallet secrets or sign live transactions.
Treat model-generated transaction descriptions as untrusted input to deterministic validation.

## Transaction state machine

Use explicit states:

```text
proposed -> decoded -> policy_checked -> awaiting_approvals
         -> authorized -> signing -> signed -> submitted -> confirmed -> finalized
```

Allow explicit `rejected`, `cancelled`, `expired`, and `failed` outcomes where appropriate.
A `signed` operation can remain executable after local cancellation.
An unknown submission result requires reconciliation, not automatic construction of another payment.

Assign a unique operation ID and immutable payload digest.
Bind approvals to the digest, account, network, policy version, and expiry.
Invalidate approvals when relevant content or authority changes.
Persist enough nonsecret state to reconcile retries after a crash.

## Deterministic validation

1. Check the network identity and selected account.
2. Parse bounded input using maintained libraries.
3. Decode all outputs, instructions, or contract calls.
4. Identify asset amounts in integer base units.
5. Check fees, replay scope, expiry, and policy limits.
6. Present the exact effects to the approver.
7. Collect the required independent approvals.
8. Send the immutable signing payload to the signer.
9. Check the returned signature against that payload.
10. Broadcast without changing signed fields.
11. Reconcile receipt, state changes, and finality.

Simulation can detect some harmful effects. It does not guarantee future state or protect against a dishonest RPC service.
A contract's state can change between simulation and inclusion.
Bind safe execution constraints into the transaction where the protocol permits them.

## Bitcoin and PSBT

Use the PSBT version supported by every participant.
Check previous outputs, script ownership, key derivation, every output, change, fees, and the requested sighash mode.
A sighash mode controls which transaction parts the signature commits to.
Reject unexpected modes rather than assuming every signature covers everything.

Do not trust PSBT labels or change claims from the coordinator.
Derive expected scripts from the registered wallet policy.
After combining signatures, check the final transaction before broadcast.
See [BIP-174](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki).

## EIP-1193 provider interface

EIP-1193 defines a JavaScript provider API with a `request` method and events such as `accountsChanged` and `chainChanged`.
It does not define custody or guarantee that a provider is trustworthy.
See [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193).

Treat provider objects and returned values as untrusted.
Handle user rejection, unauthorized methods, unsupported methods, and disconnection explicitly.
On account or chain change, invalidate pending assumptions and require fresh validation.
Do not confuse an RPC connection with permission to use an account.

A browser coordinator can call an external wallet through this interface.
That pattern avoids giving the coordinator a private key, but malicious coordinator code can still request harmful signatures.
Preserve independent transaction review.

## WalletConnect

WalletConnect transports proposals and requests between applications and wallets.
A wallet approves session namespaces that identify allowed chains, accounts, methods, and events.
A session approval is not blanket approval for every later transaction.
See the [Wallet SDK workflow](https://docs.walletconnect.network/wallet-sdk/web/usage).

Check the session, request ID, chain, account, method, and expiry before each action.
Reject duplicate or obsolete requests according to a defined policy.
Remove permissions and pending requests when a session ends.
Do not expose pairing material or session secrets in logs.

WalletConnect’s domain-verification API supplies domain-risk signals. Its documentation explicitly limits its guarantees.
A valid domain result does not prove that a transaction is safe.
See [Domain verification](https://docs.walletconnect.network/wallet-sdk/web/verify) and
[contract access control](https://docs.walletconnect.network/custodians/contract-access-control).

## MetaMask account-management Snap

An account-management Snap can implement custom account behavior through the Keyring API.
The builder must select the exact supported account type, SDK, permissions, and user interface.
A Snap is an integration boundary, not automatic proof of secure custody.

MetaMask directs builders to use `onKeyringRequest` for account-management requests.
Its security guidance requires restricted caller origins and method access.
Account objects can reach dapps and must not contain secrets.
See [account-management security](https://docs.metamask.io/snaps/features/custom-evm-accounts/security/).

Keep request IDs bound to immutable payloads during asynchronous approval.
Check redirect origins. Sanitize errors and remove secret-bearing logs.
Do not load remote executable code into the Snap.
Reject export or account-management methods that the design does not authorize.

## Browser-only coordinator versus local signer

A browser-only coordinator suits watch-only discovery and external-wallet signing.
A local or remote signer can retain key material behind a narrow authenticated API.
An offline signer requires a defined transport and a complete, verifiable payload.

If the browser holds a key, document that any authorized hostile browser deployment can access or misuse it.
JavaScript memory clearing does not provide a reliable hardware-style zeroization guarantee.
Avoid promising hardware isolation from a software-only vault.

## Builder implementation rules

Use reviewed cryptographic libraries and published test vectors.
Keep chain adapters separate from identity, policy, and transport code.
Use explicit typed errors for parsing, policy denial, cancellation, signer failure, and uncertain submission.
Prevent late responses from authorizing an obsolete request.

Do not implement a new threshold protocol from prose in this wiki.
Pin compatible protocol versions and test interoperability before adding funds.
Complete the [validation plan](validation.md) for every authority path.
