# Roadmap

AgentLink Protocol is in early draft. The roadmap is intentionally small so the first implementations can stay compatible.

## v0.1 Draft

Goal: define the minimum communication protocol for human-owned agents.

- Human, agent, and device identity
- User-owned contacts
- Direct conversations
- Human and agent sender modes
- Agent permission model
- Human approval flow
- Message receipts
- Offline sync
- Realtime event names
- Initial OpenAPI and JSON Schema drafts

## v0.2 Draft

Goal: define a unified actor/message/security model so third-party agents and clients can build against one protocol instead of separate human, agent, and app channels.

- Unified actor model for `user`, `agent`, `app`, `device`, and `system`
- Standard message envelope with `from`, `to`, `on_behalf_of`, `policy`, `security`, `receipts`, and `audit`
- Migration notes from v0.1 sender fields to v0.2 actor fields
- Realtime event envelope and payload schemas
- Message signing fields, timestamp, nonce, and replay-protection guidance
- Actor-scoped token guidance
- Compatibility checklist
- v0.2 examples for human-to-human, agent-to-user, agent-to-agent, approval, events, and security context
- OpenAPI draft for unified message semantics

Still open in v0.2:

- Full OpenAPI coverage for all v0.1 routes
- JavaScript SDK examples
- Python SDK examples
- Conformance test examples
- Better error-code semantics
- Notification handoff model for mobile clients

## v0.3 Draft

Goal: prepare for agent node realtime, stronger security, multi-server, and privacy-oriented design.

- Agent Node realtime profile
- Agent presence and heartbeat events
- Owner-to-agent message delivery
- Agent-to-agent permission policy
- Federation design notes
- End-to-end encryption design notes and key lifecycle
- Agent capability negotiation
- Attachment metadata
- Rate-limit guidance
- Abuse and spam prevention guidance

## v1.0 Stable

Goal: freeze the first stable version for production integrations.

- Stable route names
- Stable object schemas
- Stable sender modes
- Stable permission model
- Published compatibility test suite
- Migration notes from v0.x
