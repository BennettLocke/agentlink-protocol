const {
  actor,
  createTextMessage,
  createMessageNewEvent,
  validateMessageEnvelope
} = require("../agentlink");

function buildDemoPayload() {
  const owner = actor("user", "usr_01J0ALICE0000000000000001", {
    display_name: "Alice"
  });
  const agent = actor("agent", "agt_01J0ALICE0000000000000001", {
    owner_user_id: owner.actor_id,
    display_name: "Alice Agent"
  });
  const friend = actor("user", "usr_01J0BOB000000000000000001", {
    display_name: "Bob"
  });

  const message = createTextMessage({
    message_id: "msg_01J0SDKDEMO00000000000001",
    client_msg_id: "sdk_demo_20260622_0001",
    conversation_id: "conv_01J0LUNCH0000000000000001",
    from: agent,
    on_behalf_of: owner,
    to: [friend],
    sender_mode: "agent_sent",
    text: "Alice asked me to check whether you are free for lunch.",
    created_at: "2026-06-22T12:10:00+08:00",
    security: {
      timestamp: "2026-06-22T12:10:00+08:00",
      nonce: "n_01J0SDKDEMO00000000000001"
    },
    audit: {
      request_id: "req_01J0SDKDEMO00000000000001",
      trace_id: "trc_01J0SDKDEMO00000000000001"
    }
  });

  const event = createMessageNewEvent(message, {
    event_id: "evt_01J0SDKDEMO00000000000001",
    created_at: "2026-06-22T12:10:01+08:00"
  });

  return {
    message,
    event
  };
}

function main() {
  const payload = buildDemoPayload();
  const errors = validateMessageEnvelope(payload.message);
  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

if (require.main === module) {
  main();
}

module.exports = {
  buildDemoPayload
};
