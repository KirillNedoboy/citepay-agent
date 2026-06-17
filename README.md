# AgentPay Guard

AgentPay Guard is a preflight policy and audit layer for AI-agent payment intents on Arc / Circle Gateway / x402-style flows.

It does not move funds. It evaluates payment intent before an AI agent proceeds to an x402 / Circle Gateway / Arc payment flow.

## CitePay Agent / Lepton Branch

This branch keeps AgentPay Guard as the existing policy and audit foundation and adds CitePay Agent as a local paid-source demo on top of the Guard API.

CitePay Agent selects mock paid creator/source cards, converts each selected card into a normal AgentPay Guard payment intent, and evaluates those intents through the existing Guard decision path.

This branch does not implement real payments, wallet signing, or live Circle Gateway / x402 / Arc integration.

## What It Is

AgentPay Guard is a local TypeScript MVP that accepts a payment intent, validates it, applies deterministic policy rules, returns `ALLOW`, `REVIEW`, or `BLOCK`, and writes a JSONL audit record.

It is built for developers who want a simple guard layer before autonomous agents or machine clients spend USDC for APIs, data, compute, telemetry, or services.

## Problem

AI agents and machine-to-machine systems can initiate payments faster than a human can review each spend. Before an autonomous payment executes, builders need to know:

- whether the agent is allowed to pay;
- whether the recipient is trusted;
- whether the amount and scenario fit policy;
- whether risk signals require review or block;
- whether the decision has an audit trail.

Without this layer, autonomous payments are harder to explain, test, and control.

## Solution

AgentPay Guard provides a preflight API and demo UI:

1. A payment intent enters the Guard.
2. Required fields are validated.
3. Decimal-string amount rules are evaluated without floating-point money math.
4. Deterministic policy rules produce `ALLOW`, `REVIEW`, or `BLOCK`.
5. A JSONL audit record is appended or reused by `idempotencyKey`.
6. The local UI shows the decision and recent audit log.

## Why Arc / Circle

Arc, Circle Gateway, USDC, and x402-style paid APIs make autonomous and machine-to-machine payments more practical for builders.

AgentPay Guard sits before those payment rails. Its role is not payment execution; its role is policy, explainability, and auditability before an agent proceeds.

## How It Works

Policy config lives in:

```txt
data/policies.default.json
```

Audit records are written to:

```txt
data/audit-log.jsonl
```

Main API:

```http
POST /api/payment-intents/evaluate
```

Response fields:

- `decision`
- `riskScore`
- `reason`
- `matchedRules`
- `policyId`
- `auditId`
- `createdAt`

The same `idempotencyKey` returns the existing audit record and does not append a duplicate line.

## Architecture Flow

```txt
AI Agent
  -> AgentPay Guard
  -> x402 / Circle Gateway
  -> Paid API / Service
```

Internal MVP flow:

```txt
Payment intent
  -> request validation
  -> policy config
  -> deterministic policy engine
  -> risk score + decision
  -> JSONL audit log
  -> demo UI result
```

## Demo Scenarios

| Scenario | File | Expected |
|---|---|---|
| API nanopayment | `examples/scenario-allow-api.json` | `ALLOW` |
| Machine-to-machine payment | `examples/scenario-review-machine.json` | `REVIEW` |
| Risky autonomous spend | `examples/scenario-block-risky.json` | `BLOCK` |

## Audit Log Behavior

- Every successful policy evaluation writes or reuses one audit record.
- Audit records are append-only JSONL.
- Required fields include intent details, decision, risk score, matched rules, reason, policy id, timestamp, and audit id.
- Reusing an `idempotencyKey` returns the prior decision and does not create a duplicate record.

## Run Locally

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm lint
pnpm typecheck
pnpm build
pnpm dev
```

Open:

```txt
http://localhost:3000
```

## CitePay Local Demo

Deterministic preset:

Query:

```txt
Need weather risk, climate claims, telemetry attestation, and private scrape cache context for an insurance answer
```

Budget:

```txt
0.24 USDC
```

What the demo shows:

- mock paid creator/source cards;
- deterministic selection;
- payment intents evaluated by Guard;
- `ALLOW` / `REVIEW` / `BLOCK`;
- proposed spend vs allowed spend.

Related local demo script:

- [`docs/citepay-demo-script.md`](docs/citepay-demo-script.md)

Screenshots:

- [`screenshots/05-citepay-preset-loaded.png`](screenshots/05-citepay-preset-loaded.png)
- [`screenshots/06-citepay-guard-decisions.png`](screenshots/06-citepay-guard-decisions.png)
- [`screenshots/07-citepay-spend-summary.png`](screenshots/07-citepay-spend-summary.png)

Current verified test coverage includes policy decisions, money edge cases, unsupported currency, denylisted/unknown recipients, unknown scenarios, suspicious keywords, daily limit, velocity limit, idempotency, JSONL validity, invalid API input safe failure, and CitePay deterministic source selection.

## Not Implemented Yet

- real payment settlement;
- wallet signing;
- live Circle Gateway / x402 / Arc integration;
- custody / private key handling;
- DB / auth;
- smart contracts;
- production fraud / AML / compliance claims.

AgentPay Guard is still not a payment rail, wallet, custody product, fraud-prevention guarantee, or official Arc/Circle module.

## Roadmap

Potential next safe steps after this local branch demo:

1. Open a PR and publish the submission proof pack.
2. Add a buyer-side adapter for a real x402 / Circle Gateway flow.
3. Add an operator review queue for `REVIEW` decisions.
4. Add policy editing and exportable audit reports.
5. Add webhook examples for agent frameworks.
6. Add optional audit hash anchoring.

Live payment integration is future work, not part of the current MVP.

## Hackathon Relevance

This proof shows a concrete builder need around autonomous USDC payments: before agents spend, developers need deterministic controls and auditability.

AgentPay Guard complements Arc / Circle / x402 payment infrastructure by demonstrating the policy layer that can sit immediately before payment execution.
