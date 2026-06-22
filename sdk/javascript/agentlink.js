const crypto = require("node:crypto");

const ACTOR_TYPES = new Set(["user", "agent", "app", "device", "system"]);
const SENDER_MODES = new Set(["human_sent", "agent_drafted", "agent_sent", "app_sent", "system_sent"]);
const ACTOR_PREFIX = {
  user: "usr",
  agent: "agt",
  app: "app",
  device: "dev",
  system: "sys"
};

function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
}

function randomSuffix() {
  return crypto.randomBytes(12).toString("hex").toUpperCase();
}

function makeId(prefix) {
  return `${prefix}_${randomSuffix()}`;
}

function actor(actor_type, actor_id, extras = {}) {
  if (!ACTOR_TYPES.has(actor_type)) {
    throw new Error(`actor_type must be one of ${Array.from(ACTOR_TYPES).join(", ")}`);
  }
  const expectedPrefix = ACTOR_PREFIX[actor_type];
  if (typeof actor_id !== "string" || !actor_id.startsWith(`${expectedPrefix}_`)) {
    throw new Error(`${actor_type} actor_id must start with ${expectedPrefix}_`);
  }

  return compactObject({
    actor_type,
    actor_id,
    owner_user_id: extras.owner_user_id,
    display_name: extras.display_name,
    capabilities: extras.capabilities,
    status: extras.status
  });
}

function createTextMessage(options) {
  const createdAt = options.created_at || new Date().toISOString();
  const senderMode = options.sender_mode || (options.from?.actor_type === "agent" ? "agent_sent" : "human_sent");
  const message = compactObject({
    protocol: "agentlink.message.v0.2",
    message_id: options.message_id || makeId("msg"),
    client_msg_id: options.client_msg_id,
    conversation_id: options.conversation_id,
    from: options.from,
    on_behalf_of: options.on_behalf_of,
    to: options.to,
    sender_mode: senderMode,
    content: {
      type: "text",
      text: options.text
    },
    policy: {
      approval: options.policy?.approval || (senderMode === "agent_sent" ? "required" : "not_required"),
      sensitive: options.policy?.sensitive ?? false,
      requires_human_reply: options.policy?.requires_human_reply ?? false,
      visibility: options.policy?.visibility || "participants"
    },
    security: {
      transport: "tls",
      signed: options.security?.signed ?? false,
      signature_alg: options.security?.signature_alg || "none",
      timestamp: options.security?.timestamp || createdAt,
      nonce: options.security?.nonce || makeId("n")
    },
    receipts: options.receipts || [],
    audit: {
      request_id: options.audit?.request_id || makeId("req"),
      trace_id: options.audit?.trace_id || makeId("trc")
    },
    created_at: createdAt
  });

  const errors = validateMessageEnvelope(message);
  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  return message;
}

function createMessageNewEvent(message, options = {}) {
  const createdAt = options.created_at || new Date().toISOString();
  return {
    event: "message.new",
    event_id: options.event_id || makeId("evt"),
    created_at: createdAt,
    data: {
      message
    }
  };
}

function validateActor(value, path) {
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [`${path} must be an actor object`];
  }
  if (!ACTOR_TYPES.has(value.actor_type)) {
    errors.push(`${path}.actor_type must be a known actor type`);
  }
  if (typeof value.actor_id !== "string" || !/^(usr|agt|app|dev|sys)_[A-Za-z0-9]+$/.test(value.actor_id)) {
    errors.push(`${path}.actor_id must use an AgentLink actor id prefix`);
  }
  if (value.actor_type && value.actor_id) {
    const expectedPrefix = ACTOR_PREFIX[value.actor_type];
    if (expectedPrefix && !value.actor_id.startsWith(`${expectedPrefix}_`)) {
      errors.push(`${path}.actor_id prefix must match ${value.actor_type}`);
    }
  }
  return errors;
}

function validateMessageEnvelope(message) {
  const errors = [];
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return ["message must be an object"];
  }
  if (message.protocol !== "agentlink.message.v0.2") {
    errors.push("protocol must be agentlink.message.v0.2");
  }
  if (typeof message.conversation_id !== "string" || !/^conv_[A-Za-z0-9]+$/.test(message.conversation_id)) {
    errors.push("conversation_id must start with conv_");
  }
  errors.push(...validateActor(message.from, "from"));
  if (!Array.isArray(message.to) || message.to.length === 0) {
    errors.push("to must contain at least one actor");
  } else {
    message.to.forEach((target, index) => errors.push(...validateActor(target, `to[${index}]`)));
  }
  if (!SENDER_MODES.has(message.sender_mode)) {
    errors.push("sender_mode must be a known AgentLink sender mode");
  }
  if ((message.sender_mode === "agent_sent" || message.from?.actor_type === "agent") && !message.on_behalf_of) {
    errors.push("on_behalf_of is required when an Agent sends a message");
  }
  if (message.on_behalf_of) {
    errors.push(...validateActor(message.on_behalf_of, "on_behalf_of"));
  }
  if (!message.content || message.content.type !== "text") {
    errors.push("content.type must be text");
  }
  if (typeof message.content?.text !== "string" || message.content.text.length === 0) {
    errors.push("content.text must be a non-empty string");
  }
  if (!message.security || message.security.transport !== "tls") {
    errors.push("security.transport must be tls");
  }
  if (message.security?.signature_alg && !["ed25519", "none"].includes(message.security.signature_alg)) {
    errors.push("security.signature_alg must be ed25519 or none");
  }
  if (typeof message.created_at !== "string" || Number.isNaN(Date.parse(message.created_at))) {
    errors.push("created_at must be a valid date-time string");
  }
  return errors;
}

module.exports = {
  actor,
  createTextMessage,
  createMessageNewEvent,
  validateMessageEnvelope
};
