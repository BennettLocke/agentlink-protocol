# AgentLink Compatibility Matrix

Status: Draft  
Applies to: AgentLink Protocol `v0.2` and security/key-system guidance `v0.3`

This matrix turns the level definitions in `docs/compatibility-checklist.md` into implementation tracks. Use it before publishing claims, SDKs, connector examples, or server integrations.

The matrix is deliberately conservative. A project can support AgentLink-shaped JSON without being safe to call "AgentLink compatible" for human-owned agent communication.

## How To Use This Matrix

1. Choose the implementation type that matches your project.
2. Pick the highest level where every required row is implemented and tested.
3. Publish the exact draft and level in your README, release notes, or connector docs.
4. Link to evidence: schemas, tests, examples, screenshots, logs, or security notes.

Recommended claim:

```text
Compatible with AgentLink Protocol v0.2 Level 2.
Implements AgentLink security/key-system v0.3 Level 4.
```

## Implementation Tracks

| Implementation type | Expected baseline | Highest likely draft level before review | Evidence required |
|---|---:|---:|---|
| Client or desktop app | Level 1 | Level 4 | UI preserves sender mode, on-behalf-of display, message history, receipts, and ciphertext handling if claimed. |
| Relay server | Level 2 | Level 5 | API or protocol tests for actor-scoped auth, participant visibility, history ordering, realtime events, receipts, nonce policy, and Agent grant checks. |
| Agent connector | Level 1 | Level 5 | Connector README names owner, Agent identity, approval behavior, token scope, local-only or production boundary, and grant handling if encrypted access is claimed. |
| SDK or library | Level 0 | Level 4 | Unit tests build and validate envelopes, events, approvals, security contexts, and ciphertext envelopes without hiding unsupported server behavior. |
| Mock connector example | Level 0 | Level 2 | Local-only example runs without secrets and shows translation into AgentLink messages or events. |
| Hosted Agent platform | Level 2 | Level 5 | Public docs for user authorization, Agent identity, audit trail, transport security, token boundaries, and revocation behavior. |

## Level Matrix

| Level | Capability | Client or desktop app | Relay server | Agent connector | SDK or library | Evidence required |
|---:|---|---|---|---|---|---|
| Level 0 | Message Shape | Parse and render actor/message fields. | Accept and emit valid envelopes. | Translate local task input into valid envelopes. | Construct and validate envelopes. | Schema validation and example payloads. |
| Level 1 | Human-Owned Agent Semantics | Show whether a message is human-sent, agent-drafted, or agent-sent. | Preserve `sender_mode` and `on_behalf_of`. | Never present Agent output as direct human text. | Require `on_behalf_of` for Agent actions. | UI screenshots, tests, or serialized examples. |
| Level 2 | Relay And Sync | Load history, receipts, and realtime or polling updates. | Enforce participant visibility, stable ids, token scope, history ordering, receipts, and realtime events. | Use scoped tokens and document delivery limitations. | Model receipts/events without claiming server enforcement. | API tests, realtime tests, token-scope tests, or documented limitations. |
| Level 3 | Security Metadata | Display or preserve security state. | Validate timestamps, nonces, signatures, replay windows, and audit ids where claimed. | Sign privileged messages if production connector claims Level 3. | Build canonical signing payloads but document verification boundaries. | Signature tests, nonce replay tests, and audit metadata examples. |
| Level 4 | Encrypted Message Envelope | Handle `content.type = "ciphertext"` without plaintext fallback. | Store ciphertext, validate suite/key/nonce/tag, enforce nonce uniqueness. | Read encrypted grants only when explicitly authorized. | Build and validate ciphertext envelopes without inventing crypto. | Ciphertext examples, validation tests, and plaintext-handling policy. |
| Level 5 | Agent Grant Security | Show grant state and revocation where relevant. | Enforce scoped, expiring, revocable Agent grants for encrypted Agent replies. | Unwrap grants locally with Agent private keys and sign encrypted replies. | Model grant records and encrypted reply envelopes. | Grant lifecycle tests, revocation tests, key-rotation evidence, and connector docs. |

## Must not claim

Do not claim any of these unless the implementation publishes evidence:

- "Fully AgentLink compatible"
- "AgentLink v1.0 compatible"
- "AgentLink E2EE compatible"
- "Works with all AgentLink Agents"
- "Official AgentLink Cloud connector"
- "Production OpenClaw connector"

The public repository may include a local-only OpenClaw-style mock connector, but production connectors must follow `docs/connector-boundary.md` and must not expose production tokens, private endpoints, database credentials, or commercial connector internals.

## Evidence Checklist

Minimum evidence by claim:

| Claim | Required evidence |
|---|---|
| Level 0 | Schema or fixture tests for actor and message envelopes. |
| Level 1 | Examples that preserve `sender_mode` and `on_behalf_of`. |
| Level 2 | History, receipt, realtime or polling, token-scope, and participant visibility tests or limitations. |
| Level 3 | Signature, timestamp, nonce, replay, and audit metadata tests or security notes. |
| Level 4 | Ciphertext envelope validation and plaintext fallback policy. |
| Level 5 | Agent grant creation, expiry, revocation, signature, and key-rotation evidence. |

## Relationship To Other Docs

- `docs/compatibility-checklist.md` defines each level.
- `docs/developer-quickstart.md` explains the 3/5/10 minute path for developers.
- `docs/connector-boundary.md` defines what can be public in connector examples.
- `docs/security-key-system-v0.3.md` defines the security and Agent grant model.
