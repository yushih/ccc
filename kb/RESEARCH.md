Build an LLM wiki on cryptocurrency custodial technologies.

The wiki will be feed into an agent that design the custodial solution customized to users' requirements and resources. It will also used by another agent that builds the solution into a software based on the design.

The wiki should provide enough technical details so that a human or an agent with fundamental computer system and programming knowledge but no special knowledge in cryptocurrency custody becomes a domain expert after reading it. Specifically, for each technique, it should answer:

- where does it apply?

For example: on which chain it can be used?

- what attack surface does it expose?

For example: hardware wallets can be tampered with to transmit the seed phrase to the hacker

- what are the failure modes that leads to funds be stolen or locked?

- how can it be composed with other solutions to form a multi-layer defense system?

For each question, it documents the technical reason instead of only a list of conclusions.

The wiki resides in the wiki/ directory and consists of hyperlinked markdown files. The entry point or root of the wiki is ENTRY.md, which is always loaded into the agent context. Subpages will be loaded on-demand at the request of the agents. So all pages must be reachable via links from ENTRY.md. There should be no dangling page.


Build the wiki by running a loop: start with the skeleton in ENTRY.md and the hints at the end of this file. You can read a web page and update the wiki using its knowledge. You also do web searches. It's OK to write down what you already know but it is good if you could back it up with some references. The pages you write should have the rigor of the Wikipedia. Use ASD-STE100 Simplified Technical English.

Stop when you think the wiki is sufficient complete in broad and depth to achieve previously stated purpose.

Besides writing the wiki in wiki/ directory. Keep a log in LOG.md. Write down the URLs you visited so that you don't repeated read one page. Also write down the todos, including links you encountered that you think may contain useful information, ideas that you generated on the way, and etc, so that you don't forget things and you will have a trace of your hard work. In additional to assisting your current research, the log also can help resume the work should it breaks, and it becomes an anchor point for further research work.

# hints

# topics, plausible solutions and questions 

yubikey

WalletConnect

EIP-1193

# possibly useful links

https://www.spark.money/glossary/dead-man-switch

https://www.ledger.com/academy/glossary/time-lock

https://www.spark.money/glossary/social-recovery

MPC Framework Online Talk https://www.youtube.com/watch?v=KtH_Emb8q8Y

https://pse.dev/blog/social-recovery-sdk

https://docs.metamask.io/embedded-wallets/authentication/
https://metamask.com/news/introducing-metamask-social-login
https://support.metamask.io/configure/wallet/social-login/


https://www.hardwarewalletonline.com/security/shamir-backup/

https://support.ledger.com/article/Seed-tool
https://www.ledger.com/blog/seed-tool-app

https://www.fireblocks.com/blog/mpc-vs-multi-sig

https://www.spark.money/research/frost-threshold-signatures-explained

Google Cloud Multi-party Compute overview  https://docs.cloud.google.com/multi-party-compute/overview

Sparrow Bitcoin multisig
  Multi-vendor Multi-sig Guide for Desktop using any hardware wallets on Sparrow https://www.youtube.com/watch?v=8zyKS2jQpv8
  Why You NEED a Multi-Vendor Multisig Bitcoin Wallet (And How to Build One)  https://www.youtube.com/watch?v=Ja3ETXLmklI
  The Multisig Misunderstanding That's Keeping Your Bitcoin Less Secure https://www.youtube.com/watch?v=aU5_ONNQPGM

[zengo's mpc cryptographic lib]One Engine, Many Championships https://zengo.com/one-engine-many-championships/
Exploring the Basics of MPC Digital Wallet Infrastructure https://safeheron.com/blog/mpc-digital-wallet-infrastructure-basics-and-how-it-works/

Deep Dive : State Of Multi Party Computation Wallets in 2025 https://www.binance.com/en/square/post/23815520474738


What is MPC (Multi-Party Computation)? MPC 101 https://www.fireblocks.com/report/what-is-mpc
*What is a multi-party computation (MPC) wallet? The complete developer guide https://www.alchemy.com/overviews/what-is-a-multi-party-computation-mpc-wallet
  https://www.alchemy.com/dapps/top/wallets?childCategories=MPC+wallets

Building user-focused web3 wallets at Coinbase https://www.coinbase.com/en-sg/blog/building-user-focused-web3-wallets-at-coinbase
Digital Asset Management with MPC (Whitepaper) https://www.coinbase.com/en-sg/blog/digital-asset-management-with-mpc-whitepaper?country=SG&currency=SGD&mobile=false&japan_bespoke_content=false&logged_in=false&null=
The Free Open-Source MPC Wallet For Everyone https://vultisig.com/mpc

A hub for real-world MPC deployments https://mpc.cs.berkeley.edu/categories/crypto-wallet/ 



Self-Custodial vs Custodial Wallets: The Tradeoffs Explained https://www.spark.money/research/self-custodial-vs-custodial-wallets
  The Custody Spectrum
Cooperative Custody https://www.spark.money/glossary/cooperative-custody

Passkeys for Bitcoin Wallets: How WebAuthn Replaces Seed Phrases https://www.spark.money/research/bitcoin-passkey-wallet-authentication
 EIP-7951: Precompile for secp256r1 Curve Support
 
FROST Threshold Signatures: Distributed Key Generation for Bitcoin https://www.spark.money/research/frost-threshold-signatures-explained

  
HSM vs MPC vs Multi-Sig Wallets: Understanding Institutional Digital Asset Security Architectures https://www.ceffu.com/blog/HSM-vs-MPC-vs-Multi-Sig-Wallets-Understanding-Institutional-Digital-Asset-Security-Architectures
Can HSM technology make blockchain wallets and transactions safer? How hardware security modules could protect your crypto assets https://medium.com/orbs-network/can-hsm-technology-make-blockchain-wallets-and-transactions-safer-8e91dc48f1a2

https://iq.wiki The World's Largest Blockchain & Crypto Encyclopedia. Explore the premier collection of articles on blockchain, decentralized finance and Web3 - curated by industry leading experts & educators, fact-checked and updated in real-time by SOPHIA, our renowned AI Editor


https://iq.wiki/wiki/multi-signature-wallet

State of the Art of Private Key Security in Blockchain Ops - 1. Concepts, Types of Wallets and Signing Strategies https://www.nccgroup.com/research/state-of-the-art-of-private-key-security-in-blockchain-ops-1-concepts-types-of-wallets-and-signing-strategies/
State of the Art of Private Key Security in Blockchain Ops - 2. Common Custody Solutions Architectures
State of the Art of Private Key Security in Blockchain Ops - 3. Private Key storage and Signing Module https://www.nccgroup.com/research/state-of-the-art-of-private-key-security-in-blockchain-ops-3-private-key-storage-and-signing-module/
State of the Art of Private Key Security in Blockchain Ops - 4. Approvals and Policies https://www.nccgroup.com/research/state-of-the-art-of-private-key-security-in-blockchain-ops-4-approvals-and-policies/

Passkey based Account Abstraction signer for smart contract wallets https://ethresear.ch/t/passkey-based-account-abstraction-signer-for-smart-contract-wallets/15856
Passkeys wallet on the EVM https://medium.com/@salvayre.yoan/passkeys-wallet-on-the-evm-69d4930ea4af
Passkey Wallets Explained https://eco.com/support/en/articles/15039720-passkey-wallets-explained
How Passkey Wallets Work https://blog.abs.xyz/blog/articles/how-passkey-wallets-work
How to Use Passkeys on Ethereum https://www.stackup.fi/resources/passkeys-webauthn-erc4337
