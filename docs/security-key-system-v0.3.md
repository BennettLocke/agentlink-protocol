# AgentLink Security And Key System v0.3 Draft

Status: Draft  
Date: 2026-06-16  
Scope: protocol guidance for secure messaging, local encrypted cache, device keys, agent decryption grants, and future optional end-to-end encryption.

## 1. Summary

AgentLink should use server-side message history as the source of truth, local encrypted cache for speed and offline reading, and optional end-to-end encryption for high-privacy conversations.

This document does not invent new cryptographic algorithms. It defines how AgentLink actors, devices, agents, and services should manage keys and authorization. Implementations should use mature cryptographic primitives and audited libraries.

## 2. Security Layers

| Layer | Name | Server Can Read Message Content | Primary Purpose |
|---|---|---:|---|
| L0 | Transport only | yes | Current MVP, HTTPS/WSS, JWT, permissions |
| L1 | Server protected | yes | Encrypt data at rest or sensitive fields |
| L2 | Client encrypted cache | yes for server history, no for local cache | Fast local UX and offline reading |
| L3 | Optional E2EE | no by default | High-privacy conversations |

AgentLink compatibility should clearly declare which layers are implemented.

## 3. Recommended Primitives

| Use | Recommendation |
|---|---|
| Transport | HTTPS / WSS / TLS 1.3 where available |
| Password hashing | Argon2id or bcrypt with a strong cost factor |
| Content encryption | AES-256-GCM or ChaCha20-Poly1305 |
| Key exchange | X25519 |
| Signatures | Ed25519 |
| Key derivation | HKDF-SHA-256 |
| Digest | SHA-256 |

Implementations must not claim AgentLink security compatibility if they use custom low-level cryptography for message secrecy or signatures.

## 4. Device Keys

Each device should have a device key record.

```json
{
  "device_id": "dev_01J0DESKTOP000000000001",
  "owner_user_id": "usr_01J0ALICE0000000000001",
  "signing_public_key": "base64url_ed25519_public_key",
  "exchange_public_key": "base64url_x25519_public_key",
  "status": "active",
  "created_at": "2026-06-16T10:00:00+08:00"
}
```

Private keys should stay in device-local secure storage:

- Windows: DPAPI or platform secure storage.
- macOS/iOS: Keychain.
- Android: Keystore.
- Browser: WebCrypto non-extractable keys where practical.

## 5. Conversation Key Versions

Encrypted conversations should use versioned content keys.

```json
{
  "conversation_id": "conv_01J0LUNCH0000000000000001",
  "key_id": "ck_01J0LUNCHKEY000000000001",
  "key_version": 3,
  "suite": "agentlink.e2ee.v1",
  "created_by": {
    "actor_type": "device",
    "actor_id": "dev_01J0DESKTOP000000000001"
  },
  "created_at": "2026-06-16T10:00:00+08:00"
}
```

When a participant device or agent grant is revoked, implementations should rotate the conversation key for new messages.

## 6. Wrapped Keys

The server may store encrypted copies of a conversation key for authorized devices and agents.

```json
{
  "conversation_id": "conv_01J0LUNCH0000000000000001",
  "key_id": "ck_01J0LUNCHKEY000000000001",
  "recipient": {
    "actor_type": "device",
    "actor_id": "dev_01J0PHONE0000000000001",
    "owner_user_id": "usr_01J0ALICE0000000000001"
  },
  "wrapping_alg": "x25519-hkdf-sha256-aes-256-gcm",
  "wrapped_key": "base64url_wrapped_key",
  "created_at": "2026-06-16T10:00:00+08:00"
}
```

The server should not store the plaintext conversation content key for E2EE conversations.

## 7. Agent Crypto Keys

Agents should have their own public crypto identity before they can receive encrypted conversation access.

```json
{
  "agent_crypto_key_id": "agkey_01J0OPENCLAW0000000001",
  "agent_id": "agt_01J0HOME0000000000000001",
  "owner_user_id": "usr_01J0ALICE0000000000001",
  "key_label": "OpenClaw Home",
  "signing_public_key": "base64url_raw_32_byte_ed25519_public_key",
  "exchange_public_key": "base64url_raw_32_byte_x25519_public_key",
  "status": "active",
  "created_at": "2026-06-16T10:00:00+08:00"
}
```

