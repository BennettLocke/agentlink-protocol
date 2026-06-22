# AgentLink Connector Boundary

This document defines what belongs in public AgentLink connector examples and what must stay out.

The goal is simple: make the protocol easy to implement without leaking AgentLink Cloud, official product code, production deployment details, customer data, or commercial connector internals.

## Allowed in public connector examples

Public connector examples may include:

- local-only mock connector flows,
- protocol-shaped request and response examples,
- fake actor ids, conversation ids, message ids, request ids, and event ids,
- JSON Schemas and OpenAPI drafts,
- compatibility test fixtures,
- dependency-free SDK examples,
- mock task formats such as `openclaw.task.request` and `openclaw.task.response`,
- comments that explain required authorization and approval semantics,
- examples that preserve `on_behalf_of` when an Agent acts for a human,
- examples that show `agent_sent` messages as Agent output, not manual human messages.

The current `sdk/javascript/examples/openclaw-connector.js` file is a local-only mock. It demonstrates the shape of a connector flow without calling a real OpenClaw node or AgentLink Cloud.

## Not allowed in public connector examples

Public connector examples must not include:

- production tokens,
- private endpoints,
- database credentials,
- deployment secrets,
- server environment variables,
- real customer data,
- real user messages,
- real device keys or private keys,
- AgentLink Cloud source code,
- official desktop or mobile app source code,
- production database schema,
- commercial connector internals,
- proprietary OpenClaw binding code,
- code that can operate a real customer connector without additional private setup.

If an example needs a token, use a placeholder such as `<agent_token>` and make it obvious that the value is not real.

## Required public connector behavior

Every public connector example should preserve these protocol rules:

- A connector must keep the human owner visible with `on_behalf_of`.
- A connector must not present `agent_sent` as manual human input.
- A connector must name the draft and compatibility level it targets.
- A connector must show where authorization or approval would be checked.
- A connector must keep local mock data separate from production configuration.
- A connector must be runnable without real AgentLink Cloud credentials.

## OpenClaw example boundary

OpenClaw examples in this repository may show:

- a local inbound AgentLink message,
- a mock OpenClaw task request,
- a mock OpenClaw task response,
- an AgentLink `agent_sent` reply,
- a `message.new` realtime event.

OpenClaw examples in this repository must not show:

- real OpenClaw install scripts,
- private one-click binding endpoints,
- production websocket URLs,
- user-specific home machine identifiers,
- private plugin or skill installation logic,
- official commercial connector internals.

When the official AgentLink product ships an OpenClaw connector, that implementation can remain private product code while this public repository continues to describe the protocol shape.

## Repository split

Use this split:

```text
agentlink-protocol
  Public protocol drafts, schemas, examples, SDK references, mock connector flows.

agentlink
  Private AgentLink product implementation, AgentLink Cloud integration, desktop app, server, deployment, and commercial connector code.
```

This boundary lets third parties implement the protocol while protecting AgentLink Cloud, user trust, security posture, and commercial product work.

## Review checklist

Before committing a connector example to this public repository, check:

- Does it run locally without secrets?
- Does it avoid real endpoints and production tokens?
- Does it use fake ids and fake messages?
- Does it preserve `on_behalf_of` for Agent actions?
- Does it avoid official commercial connector internals?
- Does it explain which behavior is mock-only?

If any answer is no, keep the change in the private product repository or rewrite it as a local-only mock.
