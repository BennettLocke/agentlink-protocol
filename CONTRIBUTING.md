# Contributing to AgentLink Protocol

AgentLink Protocol is currently a draft.

The best contributions at this stage are:

```text
1. Ambiguous wording reports
2. Compatibility questions
3. Missing example payloads
4. Security and permission model concerns
5. API naming suggestions
6. Mobile delivery and notification edge cases
```

## Proposal Format

Use the GitHub issue templates when possible. For protocol proposals, include:

```text
Problem:
Current protocol behavior:
Suggested change:
Compatibility impact:
Example payload:
```

## Pull Requests

Pull requests should keep the protocol easy to implement.

Before opening a pull request, check:

```text
1. The change does not let agents own contacts independently.
2. The change preserves sender-mode visibility.
3. The change keeps agent permissions explicit.
4. Examples or schemas are updated when payloads change.
5. Compatibility impact is described.
```

## Design Boundary

The protocol is public. The official AgentLink server, app, hosted identity network, user data, production configuration, and commercial agent logic are not part of this repository.
