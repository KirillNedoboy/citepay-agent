# Ignyte / Circle / Arc Brief

## Positioning

AgentPay Guard is a preflight decision layer for autonomous stablecoin commerce.

Before an AI agent proceeds toward x402, Circle Gateway, or an Arc-compatible settlement path, Guard evaluates the payment intent and records why it was allowed, held for review, or blocked.

## What the demo proves

- A paid API/data/service request becomes a normal USDC payment intent.
- Deterministic policy rules produce `ALLOW`, `REVIEW`, or `BLOCK`.
- Audit records are written as append-only JSONL with idempotency.
- The response includes a typed Circle/Arc rail preview.
- The rail preview is honest: it has an execution mode, settlement asset, recipient, and amount, but no transaction hash and no live payment execution.

## Rail preview modes

| Rail | Meaning |
|---|---|
| `mock_x402_service` | Preview for an x402-compatible paid API request. |
| `mock_gateway_nanopayment` | Preview for a Circle Gateway-style nanopayment. |
| `arc_settlement_preview` | Preview for future Arc-compatible USDC settlement. |
| `mock_agent_wallet` | Local agent-wallet style preview/fallback. |

Unknown future rail strings resolve to `executionMode: "live_disabled"` instead of pretending that payment execution exists.

## Demo scenario

The main preset follows a research-agent workflow:

1. The agent needs paid evidence before publishing a thesis.
2. It selects relevant paid API/data/service sources.
3. Each source maps to a Guard-compatible payment intent.
4. Guard evaluates the intents:
   - trusted x402 verification API: `ALLOW`;
   - premium evidence bundle: `REVIEW`;
   - untrusted scrape cache: `BLOCK`;
   - telemetry attestation note: `REVIEW`.
5. The UI shows proposed spend, allowed spend, matched rules, audit IDs, and rail previews.

## Boundaries

This repo does not include:

- live Circle Gateway calls;
- live Arc integration;
- real x402 buyer/seller flow;
- wallet connection;
- private key handling;
- transaction signing;
- transaction hashes;
- custody;
- smart contracts;
- autonomous background spending.

## Reference-only context

The prior CitePay/Lepton flow remains useful as an upstream example: a research agent needs paid evidence and creates payment intents.

That context is narrative only. This implementation does not import trading logic, Mantle-specific schemas, DEX importers, wallets, event stores, or any runtime from the secondary repo.
