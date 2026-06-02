# AgentLink Protocol

AgentLink Protocol is a draft communication protocol for human-owned AI agents.

The core idea is simple:

```text
Humans own relationships.
Agents act only on behalf of humans.
Every message keeps its source visible.
Servers relay messages reliably before federation or P2P is introduced.
```

## Status

- Version: `v0.1`
- State: Draft
- Date: 2026-06-02
- Intended use: AgentLink server MVP, mobile app MVP, and early agent integrations

This repository describes the protocol. It does not publish the official AgentLink server, mobile app, production database, or commercial operation system.

## What This Protocol Covers

- User, device, and agent identity
- Contact requests between real users
- Direct conversations
- Human-sent and agent-sent messages
- Human approval for sensitive agent actions
- Message receipts
- Offline sync
- Realtime delivery events

## What v0.1 Does Not Cover

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
docs/protocol-v0.1.md             Protocol draft
docs/realtime-events.md           Realtime event examples
docs/initial-issues.md            Suggested first public issues
openapi/agentlink-v0.1.yaml       HTTP API draft
schemas/message.schema.json       Message schema draft
examples/                         Example payloads
CHANGELOG.md                      Version history
CONTRIBUTING.md                   Contribution guide
ROADMAP.md                        Protocol roadmap
SECURITY.md                       Security policy
LICENSE                           Apache-2.0 license
```

## Design Principles

1. Human-centered identity: an agent cannot own social relationships independently.
2. Visible source: clients must preserve whether a message was sent by a human, drafted by an agent, or sent automatically by an agent.
3. Conservative permissions: agents can draft by default, but automatic sending should be explicitly granted.
4. Server relay first: v0.1 optimizes for reliability, moderation, auditability, and mobile delivery.
5. Open protocol, private product: this protocol can be public while the official AgentLink service remains a commercial product.

## Minimal Message Example

```json
{
  "client_msg_id": "client_01HX7A9T90P2B3FD",
  "conversation_id": "conv_01HX7A9T90P2B3FD",
  "sender_mode": "human_sent",
  "content": {
    "type": "text",
    "text": "Want to have lunch together?"
  }
}
```

## Compatibility

A service should not claim AgentLink compatibility unless it:

- Uses the standard response envelope.
- Preserves message source metadata.
- Enforces user-owned contact relationships.
- Requires user authorization for agent actions.
- Supports offline sync or clearly declares sync limitations.

## Commercial Boundary

AgentLink Protocol is the shared language.

AgentLink Cloud, AgentLink App, official hosted identity, notifications, user relationship network, and personal agent product experience can remain privately operated by the AgentLink team.

## License

This repository is released under the Apache License 2.0.

The license is intended to allow independent implementations, SDKs, examples, and commercial integrations while keeping the official AgentLink product and hosted service separate.
