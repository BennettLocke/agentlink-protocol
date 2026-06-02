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

