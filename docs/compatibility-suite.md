# AgentLink Compatibility Suite

Status: Draft  
Applies to: AgentLink Protocol `v0.2` and security/key-system guidance `v0.3`

The compatibility suite is the current automated evidence gate for this public protocol repository. It is not a full `v1.0` certification program yet, but it prevents the public draft from drifting away from the human-owned Agent model.

Run it from the repository root:

```powershell
npm run test:compat
```

The full repository gate also runs it:

```powershell
npm test
```

## What It Checks

| Level | Automated evidence |
|---:|---|
| Level 0 | Basic actor/message shape in `examples/human-to-human-message-v0.2.json`. |
| Level 1 | Agent `sender_mode`, `on_behalf_of`, granted approval, and approval-required rejection examples. |
| Level 2 | `message.new` realtime event, receipts array, scoped agent token guidance, and user-token boundary. |
| Level 3 | Signed Agent message metadata, Ed25519 signature fields, nonce/timestamp rules, and audit ids. |
| Level 4 | Human and Agent ciphertext envelopes without plaintext fallback, with nonce binding and E2EE security metadata. |
| Level 5 | Agent grant security guidance, grant revocation route, local grant unwrap requirement, key rotation guidance, and encrypted Agent reply signing evidence. |

## What It Does Not Prove Yet

The suite does not prove:

- a server implementation enforces every rule in production,
- a connector is an official AgentLink connector,
- a client has completed a security audit,
- an implementation is compatible with future `v1.0`,
- universal end-to-end encryption for every conversation.

Implementations should still publish their own tests, limitations, and evidence using `docs/compatibility-matrix.md`.

## Relationship To Claims

Use the suite as repository-level evidence only. External projects should still name their own level:

```text
Compatible with AgentLink Protocol v0.2 Level 2.
Implements AgentLink security/key-system v0.3 Level 4.
```

Do not claim "fully AgentLink compatible" just because this repository's suite passes.
