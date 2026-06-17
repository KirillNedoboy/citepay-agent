# Lepton CitePay Brief

## Product Direction

CitePay Agent is the Lepton Agents Hackathon direction for the existing AgentPay Guard project.

The product pivots the demo from a standalone preflight policy proof into an AI paid-citation flow. An agent selects paid creator or source content for an answer, turns each selected source into a payment intent, and sends that intent through AgentPay Guard before any payment rail is used.

AgentPay Guard remains the policy and audit layer. CitePay Agent adds the agent-side content selection use case around it.

## Core Thesis

AI agents that cite creator-owned, expert, or premium source material need a clear payment preflight step before paid source access or attribution payments can happen.

CitePay Agent demonstrates that layer:

1. An agent reviews mock paid creator/source cards.
2. The agent selects the sources it wants to cite or use.
3. Each selected source becomes a payment intent.
4. AgentPay Guard evaluates the intent as `ALLOW`, `REVIEW`, or `BLOCK`.
5. The audit log records the decision.
6. Future work may route allowed payments through x402 / Circle Gateway / Arc-compatible flows.

The first Lepton phase is a local product proof, not a live payment integration.

## How CitePay Uses AgentPay Guard

CitePay does not replace the existing Guard API.

It should produce the same payment intent shape already accepted by:

```http
POST /api/payment-intents/evaluate
```

Mock creator/source cards should map to fields like:

- `agentId`: the agent selecting paid sources.
- `intent`: a readable payment purpose, such as paying to cite a premium research note.
- `amount`: a decimal string price for the source.
- `currency`: `USDC` for the MVP.
- `recipient`: the creator or source identifier.
- `scenario`: a policy scenario such as `data_access` or a future explicitly documented citation scenario.
- `paymentRail`: a placeholder describing the intended future rail.
- `idempotencyKey`: a deterministic key for the selected source and agent action.

The Guard remains responsible for policy decisions, risk score, matched rules, and audit logging.

## Current MVP Boundary

CitePay Agent may show how paid citation selection would work before payment execution.

It must not:

- move real funds;
- sign wallet transactions;
- custody assets;
- store private keys, seed phrases, tokens, or signatures;
- call live Circle Gateway APIs;
- execute real x402 buyer or seller payments;
- add database or auth;
- deploy smart contracts;
- claim official Circle, Arc, x402, Lepton, grant, user, revenue, or traction status.

## Lepton Hackathon Narrative

CitePay Agent is a paid-source selection and payment-intent guard demo for agentic applications.

The Lepton-facing story is:

> Agents need to choose and pay for credible sources. CitePay Agent shows how those paid citation intents can be evaluated and audited before any payment rail is used.

This keeps the project grounded in the existing AgentPay Guard proof while making the user-facing demo more specific to AI agents and paid creator/source content.

## Next Safe Implementation Phase

Add mock creator source cards and an agent-side paid source selection flow that produces payment intents for the existing Guard API.

This phase should stay local and deterministic. It should reuse the current API, current policy engine, and current JSONL audit behavior.

