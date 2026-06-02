# AgentLink Protocol v0.2 Draft

## 1. Goal

AgentLink Protocol v0.2 defines a unified communication protocol for humans, agents, apps, and devices.

The protocol is not a task-dispatch protocol. It is a communication protocol where humans remain the relationship owners and agents act only through explicit authorization.

v0.2 expands v0.1 from:

```text
User / Agent / Device + sender_mode
```

to:

```text
One message protocol
Multiple actor types
Explicit authorization context
Standard message envelope
Security fields for signing and replay protection
```

## 2. Non-Goals

v0.2 does not define:

- Group chat production behavior
- Social feeds
- Voice or video calls
- Payments
- Federation
- P2P delivery
- A plugin marketplace
- A full end-to-end encryption product
- Agent reasoning, memory, planning, or model behavior

The protocol reserves fields for future privacy and federation work, but v0.2 remains server-relayed.

## 3. Core Principles

### 3.1 One Protocol, Multiple Actor Types

AgentLink should not use separate protocols for human-to-human, human-to-agent, and agent-to-agent communication.

Every participant is represented as an actor:

```text
user      A real human account.
agent     A user-owned or authorized agent node.
app       A future external app or service endpoint.
device    A phone, web client, desktop app, local runtime, or home server.
system    A platform actor used for service messages.
```

The same conversation, message, receipt, approval, and event model supports:

```text
user -> user
user -> agent
agent -> user
agent -> agent
app -> user
app -> agent
system -> user/agent/device
```

### 3.2 Humans Own Relationships

Agents do not independently own social relationships.

An agent may send, receive, read, draft, or notify only through a permission granted by its owner or by an explicit conversation policy.

### 3.3 Message Source Must Stay Visible

Clients must preserve the source of every message.

```text
human_sent       The human sent the message manually.
agent_drafted    The agent drafted it and the human approved it.
agent_sent       The agent sent it automatically under authorization.
app_sent         An external app sent it under authorization.
system_sent      The platform generated it.
```

An implementation must not display `agent_sent` as a manual human message.

### 3.4 Server Relay First

v0.2 uses server-mediated delivery.

```text
Client / Agent / App
-> AgentLink-compatible server
-> Target client / agent / app
```

The server is responsible for identity, permission checks, conversation membership, offline storage, realtime delivery, sync, audit, abuse control, and mobile notification handoff.

## 4. Actor Model

An actor identifies who is participating in a protocol action.

```json
{
  "actor_type": "agent",
  "actor_id": "agt_01J0AGENT00000000000000001",
  "owner_user_id": "usr_01J0ALICE0000000000000001",
  "display_name": "Alice Home Agent",
  "capabilities": ["message.receive", "message.send", "approval.request"],
  "status": "active"
}
```

Field rules:

| Field | Required | Notes |
|---|---:|---|
| `actor_type` | yes | `user`, `agent`, `app`, `device`, or `system` |
| `actor_id` | yes | Stable actor id with a type prefix |
| `owner_user_id` | conditional | Required for `agent` and `device`, optional for `app`, absent for `system` |
| `display_name` | no | Human-readable label |
| `capabilities` | no | Declared supported protocol capabilities |
| `status` | no | `active`, `disabled`, `revoked`, or `deleted` |

Recommended id prefixes:

```text
usr_   user
agt_   agent
app_   app
dev_   device
sys_   system
conv_  conversation
msg_   message
evt_   event
apr_   approval
rcp_   receipt
```

## 5. Conversation Model

A conversation is a message thread with a set of participants and a policy.

v0.2 implementations should support direct conversations and may reserve future group semantics.

```json
{
  "conversation_id": "conv_01J0LUNCH0000000000000001",
  "conversation_type": "direct",
  "participants": [
    {
      "actor_type": "user",
      "actor_id": "usr_01J0ALICE0000000000000001"
    },
    {
      "actor_type": "user",
      "actor_id": "usr_01J0BOB000000000000000001"
    }
  ],
  "policy": {
    "visibility": "participants",
    "agent_participation": "owner_approved",
    "approval_required": false
  },
  "created_at": "2026-06-02T12:00:00+08:00"
}
```

