# Architect-to-builder design contract

[Entry](ENTRY.md) · [Composition](composition.md) · [Implementation](implementation.md)

This is a proposed knowledge-base contract. It is not a schema already implemented in the CCC interface.
The architect must resolve material unknowns before the builder deploys custody controls.
Never include private keys, shares, seed phrases, or credential values in this document.

## User requirements

| Field | Required content |
| --- | --- |
| Assets | Chain, network, asset contract or mint, native balance, and protocol positions |
| Exposure | Maximum acceptable loss and reserve allocation |
| Operations | Frequency, transaction types, fee budget, and signing latency |
| People | Approvers, technical skills, availability, and succession requirements |
| Resources | Devices, secure locations, cloud services, and operating budget |
| Availability | Tolerated outage duration and recovery completion target |
| Threats | Malware, physical theft, coercion, insider collusion, and provider failure assumptions |
| Constraints | Privacy, accessibility, travel, organizational, and legal review requirements |

Describe user capabilities realistically. A procedure that the user cannot maintain is not a working control.
Record rejected alternatives and the concrete reason for rejection.

## Authority specification

For each asset location, provide:

1. Normal spending conditions.
2. Recovery and inheritance conditions.
3. Key export conditions.
4. Owner, module, policy, and implementation change conditions.
5. Administrative credential-reset conditions.
6. Minimal compromise sets and permanent-loss sets.
7. Every enforcement location and permitted override.

Give each authority a stable identifier.
Map it to the actual person, device, service, backup location, and administrator.
State which authorities share a failure domain.

## Component record

Use this template for each component:

```yaml
id: signer_A
role: independent owner signer
implementation: selected product and exact version
network: explicit chain and network
key_scheme: exact curve and signature scheme
secret_reference: protected inventory reference only
controller: person or organization identifier
administrators: explicit identifiers
failure_domains: explicit identifiers
inputs: accepted formats and authenticated callers
outputs: signature or public metadata only
policy_enforcement: exact local or chain checks
backup: format and protected location reference
recovery: procedure identifier
exit: provider-independent procedure or explicit limitation
evidence: source URLs and test record identifiers
status: verified or documented-only or unknown
```

Replace every descriptive placeholder before implementation.
Unknown chain support, recovery authority, or key ownership is a blocking design issue.

## Transaction and recovery contracts

Define the exact approval payload and its canonical digest.
Define the permitted assets, targets, calls, amounts, fees, lifetime, and replay scope.
Define how the system handles uncertain broadcast results and stale approvals.

For recovery, define the initiating authority, required quorum, notification route, delay, cancellation route, and completion action.
State what changes after recovery and which old credentials remain dangerous.
Include fee funding and provider-outage behavior.

## Evidence and acceptance

Attach a source date and implementation version to each external capability claim.
Link tests to security properties, not only to components.
For example: “One compromised coordinator cannot cause a reserve spend without two independent approvals.”
Then provide a test that changes the payload after the first approval and demonstrates rejection.

Require a restore rehearsal, a provider-failure exercise, and an authority-path review before funding.
Use the [validation checklist](validation.md) as the minimum test plan.
The builder must report deviations instead of silently weakening requirements.
