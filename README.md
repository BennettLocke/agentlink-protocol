# AgentLink Protocol

AgentLink Protocol is an early draft communication protocol for humans, agents, apps, and devices.

The protocol is built around one product belief:

```text
Humans own relationships.
Agents act only on behalf of humans.
Every message keeps its source visible.
Servers relay messages reliably before federation or P2P is introduced.
```

## Status

| Area | Current Draft | Status |
|---|---:|---|
| Core actor and message model | `v0.2` | Draft |
| Security and key-system guidance | `v0.3` | Draft |
| Stable production standard | `v1.0` | Not released |

Date: 2026-06-20

This repository describes the public protocol. It does not publish the official AgentLink server, desktop app, mobile app, production database, hosted identity network, or commercial operating system.

## Start Here

Fast path:

1. `docs/developer-quickstart.md` - 3 minutes to understand the model, 5 minutes to run examples, 10 minutes to choose a compatibility level.
2. Run `npm test`.
3. Run `npm run example:js`.
4. Run `npm run example:openclaw`.
5. Run `npm run test:compat` when changing compatibility levels, examples, or security guidance.
6. Run `npm run pack:sdk:js` before changing JavaScript SDK package metadata.

Reading order:

1. `docs/protocol-v0.2.md` - actor model, message envelope, approvals, receipts, sync, and realtime semantics.
2. `docs/security-key-system-v0.3.md` - device keys, wrapped conversation keys, Agent crypto keys, Agent grants, ciphertext envelopes, signatures, and replay protection.
3. `docs/compatibility-checklist.md` - what an implementation must support before claiming AgentLink compatibility.
4. `docs/compatibility-matrix.md` - how client, server, connector, SDK, and hosted platform implementations should map levels to evidence.
5. `docs/compatibility-suite.md` - what the automated compatibility suite currently checks.
6. `docs/connector-boundary.md` - what public connector examples may contain, and what must stay private.
7. `examples/` - example payloads for human, Agent, approval, realtime, security context, and ciphertext messages.
8. `schemas/` - JSON Schema drafts for message envelopes, actors, events, approvals, and security contexts.
9. `sdk/javascript/` - dependency-free JavaScript SDK example for constructing and validating simple messages.
10. `openapi/` - early HTTP API drafts.

## Validate The Draft

Run the lightweight compatibility check before publishing protocol changes:

```powershell
npm test
```

The check uses only Node.js built-ins. It verifies that every JSON schema and example can be parsed, local schema references resolve, and the published examples match their intended schema level.

GitHub Actions runs the same check on every push and pull request to `main`.

To see the JavaScript SDK example generate a message and realtime event:

```powershell
npm run example:js
```

To see a local-only OpenClaw-style connector flow:

```powershell
npm run example:openclaw
```

To run the compatibility evidence gate:

```powershell
npm run test:compat
```

To verify the JavaScript SDK package shape without publishing:

```powershell
npm run pack:sdk:js
```

## What This Protocol Covers

- Unified actor identity: `user`, `agent`, `app`, `device`, and `system`.
- Direct conversations between real users.
- Human-sent, agent-drafted, agent-sent, app-sent, and system-sent messages.
- Human approval for sensitive Agent actions.
- Message receipts and offline sync semantics.
- Realtime delivery events.
- Actor-scoped token guidance.
- Message signing fields, timestamps, nonces, and replay-protection guidance.
- Security layers: transport, server-protected storage, local encrypted cache, and optional future E2EE.
- Device public keys, wrapped conversation keys, Agent public crypto keys, and scoped Agent decryption grants.
- Ciphertext content envelopes for encrypted message payloads.

## What This Protocol Does Not Cover Yet

- Group chat.
- Voice or video calls.
- Payments.
- Federation.
- P2P direct delivery.
- Third-party plugin marketplace.
- Full OpenAPI coverage for every possible implementation route.
- A stable `v1.0` compatibility suite.

The protocol includes encryption and key-management guidance, but it should not be described as a finished universal E2EE standard yet.

## Repository Structure

```text
docs/protocol-v0.2.md                   Latest core protocol draft
docs/security-key-system-v0.3.md        Security and key-system draft
docs/compatibility-checklist.md         Compatibility levels and claims
docs/compatibility-matrix.md            Compatibility tracks and evidence matrix
docs/compatibility-suite.md             Automated compatibility evidence gate
docs/developer-quickstart.md            3/5/10 minute developer entry page
docs/connector-boundary.md              Public connector example boundary
docs/protocol-v0.1.md                   Previous protocol draft
docs/migration-v0.1-to-v0.2.md          Migration notes
docs/realtime-events.md                 Realtime event examples
docs/initial-issues.md                  Suggested first public issues
openapi/agentlink-v0.2.yaml             v0.2 HTTP API draft
openapi/agentlink-v0.1.yaml             v0.1 HTTP API draft
schemas/actor.schema.json               Actor schema
schemas/message-v0.3.schema.json        v0.3 message schema with ciphertext support
schemas/message-v0.2.schema.json        v0.2 message schema
schemas/security-context.schema.json    Security context schema
schemas/event-v0.2.schema.json          Realtime event schema
schemas/approval.schema.json            Approval schema
schemas/message.schema.json             v0.1 message send payload schema
examples/encrypted-message-v0.3.json    Human ciphertext message example
examples/encrypted-agent-reply-v0.3.json Agent ciphertext reply example
examples/                               Other example payloads
sdk/javascript/                         Minimal JavaScript SDK example
scripts/validate-examples.js            Lightweight schema/example compatibility check
scripts/validate-compatibility-suite.js Level evidence compatibility gate
scripts/validate-sdk-package.js         JavaScript SDK package dry-run gate
CHANGELOG.md                            Version history
CONTRIBUTING.md                         Contribution guide
ROADMAP.md                              Protocol roadmap
SECURITY.md                             Security policy
LICENSE                                 Apache-2.0 license
```

## Compatibility

Do not claim generic "AgentLink compatible" support without naming the draft and level.

Recommended claim format:

```text
Compatible with AgentLink Protocol v0.2 Level 2.
Implements AgentLink security/key-system v0.3 Level 4.
```

See `docs/compatibility-checklist.md` for the current level definitions and `docs/compatibility-matrix.md` for implementation tracks and evidence expectations.

At minimum, an implementation should:

- Preserve actor type and actor id.
- Preserve whether a message was human-sent, agent-drafted, or agent-sent.
- Keep `on_behalf_of` metadata when an Agent acts for a user.
- Require user authorization for Agent actions.
- Scope tokens by actor type.
- Document whether the server can read message plaintext.
- Validate security fields where the implementation claims support.

## Commercial Boundary

AgentLink Protocol is the shared language.

The official AgentLink product can remain privately operated:

- AgentLink Cloud.
- AgentLink desktop and future mobile app.
- Hosted identity, notifications, and user relationship network.
- Production database and deployment system.
- Official OpenClaw and other commercial connector integrations.

This separation is intentional: the protocol can be public while the official product remains a commercial implementation.

## License

This repository is released under the Apache License 2.0.

The license is intended to allow independent implementations, SDKs, examples, and commercial integrations while keeping the official AgentLink product and hosted service separate.