Conversation policy controls whether an agent or app may participate, whether the owner must approve messages, and which actors can read history.

## 6. Message Envelope

Every delivered message uses the same envelope.

```json
{
  "protocol": "agentlink.message.v0.2",
  "message_id": "msg_01J0LUNCH0000000000000001",
  "conversation_id": "conv_01J0LUNCH0000000000000001",
  "from": {
    "actor_type": "agent",
    "actor_id": "agt_01J0ALICE0000000000000001",
    "owner_user_id": "usr_01J0ALICE0000000000000001"
  },
  "on_behalf_of": {
    "actor_type": "user",
    "actor_id": "usr_01J0ALICE0000000000000001"
  },
  "to": [
    {
      "actor_type": "user",
      "actor_id": "usr_01J0BOB000000000000000001"
    }
  ],
  "sender_mode": "agent_sent",
  "content": {
    "type": "text",
    "text": "Alice asked me to check whether you are free for lunch."
  },
  "policy": {
    "approval": "granted",
    "sensitive": false,
    "requires_human_reply": true
  },
  "security": {
    "transport": "tls",
    "signed": true,
    "signature_alg": "ed25519",
    "key_id": "key_01J0ALICEAGENT0000000001",
    "timestamp": "2026-06-02T12:00:00+08:00",
    "nonce": "n_01J0LUNCH0000000000000001",
    "signature": "base64url_signature"
  },
  "receipts": [],
  "audit": {
    "request_id": "req_01J0LUNCH0000000000000001",
    "trace_id": "trc_01J0LUNCH0000000000000001"
  },
  "created_at": "2026-06-02T12:00:00+08:00"
}
```

Field rules:

| Field | Required | Notes |
|---|---:|---|
| `protocol` | yes | `agentlink.message.v0.2` |
| `message_id` | yes for stored/delivered messages | Assigned by server |
| `client_msg_id` | recommended for send requests | Used for idempotency |
| `conversation_id` | yes | Existing conversation id |
| `from` | yes | Actor that created or submitted the message |
| `on_behalf_of` | conditional | Required when an agent, app, or device represents a user |
| `to` | yes | One or more target actors |
| `sender_mode` | yes | Source visibility marker |
| `content` | yes | Message content object |
| `policy` | recommended | Approval and sensitivity metadata |
| `security` | recommended in v0.2 | Signing and replay-protection metadata |
| `receipts` | optional | Delivery/read/failure states |
| `audit` | recommended | Request and trace correlation |

## 7. Content Types

v0.2 requires support for text content.

```json
{
  "type": "text",
  "text": "Want to have lunch together?"
}
```

Future content types may include attachment metadata, action proposals, location shares, or structured external-app events. Implementations should reject unknown content types unless they explicitly support pass-through behavior.

## 8. Permissions

Agent permissions should be explicit and scoped.

Recommended permissions:

```json
{
  "can_read_messages": true,
  "can_draft_reply": true,
  "can_send_after_approval": true,
  "can_auto_send": false,
  "can_notify_owner": true,
  "can_contact_other_agents": false,
  "can_receive_agent_messages": true
}
```

Default policy should be conservative:

- Agents can draft by default.
- Agents should not auto-send by default.
- Sensitive messages require approval even when auto-send is enabled.
- Users can revoke agent permissions at any time.
- Permission checks must happen server-side before delivery.

## 9. Approval Model

Approval is required when a message or action exceeds current authorization.

Approval states:

```text
pending
approved
rejected
expired
cancelled
```

Approval event example:

```json
{
  "event": "approval.requested",
  "event_id": "evt_01J0APPROVAL00000000000001",
  "created_at": "2026-06-02T12:00:01+08:00",
  "data": {
    "approval_id": "apr_01J0APPROVAL00000000000001",
    "action": "message.send",
    "requested_by": {
      "actor_type": "agent",
      "actor_id": "agt_01J0ALICE0000000000000001"
    },
    "owner": {
      "actor_type": "user",
      "actor_id": "usr_01J0ALICE0000000000000001"
    },
    "reason": "sensitive_content",
    "status": "pending"
  }
}
```

