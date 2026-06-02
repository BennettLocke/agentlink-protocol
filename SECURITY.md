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

