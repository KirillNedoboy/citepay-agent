# Demo Script - AgentPay Guard Ignyte / Circle / Arc

## Goal

Show in under two minutes that AgentPay Guard evaluates an agent's USDC payment intents before any x402, Circle Gateway, or Arc-compatible payment rail is used.

## Setup

```bash
pnpm dev
```

Open the local URL printed by Next.js, usually:

```txt
http://localhost:3000
```

## 0:00-0:20 - Opening

Show the title, live summary, and boundary card.

Say:

> AgentPay Guard is a preflight policy and audit layer for AI-agent stablecoin payments. It decides whether a USDC spend intent is allowed, needs review, or must be blocked before any payment rail is reached.

Point out the boundary:

- no payment execution;
- no wallet signing;
- no private keys;
- no fake transaction hash.

## 0:20-0:55 - Run the preset

Use the built-in `Ignyte/Circle/Arc demo preset`.

Click:

```txt
Run demo
```

Expected selected sources:

- `Trusted x402 verification API`
- `Premium evidence bundle`
- `Untrusted scrape cache`
- `Telemetry attestation note`

Expected skipped source:

- `Market data note` -> `not_relevant`

## 0:55-1:25 - Explain decisions

Point at the Guard decisions.

Expected outcomes:

- `Trusted x402 verification API` -> `ALLOW`
- `Premium evidence bundle` -> `REVIEW`
- `Untrusted scrape cache` -> `BLOCK`
- `Telemetry attestation note` -> `REVIEW`

Say:

> The same agent workflow produces different decisions because policy looks at recipient trust, purpose, amount thresholds, and blocked recipients. Only the trusted low-value API request is allowed.

## 1:25-1:45 - Show rail preview

Point at the rail preview fields for evaluated sources or validator output.

Expected fields:

- rail label;
- settlement asset `USDC`;
- execution mode `mock_preview` or `live_disabled`;
- recipient;
- amount;
- preview-only explanation.

Say:

> This is a preview adapter, not settlement. It shows how the allowed intent could be prepared for an x402, Circle Gateway, or Arc-compatible flow later, but this demo does not move funds or call live payment APIs.

## 1:45-2:00 - Show audit proof

Expand or point at the audit log.

Say:

> Each successful evaluation writes or reuses a JSONL audit record. The record includes policy evidence and rail preview metadata, but no secrets, signatures, or transaction hashes.

Mention:

```txt
data/audit-log.jsonl
```
