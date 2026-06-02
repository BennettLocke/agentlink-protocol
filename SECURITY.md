# Security Policy

AgentLink Protocol is a draft, and security feedback is welcome.

## Scope

In scope:

- Agent permission bypasses
- Message sender-mode spoofing
- Approval-flow bypasses
- User/contact ownership ambiguity
- Token handling guidance
- Sync cursor privacy leaks
- Realtime event authorization issues

Out of scope for this protocol repository:

- Vulnerabilities in the private official AgentLink server
- Production infrastructure issues
- User account recovery for hosted services
- App-store distribution issues

## Reporting

Open a GitHub issue for protocol-level concerns that can be discussed publicly.

For sensitive reports, do not include secrets, real tokens, private user data, or exploit details in public issue text. Instead, open a minimal issue saying that a private security discussion is needed.

## Security Principles

- Agents must not silently impersonate humans.
- Agents must not own contacts independently from users.
- Sensitive agent actions should require human approval.
- Tokens should be scoped to the actor type: user, device, or agent.
- Sync APIs should return only data visible to the authenticated user.
- v0.2 messages should preserve actor identity through `from`, `to`, and `on_behalf_of`.
- Agent tokens must not be accepted as user session tokens.
- Important agent or app messages should include timestamp and nonce fields so servers can reject expired or replayed messages.
- Where signatures are implemented, use audited cryptographic libraries and do not invent low-level algorithms.
- Full end-to-end encryption is a future extension; implementations should document whether the server can read message content.

## v0.2 Security Model

AgentLink security is layered:

```text
Transport encryption:
HTTPS and WSS in production.

Actor authentication:
Tokens scoped to user, agent, device, or app.

Authorization:
Server-side permission checks before delivery.

Message integrity:
Reserved timestamp, nonce, key_id, signature_alg, and signature fields.

Audit:
Sensitive agent actions should be traceable with request_id and trace_id.

Future privacy:
Optional end-to-end encryption for high-privacy conversations.
```

Recommended public references:

- TLS 1.3: https://www.rfc-editor.org/info/rfc8446
- Messaging Layer Security: https://www.rfc-editor.org/rfc/rfc9420.html
- OWASP Cryptographic Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html
- OWASP Key Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html
