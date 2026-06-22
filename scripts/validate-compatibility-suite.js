#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function hasOwn(value, key) {
  return value && Object.prototype.hasOwnProperty.call(value, key);
}

function requireIncludes(label, content, snippets) {
  for (const snippet of snippets) {
    assert(content.includes(snippet), `${label}: missing ${snippet}`);
  }
}

function requireActor(label, actor, type) {
  assert(actor && actor.actor_type === type, `${label}: expected actor_type ${type}`);
  assert(typeof actor.actor_id === "string" && actor.actor_id.length > 0, `${label}: missing actor_id`);
}

function requireSecurityFields(label, security) {
  assert(security && security.transport === "tls", `${label}: missing tls transport`);
  assert(typeof security.timestamp === "string" && security.timestamp.length > 0, `${label}: missing timestamp`);
  assert(typeof security.nonce === "string" && security.nonce.length >= 8, `${label}: missing nonce`);
}

function requireCiphertext(label, message) {
  assert(message.content && message.content.type === "ciphertext", `${label}: content must be ciphertext`);
  for (const key of ["suite", "alg", "key_id", "key_version", "nonce", "ciphertext", "tag"]) {
    assert(hasOwn(message.content, key), `${label}: ciphertext missing ${key}`);
  }
  assert(!hasOwn(message.content, "text"), `${label}: ciphertext must not include plaintext text fallback`);
  assert(message.security && message.security.content_protection === "e2ee", `${label}: security must declare e2ee`);
}

function validateLevel0() {
  const human = readJson("examples/human-to-human-message-v0.2.json");
  requireActor("Level 0 human.from", human.from, "user");
  assert(Array.isArray(human.to) && human.to.length === 1, "Level 0 human.to must include recipients");
  requireActor("Level 0 human.to[0]", human.to[0], "user");
  assert(human.protocol === "agentlink.message.v0.2", "Level 0 must preserve protocol version");
  assert(human.sender_mode === "human_sent", "Level 0 must preserve sender_mode");
  assert(human.content && human.content.type === "text" && human.content.text, "Level 0 must preserve text content");
  return ["examples/human-to-human-message-v0.2.json"];
}

function validateLevel1() {
  const agent = readJson("examples/agent-to-user-message-v0.2.json");
  const approval = readJson("examples/agent-message-approval-required.json");
  requireActor("Level 1 agent.from", agent.from, "agent");
  requireActor("Level 1 agent.on_behalf_of", agent.on_behalf_of, "user");
  assert(agent.sender_mode === "agent_sent", "Level 1 must preserve agent_sent sender mode");
  assert(agent.policy && agent.policy.approval === "granted", "Level 1 agent example must show granted approval");
  assert(
    approval.request.body.policy && approval.request.body.policy.requires_human_approval === true,
    "Level 1 approval example must require human approval",
  );
  assert(approval.response.error.code === "approval_required", "Level 1 approval example must reject sensitive auto-send");
  return ["examples/agent-to-user-message-v0.2.json", "examples/agent-message-approval-required.json"];
}

function validateLevel2() {
  const event = readJson("examples/message-new-event-v0.2.json");
  const securityContext = readJson("examples/security-context-v0.2.json");
  assert(event.event === "message.new", "Level 2 must include message.new realtime event");
  assert(event.data && event.data.message && event.data.message.message_id, "Level 2 event must carry message data");
  assert(Array.isArray(event.data.message.receipts), "Level 2 message must expose receipts array");
  assert(securityContext.token_scope === "agent", "Level 2 security context must model scoped actor tokens");
  assert(
    securityContext.rules.some((rule) => rule.includes("agent tokens must not be accepted as user session tokens")),
    "Level 2 must document agent-token/user-token boundary",
  );
  return ["examples/message-new-event-v0.2.json", "examples/security-context-v0.2.json"];
}

function validateLevel3() {
  const agent = readJson("examples/agent-to-user-message-v0.2.json");
  const securityContext = readJson("examples/security-context-v0.2.json");
  requireSecurityFields("Level 3 agent security", agent.security);
  assert(agent.security.signed === true, "Level 3 signed example must be signed");
  assert(agent.security.signature_alg === "ed25519", "Level 3 signed example must use ed25519");
  assert(agent.security.signature, "Level 3 signed example must include signature");
  assert(agent.audit && agent.audit.request_id && agent.audit.trace_id, "Level 3 must include audit ids");
  requireIncludes("Level 3 security rules", securityContext.rules.join("\n"), [
    "servers should reject reused nonce values",
    "servers should reject expired timestamps",
    "signatures should cover sender, target, content, policy, timestamp, and nonce",
  ]);
  return ["examples/agent-to-user-message-v0.2.json", "examples/security-context-v0.2.json"];
}

function validateLevel4() {
  const encryptedHuman = readJson("examples/encrypted-message-v0.3.json");
  const encryptedAgent = readJson("examples/encrypted-agent-reply-v0.3.json");
  requireCiphertext("Level 4 encrypted human message", encryptedHuman);
  requireCiphertext("Level 4 encrypted agent reply", encryptedAgent);
  assert(
    encryptedHuman.content.nonce === encryptedHuman.security.nonce,
    "Level 4 human ciphertext nonce must bind to security nonce",
  );
  assert(
    encryptedAgent.content.nonce === encryptedAgent.security.nonce,
    "Level 4 agent ciphertext nonce must bind to security nonce",
  );
  return ["examples/encrypted-message-v0.3.json", "examples/encrypted-agent-reply-v0.3.json"];
}

function validateLevel5() {
  const encryptedAgent = readJson("examples/encrypted-agent-reply-v0.3.json");
  const securityDoc = readText("docs/security-key-system-v0.3.md");
  const matrix = readText("docs/compatibility-matrix.md");
  requireActor("Level 5 encrypted agent.from", encryptedAgent.from, "agent");
  requireActor("Level 5 encrypted agent.on_behalf_of", encryptedAgent.on_behalf_of, "user");
  assert(
    encryptedAgent.security.signer_agent_crypto_key_id,
    "Level 5 encrypted Agent reply must include signer_agent_crypto_key_id",
  );
  requireIncludes("Level 5 security doc", securityDoc, [
    "POST /v1/crypto/agent-key-grants",
    "DELETE /v1/crypto/agent-key-grants/:grantId",
    "active, unexpired, non-revoked",
    "Grant creation, use, and revocation must be auditable",
    "Agent connectors unwrap grants locally",
    "After revocation, new messages should use a rotated conversation key",
  ]);
  requireIncludes("Level 5 matrix", matrix, [
    "Agent Grant Security",
    "Grant lifecycle tests",
    "revocation tests",
    "key-rotation evidence",
  ]);
  return [
    "examples/encrypted-agent-reply-v0.3.json",
    "docs/security-key-system-v0.3.md",
    "docs/compatibility-matrix.md",
  ];
}

try {
  const levels = [
    ["Level 0", validateLevel0],
    ["Level 1", validateLevel1],
    ["Level 2", validateLevel2],
    ["Level 3", validateLevel3],
    ["Level 4", validateLevel4],
    ["Level 5", validateLevel5],
  ];

  const results = levels.map(([level, validateLevel]) => ({
    level,
    ok: true,
    evidence: validateLevel(),
  }));

  console.log(JSON.stringify({
    ok: true,
    message: "AgentLink compatibility suite ok",
    draft: {
      protocol: "v0.2",
      security: "v0.3",
    },
    levels: results,
  }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
