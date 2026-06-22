# Changelog

## Unreleased

- Added `npm test` validation for public schemas and examples.
- Added a lightweight Node.js validator that checks JSON parsing, local schema references, and example-to-schema compatibility without adding package dependencies.
- Documented the validation command in the README and compatibility checklist.

## v0.3.0-draft - 2026-06-16

- Added security and key-system draft covering security layers, device keys, conversation key versions, wrapped keys, agent decryption grants, ciphertext content, signing, replay protection, and local encrypted cache.
- Added `schemas/message-v0.3.schema.json` to define ciphertext content fields, content-protection metadata, and future E2EE envelope compatibility.
- Added `examples/encrypted-agent-reply-v0.3.json` to show a signed Agent ciphertext reply using `signer_agent_crypto_key_id`.
- Added `docs/compatibility-checklist.md` with compatibility levels from message shape through scoped Agent grant security.
- Documented baseline `/v1/crypto/*` routes for device keys, conversation key versions, wrapped keys, and agent key grants.
- Documented ciphertext nonce replay protection and message security context metadata.
- Added `security.signer_device_key_id` for device-signed encrypted human messages.
- Added `security.signer_agent_crypto_key_id` for encrypted Agent replies.
- Updated README and roadmap to make the security/key-system draft discoverable.

## v0.2.0-draft - 2026-06-02

- Added unified actor model for users, agents, apps, devices, and system actors.
- Added v0.2 message envelope with `from`, `to`, `on_behalf_of`, `policy`, `security`, `receipts`, and `audit`.
- Added v0.1 to v0.2 migration notes.
- Added actor, message, event, approval, and security-context schemas.
- Added v0.2 examples for human-to-human, agent-to-user, agent-to-agent, approval, realtime event, and security context.
- Added v0.2 OpenAPI draft for unified message semantics.
- Updated README, roadmap, realtime event guidance, and security policy for v0.2.

## v0.1.0-draft - 2026-06-02

- Added initial public protocol draft.
- Added human-owned agent identity model.
- Added sender modes for human and agent messages.
- Added conservative agent permission model.
- Added minimal HTTP route list.
- Added message schema and example payloads.
- Added Apache-2.0 license.
- Added roadmap, security policy, realtime event examples, and GitHub issue templates.
