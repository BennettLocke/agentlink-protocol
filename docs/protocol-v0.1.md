# AgentLink Protocol v0.1 Draft

## 1. Goal

AgentLink Protocol defines a practical communication layer for people and their personal AI agents.

It is not a task-dispatch protocol. Its first use case is human communication:

```text
User A asks their agent to message User B.
User B's client or agent receives the message.
User B is notified and can reply directly or through their own agent.
```

## 2. Core Model

### User

A real person. Users own contacts, conversations, permissions, and agent authorization.

### Agent

An AI system authorized by a user. An agent can read, draft, notify, or send only within its owner's permissions.

### Device

A logged-in client such as a mobile app, web app, desktop app, or local agent runtime.

### Contact

A relationship between two users. Agents do not own contacts independently.

### Conversation

A message thread. v0.1 supports direct conversations only.

### Message

A message sent by a human, an authorized agent, or the system.

## 3. Sender Modes

Every message must preserve its source:

```text
human_sent       The user manually sent the message.
agent_drafted    The agent drafted it and the user approved it.
agent_sent       The agent sent it automatically under authorization.
system_sent      The platform generated the message.
```

Clients must not display `agent_sent` as if it were a manual human message.

## 4. Default Agent Permissions

Recommended defaults:

```json
{
  "can_read_messages": true,
  "can_draft_reply": true,
  "can_send_after_approval": true,
  "can_auto_send": false,
  "can_notify_owner": true
}
```

Sensitive actions should require human approval even when an agent has broad permissions.

Sensitive examples:

```text
money
legal commitment
relationship conflict
privacy disclosure
medical or safety advice
external account changes
```

## 5. Transport

v0.1 uses:

```text
HTTP JSON      account, contacts, history, approvals, sync
WebSocket      realtime message delivery and presence-like events
```

Server relay is required in v0.1:

```text
Client / Agent -> AgentLink-compatible Server -> Target Client / Agent
```

Federation, P2P, and full end-to-end encryption are future extensions.

## 6. Response Envelope

Success:

```json
{
  "ok": true,
  "data": {},
  "request_id": "req_01HX7A9Z8YH5"
}
```

Failure:

```json
{
  "ok": false,
  "error": {
    "code": "permission_denied",
    "message": "Agent is not allowed to send messages automatically.",
    "details": {}
  },
  "request_id": "req_01HX7AA1E4KM"
}
```

## 7. Core HTTP Routes

All routes are versioned under `/v1`.

```text
POST /v1/auth/register
POST /v1/auth/login
GET  /v1/users/me
POST /v1/devices/register
POST /v1/agents/register
PATCH /v1/agents/{agent_id}/permissions
POST /v1/contacts/requests
POST /v1/contacts/requests/{request_id}/accept
GET  /v1/contacts
POST /v1/conversations/direct
POST /v1/messages/send
POST /v1/agent/messages/send
POST /v1/messages/{message_id}/ack
GET  /v1/conversations/{conversation_id}/messages
GET  /v1/sync
POST /v1/approvals/{approval_id}/approve
```

## 8. Message Send Request

Human message:

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

Agent message:

```json
{
  "client_msg_id": "client_01HX7A9T90P2B3FE",
  "conversation_id": "conv_01HX7A9T90P2B3FD",
  "sender_mode": "agent_sent",
  "content": {
    "type": "text",
    "text": "My user asked me to check whether you are free for lunch."
  },
  "policy": {
    "requires_human_approval": false,
    "sensitive": false
  }
}
```

If approval is required, the server returns `approval_required` with an approval id.

## 9. Realtime Events

Recommended event names:

```text
message.new
message.receipt
approval.created
approval.resolved
sync.cursor
permission.updated
```

## 10. Compatibility Statement

An implementation is AgentLink v0.1 compatible if it:

```text
1. Keeps users as relationship owners.
2. Does not allow standalone agent-owned contacts.
3. Preserves sender_mode on every message.
4. Enforces agent permissions before sending.
5. Supports approval_required for sensitive or unauthorized agent actions.
6. Provides a way to sync missed messages after reconnect.
```

