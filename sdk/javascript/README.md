# AgentLink JavaScript SDK Example

This is a minimal, dependency-free JavaScript example for constructing AgentLink protocol messages.

It is not the official production SDK yet. Use it as a reference for:

- building actor objects,
- creating `agentlink.message.v0.2` text message envelopes,
- preserving `on_behalf_of` when an Agent acts for a user,
- creating `message.new` realtime event payloads,
- running basic local validation before sending a payload to a server.

## Example

```js
const {
  actor,
  createTextMessage,
  createMessageNewEvent,
  validateMessageEnvelope
} = require("./agentlink");

const alice = actor("user", "usr_01J0ALICE0000000000000001", {
  display_name: "Alice"
});

const bob = actor("user", "usr_01J0BOB000000000000000001", {
  display_name: "Bob"
});

const message = createTextMessage({
  conversation_id: "conv_01J0LUNCH0000000000000001",
  from: alice,
  to: [bob],
  text: "Want to have lunch together?"
});

const errors = validateMessageEnvelope(message);
if (errors.length > 0) {
  throw new Error(errors.join("; "));
}

const event = createMessageNewEvent(message);
console.log(event);
```

## Agent Messages

Agent-sent messages must preserve the human owner:

```js
const owner = actor("user", "usr_01J0ALICE0000000000000001");
const agent = actor("agent", "agt_01J0ALICE0000000000000001", {
  owner_user_id: owner.actor_id
});

const message = createTextMessage({
  conversation_id: "conv_01J0LUNCH0000000000000001",
  from: agent,
  on_behalf_of: owner,
  to: [actor("user", "usr_01J0BOB000000000000000001")],
  sender_mode: "agent_sent",
  text: "Alice asked me to check whether you are free for lunch."
});
```

Run the SDK example tests from the repository root:

```powershell
npm run test:sdk
```

Run the complete message/event example:

```powershell
npm run example:js
```
