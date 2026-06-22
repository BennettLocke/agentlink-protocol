const assert = require("node:assert/strict");
const {
  actor,
  createTextMessage,
  createMessageNewEvent,
  validateMessageEnvelope
} = require("./agentlink");
const { buildDemoPayload } = require("./examples/send-message");

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

test("creates a v0.2 human text message envelope", () => {
  const alice = actor("user", "usr_01J0ALICE0000000000000001", { display_name: "Alice" });
  const bob = actor("user", "usr_01J0BOB000000000000000001", { display_name: "Bob" });

  const message = createTextMessage({
    conversation_id: "conv_01J0LUNCH0000000000000001",
    from: alice,
    to: [bob],
    text: "Want to have lunch together?",
    created_at: "2026-06-22T12:00:00+08:00"
  });

  assert.equal(message.protocol, "agentlink.message.v0.2");
  assert.equal(message.sender_mode, "human_sent");
  assert.equal(message.content.text, "Want to have lunch together?");
  assert.equal(message.security.transport, "tls");
  assert.equal(message.security.signature_alg, "none");
  assert.equal(message.policy.visibility, "participants");
  assert.deepEqual(validateMessageEnvelope(message), []);
});

test("creates an agent message only when on_behalf_of is explicit", () => {
  const alice = actor("user", "usr_01J0ALICE0000000000000001", { display_name: "Alice" });
  const agent = actor("agent", "agt_01J0ALICE0000000000000001", {
    owner_user_id: alice.actor_id,
    display_name: "Alice Agent"
  });
  const bob = actor("user", "usr_01J0BOB000000000000000001", { display_name: "Bob" });

  assert.throws(
    () =>
      createTextMessage({
        conversation_id: "conv_01J0LUNCH0000000000000001",
        from: agent,
        to: [bob],
        sender_mode: "agent_sent",
        text: "Alice asked me to check lunch."
      }),
    /on_behalf_of is required/
  );

  const message = createTextMessage({
    conversation_id: "conv_01J0LUNCH0000000000000001",
    from: agent,
    on_behalf_of: alice,
    to: [bob],
    sender_mode: "agent_sent",
    text: "Alice asked me to check lunch.",
    created_at: "2026-06-22T12:01:00+08:00"
  });

  assert.equal(message.on_behalf_of.actor_id, alice.actor_id);
  assert.equal(message.policy.approval, "required");
  assert.deepEqual(validateMessageEnvelope(message), []);
});

test("creates a message.new realtime event", () => {
  const alice = actor("user", "usr_01J0ALICE0000000000000001");
  const bob = actor("user", "usr_01J0BOB000000000000000001");
  const message = createTextMessage({
    conversation_id: "conv_01J0LUNCH0000000000000001",
    from: alice,
    to: [bob],
    text: "Ping",
    created_at: "2026-06-22T12:02:00+08:00"
  });

  const event = createMessageNewEvent(message, {
    event_id: "evt_01J0MESSAGEEVENT0000000001",
    created_at: "2026-06-22T12:02:01+08:00"
  });

  assert.equal(event.event, "message.new");
  assert.equal(event.data.message.message_id, message.message_id);
});

test("reports useful validation errors", () => {
  const errors = validateMessageEnvelope({
    protocol: "agentlink.message.v0.2",
    conversation_id: "bad",
    from: { actor_type: "agent", actor_id: "agt_01J0AGENT" },
    to: [],
    sender_mode: "agent_sent",
    content: { type: "text", text: "" }
  });

  assert(errors.some((error) => error.includes("conversation_id")));
  assert(errors.some((error) => error.includes("to must contain at least one actor")));
  assert(errors.some((error) => error.includes("on_behalf_of is required")));
  assert(errors.some((error) => error.includes("content.text must be a non-empty string")));
});

test("example script builds a valid message and realtime event", () => {
  const payload = buildDemoPayload();

  assert.equal(payload.message.protocol, "agentlink.message.v0.2");
  assert.equal(payload.message.sender_mode, "agent_sent");
  assert.equal(payload.message.on_behalf_of.actor_type, "user");
  assert.equal(payload.event.event, "message.new");
  assert.equal(payload.event.data.message.message_id, payload.message.message_id);
  assert.deepEqual(validateMessageEnvelope(payload.message), []);
});

if (process.exitCode) process.exit(process.exitCode);