## 10. Receipts

Receipts communicate message state from a visible actor.

Receipt types:

```text
sent
delivered
read
failed
revoked
```

Example:

```json
{
  "receipt_id": "rcp_01J0READ000000000000000001",
  "message_id": "msg_01J0LUNCH0000000000000001",
  "conversation_id": "conv_01J0LUNCH0000000000000001",
  "actor": {
    "actor_type": "user",
    "actor_id": "usr_01J0BOB000000000000000001"
  },
  "type": "read",
  "created_at": "2026-06-02T12:02:00+08:00"
}
```

## 11. Realtime Events

Recommended v0.2 events:

```text
message.new
receipt.updated
approval.requested
approval.resolved
presence.updated
permission.updated
sync.cursor
security.key_rotated
```

All events should use a standard event envelope:

```json
{
  "event": "message.new",
  "event_id": "evt_01J0EVENT0000000000000001",
  "created_at": "2026-06-02T12:00:00+08:00",
  "data": {}
}
```

The `data` object must be authorized for the receiving actor. A server must not broadcast conversation or approval data to actors outside the visibility policy.

## 12. Security Model

### 12.1 Transport

Production implementations must use:

```text
HTTPS for HTTP APIs
WSS for WebSocket APIs
Valid certificates
TLS 1.3 where supported
```

### 12.2 Actor Authentication

Tokens must be scoped to actor type and purpose.

Examples:

```text
user session token
agent token
device token
app integration token
```

An agent token must not be accepted as a user session token. A user token must not silently grant an agent auto-send permission.

### 12.3 Signing And Replay Protection

For important agent, app, and cross-server messages, v0.2 reserves signing fields:

```text
timestamp
nonce
key_id
signature_alg
signature
```

Servers should reject expired timestamps and reused nonces. The signature should cover the canonical message fields that affect sender, target, content, policy, and timestamp.

v0.2 recommends Ed25519 for signatures when implementations support public-key verification. Implementations should use audited libraries and should not invent cryptographic algorithms.

### 12.4 Server-Side Protection

Servers should:

- Hash passwords with a modern password hashing function.
- Keep secrets out of source control.
- Rotate tokens and keys when compromise is suspected.
- Store audit logs for sensitive agent actions.
- Encrypt sensitive fields or storage volumes when appropriate.

### 12.5 End-To-End Encryption

Full end-to-end encryption is not required for v0.2 compatibility.

The message envelope is designed to allow future ciphertext content:

```json
{
  "type": "ciphertext",
  "alg": "future-e2ee-suite",
  "ciphertext": "base64url_ciphertext"
}
```

If an agent needs to read encrypted messages, the user must explicitly authorize that agent endpoint to hold decryption capability.

## 13. HTTP Compatibility

v0.2 may keep v0.1 route names for compatibility.

Recommended compatibility mapping:

```text
POST /v1/messages/send
  human sender, user token

POST /v1/agent/messages/send
  agent sender, agent token

Future:
POST /v1/messages
  unified actor send route with actor context
```

Servers may support both the old split routes and the future unified route. When both exist, both must produce the same message envelope semantics.

## 14. v0.2 Compatibility Checklist

An implementation can claim AgentLink Protocol v0.2 compatibility if it:

1. Represents participants using actor type and actor id.
2. Preserves `sender_mode` on every message.
3. Requires `on_behalf_of` when an agent, app, or device represents a user.
4. Enforces user-owned relationship rules.
5. Enforces agent permissions before delivery.
6. Supports `approval_required` or equivalent pending approval flow.
7. Uses a standard message envelope for delivered messages.
8. Uses a standard event envelope for realtime events.
9. Provides offline sync or documents its sync limitations.
10. Uses HTTPS/WSS in production.
11. Scopes tokens by actor type.
12. Supports or explicitly documents message signing and replay-protection behavior.

