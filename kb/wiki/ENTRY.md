## The solution space

These are not meant to be exhaustive list. They are just hints.

### 1. hardware wallet

- Extra security and risk with BIP-39 extra passphrase
- Shamir backup

### 2. software (seed phrase) wallet

Run on airgapped computer. Use a flash drive to pass in the transaction and pass out the signature.

Run on airgapped mobile phone. Use QR code / bluetooth to transfer transactions and signatures.

### 3. passkey

### 4. OAuth login

web3auth, now metamask embedded wallet

### 5. social recovery

### 6. threshold signatures

#### 6.1. multi-party computation

#### 6.2. multisig wallet

Ethereum: https://safe.global/

### 7. vendor solutions

Google Cloud MPC wallet

### 8. time lock and dead man's switch

### 9. general (non-cryptocurrency-wallet-specific) technologies

#### 9.1. password encrypted files

#### 9.2. web2 IAM

### 10. biometric solutions

### 11. HSM

## Solution composition

Example: a wallet that a gated by either a hot signer or a cold signer. The hot signer requires signature from both a hardware wallet and a software wallet running on a mobile phone. The colder signer is software wallet on a laptop kept in a safe.


## Patterns and best practices

Hot/cold wallet separation.



## For enterprise users

Support approval process, roles, approval group, approval threshold, audit requirements, and etc.

## Implementation space

This section answers the question: how will the custodial solution actually sign transactions.

Plausible methods are:

- custom-built Metamask account snap

- custom-built standalone wallet, using an indexer service to read/write the blockchain, whose API key will be provided by the user. Prefer Single Page Web App.