Rules:

- Agent private keys must stay inside the Agent node, connector, or local secure storage.
- The server stores only public keys and key status metadata.
- Owners may discover active public keys for their own Agents before creating a wrapped key grant.
- Agents may register and read their own public keys with an Agent token.
- Public keys should use raw 32-byte base64url encoding for compatibility with device keys and key wrapping.
- Revoked Agent keys must not receive new wrapped conversation keys.

## 8. Agent Decryption Grants

Agents must not silently receive message decryption capability.

An agent can decrypt encrypted conversation content only when the owner grants scoped access.

```json
{
  "grant_id": "akg_01J0AGENTGRANT0000000001",
  "agent_id": "agt_01J0HOME0000000000000001",
  "owner_user_id": "usr_01J0ALICE0000000000001",
  "conversation_id": "conv_01J0LUNCH0000000000000001",
  "scope": ["read_recent", "draft_reply"],
  "wrapped_key": "base64url_wrapped_conversation_key_for_agent",
  "expires_at": "2026-06-23T10:00:00+08:00",
  "created_at": "2026-06-16T10:00:00+08:00"
}
```

Rules:

- Grants must be scoped.
- Grants should expire.
- Grants must be revocable.
- Grant creation, use, and revocation must be auditable.
- Agent connectors unwrap grants locally with their X25519 private key; the server should not decrypt grants for the Agent.
- After revocation, new messages should use a rotated conversation key.
- A grant revocation response should include enough metadata for the owner client to rotate, including `conversation_id`, revoked `key_id`, revoked `key_version`, and `rotation_required`.

Recommended owner-client flow:

1. Discover the Agent's active public crypto key with `GET /v1/crypto/agents/:agentId/keys`.
2. Reuse or prepare the local conversation content key for the target conversation.
3. Wrap that conversation key for the Agent's X25519 `exchange_public_key`.
4. Bind the wrapped-key AAD to `recipient_agent_id`, not to a device id.
5. Create `POST /v1/crypto/agent-key-grants` with `agent_id`, `conversation_id`, `scope`, `key_id`, `key_version`, `wrapping_alg`, `wrapped_key`, and `expires_at`.
6. Send ciphertext messages only after the Agent grant exists, so the Agent connector can fetch, unwrap, and decrypt under the user's explicit authorization.

Recommended revocation flow:

1. Owner client calls `DELETE /v1/crypto/agent-key-grants/:grantId`.
2. Server marks the grant revoked, audits the action, and returns `rotation_required: true`.
3. Owner client prepares a new conversation content key with a higher `key_version` and wraps it only for currently authorized devices and agents.
4. Future ciphertext messages use the rotated key; old messages may remain decryptable by parties that previously held the old key.

## 9. Ciphertext Content

Encrypted message content should use `content.type = "ciphertext"`.

```json
{
  "type": "ciphertext",
  "suite": "agentlink.e2ee.v1",
  "alg": "aes-256-gcm",
  "key_id": "ck_01J0LUNCHKEY000000000001",
  "key_version": 3,
  "nonce": "base64url_nonce",
  "ciphertext": "base64url_ciphertext",
  "tag": "base64url_auth_tag",
  "aad": {
    "protocol": "agentlink.message.v1",
    "conversation_id": "conv_01J0LUNCH0000000000000001",
    "sender_actor_id": "usr_01J0ALICE0000000000001",
    "created_at": "2026-06-16T10:00:00+08:00"
  }
}
```

Servers should validate the ciphertext envelope shape even when they cannot decrypt it.

Servers should also record message security context metadata for ciphertext messages, including `content_protection`, `suite`, `key_id`, `key_version`, and `nonce`. This lets implementations audit which key version protected a message without reading plaintext.
When a human device signs an encrypted message, the security metadata should also include `signer_device_key_id`, `signature_alg`, `signature`, and `timestamp`.

