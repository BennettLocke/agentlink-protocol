# AgentLink Developer Quickstart

This page is the fastest path for a developer to understand AgentLink and run the public examples.

AgentLink Protocol is a shared communication contract for humans, agents, apps, and devices. It is not the official AgentLink Cloud implementation, desktop app, mobile app, database schema, or private product code.

## 3 minutes: understand the model

AgentLink has four rules:

1. Humans own relationships.
2. Agents act only on behalf of humans.
3. Every message keeps its source visible.
4. Servers relay messages reliably before federation or P2P is introduced.

The most important fields are:

- `from`: the actor that produced the message.
- `to`: the recipient actors.
- `sender_mode`: whether the message was `human_sent`, `agent_drafted`, `agent_sent`, `app_sent`, or `system_sent`.
- `on_behalf_of`: the human owner when an Agent acts for a user.
- `policy`: approval, sensitivity, and visibility metadata.
- `security`: transport, signature, timestamp, nonce, and content-protection metadata.

Read next:

- `docs/protocol-v0.2.md` for the actor and message model.
- `docs/security-key-system-v0.3.md` for keys, grants, ciphertext, signatures, and replay protection.
- `docs/compatibility-checklist.md` before claiming compatibility.
- `docs/compatibility-matrix.md` to map client, server, connector, and SDK claims to evidence.
- `docs/compatibility-suite.md` to understand the automated evidence gate.
- `docs/connector-boundary.md` before publishing connector examples.

## 5 minutes: run the examples

From the repository root:

```powershell
npm test
```

This checks schemas, examples, the JavaScript SDK example, and this quickstart.

Generate a simple AgentLink message and realtime event:

```powershell
npm run example:js
```

Generate a local-only OpenClaw-style connector flow:

```powershell
npm run example:openclaw
```

Run the compatibility evidence gate:

```powershell
npm run test:compat
```

The OpenClaw example shows this shape:

```text
AgentLink user message
-> local connector task
-> mock OpenClaw response
-> AgentLink agent_sent reply
-> message.new realtime event
```

It does not use production tokens, private endpoints, database state, or real OpenClaw integration code.

## 10 minutes: choose your integration level

Use precise compatibility claims.

Good claim:

```text
Compatible with AgentLink Protocol v0.2 Level 2.
Implements AgentLink security/key-system v0.3 Level 4.
```

Avoid broad claims like:

```text
Fully AgentLink compatible.
AgentLink E2EE compatible.
Industry-standard AgentLink support.
```

Start with one of these tracks:

- Client or bot prototype: implement Level 0 and Level 1 first.
- Relay server: implement Level 2 before exposing history or realtime events.
- Security-oriented client: implement Level 3 and document whether the server can read plaintext.
- Encrypted message client: implement Level 4, including nonce uniqueness and ciphertext envelope validation.
- Agent connector with encrypted grants: implement Level 5 after Level 4 is stable.

## What belongs in this repository

This public repository should contain:

- protocol drafts,
- JSON Schemas,
- OpenAPI drafts,
- examples,
- compatibility checklists,
- small SDK examples,
- local-only mock connector examples.

This public repository should not contain:

- AgentLink Cloud source code,
- production database schema,
- private product code,
- deployment secrets,
- real customer data,
- official commercial connector internals.

AgentLink Cloud and the official AgentLink apps can remain private commercial implementations while this protocol stays public and independently implementable.

## Suggested next file

After this quickstart, read `docs/compatibility-checklist.md`, `docs/compatibility-matrix.md`, and `docs/compatibility-suite.md`, then decide which level your implementation wants to claim.

If you plan to publish connector examples, also read `docs/connector-boundary.md` before adding code.
