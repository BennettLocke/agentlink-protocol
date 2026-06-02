# Realtime Events

AgentLink v0.1 uses realtime events for message delivery and state updates.

The concrete transport can be WebSocket or Socket.IO. Implementations should keep payloads JSON-compatible and preserve the standard response and identity model.

## Event Names

```text
message.new
message.receipt
approval.created
approval.resolved
sync.cursor
permission.updated
```

## message.new

Sent when a participant receives a new message.

```json
{
  "event": "message.new",
  "event_id": "evt_01HX7B1G7M3Z9K",
  "created_at": "2026-06-02T12:00:00+08:00",
  "data": {
    "message_id": "msg_01HX7A9T90P2B3FD",
    "conversation_id": "conv_01HX7A9T90P2B3FD",
    "sender_user_id": "usr_01HX7A9K2M8RZP9T",
    "sender_agent_id": null,
    "sender_mode": "human_sent",
    "content": {
      "type": "text",
      "text": "Want to have lunch together?"
    }
  }
}
```

## message.receipt

Sent when a message is delivered or read.

```json
{
  "event": "message.receipt",
  "event_id": "evt_01HX7B1G7M3Z9L",
  "created_at": "2026-06-02T12:00:10+08:00",
  "data": {
    "message_id": "msg_01HX7A9T90P2B3FD",
    "conversation_id": "conv_01HX7A9T90P2B3FD",
    "user_id": "usr_01HX7A9K2M8RZP9T",
    "type": "read"
  }
}
```

## approval.created

Sent when an agent action requires human approval.

```json
{
  "event": "approval.created",
  "event_id": "evt_01HX7B1G7M3Z9M",
  "created_at": "2026-06-02T12:00:20+08:00",
  "data": {
    "approval_id": "apr_01HX7AA1E4KM",
    "agent_id": "agt_01HX7A9N3W41M7KQ",
    "action_type": "message.send",
    "reason": "sensitive_content"
  }
}
```

## sync.cursor

Sent when a client should advance or refresh its sync cursor.

```json
{
  "event": "sync.cursor",
  "event_id": "evt_01HX7B1G7M3Z9N",
  "created_at": "2026-06-02T12:00:30+08:00",
  "data": {
    "cursor": "2026-06-02T12:00:30.000Z|msg_01HX7A9T90P2B3FD"
  }
}
```

## v0.2 Event Envelope

AgentLink v0.2 keeps the same delivery idea but standardizes event shape:

```json
{
  "event": "message.new",
  "event_id": "evt_01J0MESSAGEEVENT0000000001",
  "created_at": "2026-06-02T12:00:00+08:00",
  "data": {}
}
```

Recommended v0.2 event names:

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

## v0.2 message.new

Sent when an actor receives a new visible message.

```json
{
  "event": "message.new",
  "event_id": "evt_01J0MESSAGEEVENT0000000001",
  "created_at": "2026-06-02T12:00:00+08:00",
  "data": {
    "message": {
      "protocol": "agentlink.message.v0.2",
      "message_id": "msg_01J0LUNCH0000000000000001",
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
      },
      "created_at": "2026-06-02T12:00:00+08:00"
    }
  }
}
```

## v0.2 receipt.updated

```json
{
  "event": "receipt.updated",
  "event_id": "evt_01J0RECEIPT00000000000001",
  "created_at": "2026-06-02T12:02:00+08:00",
  "data": {
    "receipt": {
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
  }
}
```

## v0.2 approval.requested

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

## Authorization Rule

Realtime events must be filtered by the receiving actor.

A server must not broadcast messages, approvals, receipts, or presence details to actors outside the conversation, ownership, or visibility policy.