AEAD additional authenticated data must be serialized canonically before encryption and decryption. Implementations must not rely on object insertion order from ordinary JSON serialization for AES-GCM AAD, because storage layers and JSON parsers may reorder keys. A compatible implementation should define a stable canonical JSON form for AAD and use it consistently across clients and connectors.

When an agent signs an encrypted reply, the security metadata should include `signer_agent_crypto_key_id`, `signature_alg`, `timestamp`, `nonce`, and `signature`. The signature payload should bind at least `reply_to_message_id`, `client_msg_id`, `conversation_id`, `sender_actor_type = agent`, `sender_actor_id`, `sender_mode = agent_sent`, `content`, and the unsigned security metadata. Servers should verify the signature against an active `agent_crypto_keys.signing_public_key` owned by the same Agent owner. Servers should also require an active, unexpired, non-revoked `agent_key_grant` for the same `agent_id`, `owner_user_id`, `conversation_id`, `key_id`, and `key_version` before storing an Agent ciphertext reply.

When an Agent connector replies to a ciphertext message after unwrapping an authorized `agent_key_grant`, the reply should be encrypted with the same granted conversation `key_id/key_version` unless the owner client has already rotated the conversation key. The reply signature `security.nonce` should bind to the ciphertext `content.nonce`.

## 10. Baseline Crypto APIs

Early implementations may expose these routes before full end-to-end encryption is complete:

```text
POST /v1/crypto/device-keys
GET  /v1/crypto/device-keys
POST /v1/crypto/device-keys/:deviceKeyId/revoke

POST /v1/crypto/conversations/:conversationId/key-versions
GET  /v1/crypto/conversations/:conversationId/keys
GET  /v1/crypto/conversations/:conversationId/device-keys
POST /v1/crypto/conversations/:conversationId/key-versions/:keyId/recipients

POST /v1/agent/crypto/keys
GET  /v1/agent/crypto/keys
GET  /v1/crypto/agents/:agentId/keys

POST   /v1/crypto/agent-key-grants
GET    /v1/crypto/agent-key-grants
DELETE /v1/crypto/agent-key-grants/:grantId
GET    /v1/agent/crypto/key-grants?conversation_id=...&scope=...
```

These routes store public keys, key versions, wrapped keys, recipient backfills, Agent public crypto keys, and scoped grants. They must not store device private keys, Agent private keys, or plaintext conversation content keys for E2EE conversations. Recipient backfill lets a device that already holds a local conversation content key wrap that key for newly discovered participant devices without rotating the whole conversation key version. The agent-token key-grant read route must return only active, unexpired grants for the authenticated agent, optionally filtered by conversation and scope, and should write an audit record.

## 11. Signing And Replay Protection

Important agent, device, app, and cross-server messages should include:

```text
timestamp
nonce
signer_device_key_id
key_id
signature_alg
signature
```

Servers should reject:

- Missing signatures when policy requires signatures.
- Expired timestamps.
- Reused nonces for the same actor and key.
- Signature payloads that do not cover sender, target, content, policy, timestamp, and nonce.

For ciphertext messages, `(actor_type, actor_id, key_id, nonce)` should be unique for the replay window. A duplicate nonce should fail before the duplicate message is stored.
For signed human ciphertext messages, the server should fetch the active device signing public key and verify the Ed25519 signature before storing the message.

## 12. Local Encrypted Cache

Clients may cache conversations and messages locally, but local caches should be encrypted with device-local keys.

User-facing controls should include:

- Clear local cache.
- Clear this device on logout.
- Limit cache by days or message count.

Local encrypted cache is not the same as end-to-end encryption. Implementations should document that distinction.

## 13. Compatibility Checklist

An implementation can claim support for this draft only if it documents:

1. Which security layers it supports.
2. How device public keys are registered and revoked.
3. How local private keys are stored.
4. Whether servers can read message content.
5. How conversation keys are generated, wrapped, and rotated.
6. How Agent public crypto keys are registered, discovered, and revoked.
7. How agent decryption grants are created, scoped, audited, and revoked.
8. How ciphertext content is validated and relayed.
9. How signatures, timestamps, and nonces are verified where required.
