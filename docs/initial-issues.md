# Initial GitHub Issues

Use this list to create the first public issues after the repository is published.

## 1. Define v0.1 compatibility checklist

Create a checklist that lets servers and SDKs claim limited AgentLink compatibility.

Acceptance criteria:

- Covers identity, contacts, sender modes, permissions, approvals, and sync
- Distinguishes required behavior from optional behavior
- Explains what an implementation may not claim

## 2. Expand OpenAPI coverage

The current OpenAPI draft covers the main routes but not every request and response body.

Acceptance criteria:

- Add contacts routes
- Add conversations routes
- Add approvals routes
- Add receipts routes
- Add standard response envelope schemas
- Add error response schemas

## 3. Add JavaScript SDK examples

Provide examples for agent and mobile-client developers.

Acceptance criteria:

- Login example
- Send human message example
- Send agent message example
- Approval-required handling example
- Sync example

## 4. Add Python SDK examples

Provide examples for local agents and automation runtimes.

Acceptance criteria:

- Agent token configuration example
- Send agent message example
- Approval-required handling example
- Sync example

## 5. Add realtime WebSocket examples

Make realtime delivery easier to implement.

Acceptance criteria:

- message.new payload
- message.receipt payload
- approval.created payload
- sync.cursor payload
- Authentication notes

