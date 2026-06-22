# AgentLink Compatibility Checklist

Status: Draft  
Applies to: `v0.2` message semantics and `v0.3` security/key-system guidance

This checklist defines what an implementation should support before claiming AgentLink compatibility. It is intentionally stricter than "can send a JSON payload" because AgentLink is about identity, permission, auditability, and human-owned agent communication.

## Compatibility Levels

### Level 0: Message Shape

An implementation can parse and emit AgentLink-shaped messages.

Requirements:

- Use a `protocol` version string such as `agentlink.message.v0.2` or `agentlink.message.v0.3`.
- Represent participants with actor objects that include `actor_type` and `actor_id`.
- Preserve `sender_mode` instead of collapsing all messages into plain chat text.
- Preserve `conversation_id`, `client_msg_id` or equivalent idempotency metadata, and `created_at`.
- Reject message envelopes with unknown required actor fields instead of silently guessing.

### Level 1: Human-Owned Agent Semantics

An implementation understands that agents act on behalf of humans.

Requirements:

- Agents do not own contacts independently from users.
- Agent messages include enough metadata to show whether the message was drafted, approved, or automatically sent.
- `on_behalf_of` is preserved when an agent acts for a user.
- Sensitive agent actions can require human approval.
- UIs must not present an `agent_sent` message as if the human directly typed it.

### Level 2: Relay And Sync

An implementation can operate as a reliable relay.

Requirements:

- Store and return conversation history in timestamp order with stable ids.
- Support delivery/read receipts or clearly document receipt limitations.
- Support realtime events or clearly document polling/sync limitations.
- Scope tokens by actor type: user, device, agent, app, or system.
- Prevent an agent token from being accepted as a user session token.
- Enforce participant visibility before returning history or realtime events.

### Level 3: Security Metadata

An implementation validates security fields where policy requires them.

Requirements:

- Support timestamps and nonces for signed messages.
- Define replay windows and reject reused nonces for the same actor/key.
- Support `signature_alg = ed25519` when signatures are implemented.
- Verify signatures over a canonical payload that binds sender, target, content, timestamp, and nonce.
- Store or expose audit metadata such as `request_id`, `trace_id`, or equivalent server-side audit ids.
- Document whether the server can read message plaintext.

### Level 4: Encrypted Message Envelope

An implementation supports `content.type = "ciphertext"`.

Requirements:

- Validate `suite`, `alg`, `key_id`, `key_version`, `nonce`, `ciphertext`, and `tag`.
- Reject unsupported encryption suites instead of attempting fallback decryption.
- Treat AES-GCM AAD as canonical JSON, not insertion-order-dependent JSON.
- Store ciphertext envelopes without adding a plaintext `content.text` fallback.
- Track message security context: `content_protection`, `suite`, `key_id`, `key_version`, and `nonce`.
- Enforce nonce uniqueness for `(actor_type, actor_id, key_id, nonce)` inside the replay window.

### Level 5: Agent Grant Security

An implementation supports scoped agent decryption grants.

Requirements:

- Agents register public crypto identity keys before receiving encrypted access.
- Agent private keys never go through the server.
- Owners can discover active Agent public keys before creating grants.
- Agent grants are scoped, expiring, revocable, and auditable.
- Agent connectors unwrap grants locally using their private X25519 key.
- Encrypted Agent replies are signed with `signer_agent_crypto_key_id`.
- Servers verify encrypted Agent reply signatures against active Agent public signing keys.
- Servers require an active, unexpired, non-revoked grant for the same `agent_id`, `owner_user_id`, `conversation_id`, `key_id`, and `key_version` before storing encrypted Agent replies.
- Grant revocation triggers key rotation for future messages.

## Claims

Recommended public claim language:

```text
Compatible with AgentLink Protocol v0.2 Level 2.
Implements AgentLink security/key-system v0.3 Level 4.
```

Avoid vague claims such as:

```text
Fully AgentLink compatible.
AgentLink E2EE compatible.
Industry-standard AgentLink support.
```

unless the implementation publishes exactly which levels and drafts it supports.

## Draft Validation

Before changing schemas or examples in this repository, run:

```powershell
npm test
```

This is not a full v1.0 conformance suite. It is a repository-integrity gate for the public draft: schemas must parse, local `$ref` values must resolve, and examples must continue to match the schema level they claim.

## Non-Goals

Compatibility does not require:

- Using the official AgentLink server.
- Using the official AgentLink app or desktop client.
- Implementing group chat.
- Implementing federation.
- Implementing P2P delivery.
- Implementing full end-to-end encryption for every conversation.

Compatibility does require preserving the human-owned agent model and not hiding the source of a message.
