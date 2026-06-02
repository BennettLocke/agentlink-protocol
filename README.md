# AgentLink Protocol

AgentLink Protocol is a draft communication protocol for humans, agents, apps, and devices.

The core idea is simple:

```text
Humans own relationships.
Agents act only on behalf of humans.
Every message keeps its source visible.
Servers relay messages reliably before federation or P2P is introduced.
```

## Status

- Latest draft: `v0.2`
- Previous draft: `v0.1`
- State: Draft
- Date: 2026-06-02
- Intended use: AgentLink server MVP, mobile app MVP, and early agent integrations

This repository describes the protocol. It does not publish the official AgentLink server, mobile app, production database, or commercial operation system.

## What This Protocol Covers

- Unified actor identity: user, agent, app, device, and system
- Contact requests between real users
- Direct conversations
- Human-sent and agent-sent messages
- Human approval for sensitive agent actions
- Message receipts
- Offline sync
- Realtime delivery events
- Actor-scoped tokens
- Message signing fields, timestamps, nonces, and replay-protection guidance
- Future end-to-end encryption extension points

## What v0.2 Does Not Cover

- Group chat
- Social feeds
- Voice or video calls
- Payments
- Full end-to-end encryption
- Federation
- P2P direct delivery
- Third-party plugin marketplace
- Complex agent-to-agent negotiation

## Repository Structure

```text
docs/protocol-v0.2.md                 Latest protocol draft
docs/protocol-v0.1.md                 Previous protocol draft
docs/migration-v0.1-to-v0.2.md        Migration notes
docs/realtime-events.md               Realtime event examples
docs/initial-issues.md                Suggested first public issues
openapi/agentlink-v0.2.yaml           v0.2 HTTP API draft
openapi/agentlink-v0.1.yaml           v0.1 HTTP API draft
schemas/actor.schema.json             Actor schema
schemas/message-v0.2.schema.json      v0.2 message envelope schema
schemas/security-context.schema.json  Security context schema
schemas/event-v0.2.schema.json        Realtime event schema
schemas/approval.schema.json          Approval schema
schemas/message.schema.json           v0.1 message send payload schema
examples/                             Example payloads
CHANGELOG.md                          Version history
CONTRIBUTING.md                        Contribution guide
ROADMAP.md                             Protocol roadmap
SECURITY.md                            Security policy
LICENSE                                Apache-2.0 license
```

## Design Principles

1. Human-centered identity: an agent cannot own social relationships independently.
2. Visible source: clients must preserve whether a message was sent by a human, drafted by an agent, or sent automatically by an agent.
3. Conservative permissions: agents can draft by default, but automatic sending should be explicitly granted.
4. Server relay first: the early drafts optimize for reliability, moderation, auditability, and mobile delivery.
5. Open protocol, private product: this protocol can be public while the official AgentLink service remains a commercial product.
6. One protocol, multiple actors: human-human, human-agent, and agent-agent communication share the same message model.
7. Security by layers: transport encryption, actor-scoped authentication, message signing, replay protection, and future optional end-to-end encryption are separate concerns.

## Minimal v0.2 Message Example

```json
{
  "protocol": "agentlink.message.v0.2",
  "conversation_id": "conv_01J0LUNCH0000000000000001",
  "from": {
    "actor_type": "user",
    "actor_id": "usr_01J0ALICE0000000000000001"
  },
  "to": [
    {
      "actor_type": "user",
      "actor_id": "usr_01J0BOB000000000000000001"
    }
  ],
  "sender_mode": "human_sent",
  "content": {
    "type": "text",
    "text": "Want to have lunch together?"
  }
}
```

See `examples/` for human-to-human, agent-to-user, agent-to-agent, approval, realtime event, and security-context examples.

## Compatibility

A service should not claim AgentLink compatibility unless it:

- Uses the standard response envelope.
- Represents participants with actor type and actor id.
- Preserves message source metadata.
- Enforces user-owned contact relationships.
- Requires user authorization for agent actions.
- Supports offline sync or clearly declares sync limitations.
- Scopes tokens by actor type.
- Supports or documents message signing and replay-protection behavior.

v0.1 route names may remain in early implementations. v0.2 compatibility is about message semantics and actor-aware envelopes, not forcing an immediate route rename.

## Commercial Boundary

AgentLink Protocol is the shared language.

AgentLink Cloud, AgentLink App, official hosted identity, notifications, user relationship network, and personal agent product experience can remain privately operated by the AgentLink team.

## License

This repository is released under the Apache License 2.0.

The license is intended to allow independent implementations, SDKs, examples, and commercial integrations while keeping the official AgentLink product and hosted service separate.
