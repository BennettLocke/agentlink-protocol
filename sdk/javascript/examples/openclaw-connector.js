const {
  actor,
  createTextMessage,
  createMessageNewEvent,
  validateMessageEnvelope
} = require("../agentlink");

function buildOpenClawConnectorDemo() {
  const owner = actor("user", "usr_01J0ALICE0000000000000001", {
    display_name: "Alice"
  });
  const openclawAgent = actor("agent", "agt_01J0OPENCLAW0000000001", {
    owner_user_id: owner.actor_id,
    display_name: "OpenClaw Home"
  });

  const inboundMessage = createTextMessage({
    message_id: "msg_01J0OPENCLAWIN0000000001",
    client_msg_id: "desktop_20260622_openclaw_0001",
    conversation_id: "conv_01J0HOME0000000000000001",
    from: owner,
    to: [openclawAgent],
    sender_mode: "human_sent",
    text: "Check whether the home OpenClaw agent is online.",
    created_at: "2026-06-22T12:20:00+08:00",
    policy: {
      approval: "not_required",
      requires_human_reply: false
    },
    security: {
      timestamp: "2026-06-22T12:20:00+08:00",
      nonce: "n_01J0OPENCLAWIN0000000001"
    },
    audit: {
      request_id: "req_01J0OPENCLAWIN0000000001",
      trace_id: "trc_01J0OPENCLAWIN0000000001"
    }
  });

  const openclawRequest = {
    type: "openclaw.task.request",
    task_id: "ocl_task_01J0OPENCLAW0000001",
    input: inboundMessage.content.text,
    context: {
      source: "agentlink.protocol.example",
      source_message_id: inboundMessage.message_id,
      owner_user_id: owner.actor_id,
      agent_id: openclawAgent.actor_id,
      conversation_id: inboundMessage.conversation_id
    }
  };

  const openclawResponse = {
    type: "openclaw.task.response",
    task_id: openclawRequest.task_id,
    status: "completed",
    output: "OpenClaw Home is reachable in this mock connector example."
  };

  const replyMessage = createTextMessage({
    message_id: "msg_01J0OPENCLAWOUT000000001",
    client_msg_id: "openclaw_mock_20260622_0001",
    conversation_id: inboundMessage.conversation_id,
    from: openclawAgent,
    on_behalf_of: owner,
    to: [owner],
    sender_mode: "agent_sent",
    text: openclawResponse.output,
    created_at: "2026-06-22T12:20:02+08:00",
    policy: {
      approval: "granted",
      requires_human_reply: false
    },
    security: {
      timestamp: "2026-06-22T12:20:02+08:00",
      nonce: "n_01J0OPENCLAWOUT000000001"
    },
    audit: {
      request_id: "req_01J0OPENCLAWOUT000000001",
      trace_id: "trc_01J0OPENCLAWOUT000000001"
    }
  });

  const replyEvent = createMessageNewEvent(replyMessage, {
    event_id: "evt_01J0OPENCLAWOUT000000001",
    created_at: "2026-06-22T12:20:03+08:00"
  });

  return {
    inbound: {
      message: inboundMessage
    },
    openclaw: {
      request: openclawRequest,
      response: openclawResponse
    },
    outbound: {
      message: replyMessage,
      event: replyEvent
    }
  };
}

function main() {
  const demo = buildOpenClawConnectorDemo();
  const errors = [
    ...validateMessageEnvelope(demo.inbound.message),
    ...validateMessageEnvelope(demo.outbound.message)
  ];
  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }
  process.stdout.write(`${JSON.stringify(demo, null, 2)}\n`);
}

if (require.main === module) {
  main();
}

module.exports = {
  buildOpenClawConnectorDemo
};
