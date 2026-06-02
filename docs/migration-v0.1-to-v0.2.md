# Migrating From AgentLink Protocol v0.1 To v0.2

v0.2 keeps the human-owned agent principle from v0.1, but introduces a unified actor model and a fuller message envelope.

## Summary

```text
v0.1: User / Agent / Device fields are separate.
v0.2: User / Agent / App / Device are represented as actors.

v0.1: Message payload describes send requests.
v0.2: Message envelope describes sent, stored, delivered, and realtime messages.

v0.1: Security is mostly token and permission guidance.
v0.2: Security adds scoped actor tokens, signature fields, timestamps, nonces, and replay-protection guidance.
```

## Field Mapping

| v0.1 field | v0.2 field | Notes |
|---|---|---|
| `sender_user_id` | `from.actor_id` where `from.actor_type = "user"` | For manual human messages |
| `sender_agent_id` | `from.actor_id` where `from.actor_type = "agent"` | For agent messages |
| `sender_mode` | `sender_mode` | Preserved |
| `conversation_id` | `conversation_id` | Preserved |
| `content` | `content` | Preserved |
| `requires_human_approval` | `policy.approval` | Use `required`, `granted`, `denied`, or `not_required` |
| `requires_human_reply` | `policy.requires_human_reply` | Preserved |
| `sensitive` | `policy.sensitive` | Preserved |
| `request_id` | `audit.request_id` | For message/event correlation |

## Human Message

v0.1:

```json
{
  "conversation_id": "conv_01J0LUNCH0000000000000001",
  "sender_mode": "human_sent",
  "content": {
    "type": "text",
    "text": "Want to have lunch together?"
  }
}
```

v0.2:

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

## Agent Message

v0.1 used `sender_agent_id` or `/agent/messages/send` to indicate agent behavior.

v0.2 requires `from` and `on_behalf_of`:

```json
{
  "protocol": "agentlink.message.v0.2",
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
  }
}
```

## Route Compatibility

Existing v0.1 routes can remain:

```text
POST /v1/messages/send
POST /v1/agent/messages/send
```

Servers should internally normalize both routes into the v0.2 message envelope.

Future servers may add:

```text
POST /v1/messages
```

This future route should accept an actor-aware payload and use token scope to verify which actor is allowed to send.

## Realtime Event Migration

v0.1:

```json
{
  "event": "message.new",
  "data": {
    "sender_user_id": "usr_01J0ALICE0000000000000001",
    "sender_agent_id": null,
    "sender_mode": "human_sent"
  }
}
```

v0.2:

```json
{
  "event": "message.new",
  "data": {
    "message": {
      "from": {
        "actor_type": "user",
        "actor_id": "usr_01J0ALICE0000000000000001"
      },
      "sender_mode": "human_sent"
    }
  }
}
```

## Compatibility Rule

During migration, an implementation may expose v0.1 route names and v0.2 envelopes at the same time.

The required behavior is:

```text
Old route names are allowed.
Old sender identity fields may appear in legacy responses.
New stored/delivered/realtime messages should include actor-aware v0.2 fields.
Clients must not lose sender_mode visibility.
```

