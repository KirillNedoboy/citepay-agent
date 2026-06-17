# CitePay Agent - Lepton Submission Draft

## 1. Project Name

CitePay Agent

## 2. One-Liner

CitePay Agent is a local paid-source demo where an AI agent selects premium source cards, turns them into payment intents, and runs each intent through AgentPay Guard before any payment rail is used.

## 3. Problem

AI agents can cite or depend on premium creator-owned sources, but they should not move toward source payments blindly. Builders need a deterministic preflight layer that can check recipient, amount, scenario, and risk before any paid citation flow proceeds.

## 4. Solution

CitePay Agent demonstrates a local paid-citation flow on top of AgentPay Guard:

- the agent starts from a deterministic preset query and budget;
- mock paid source cards are selected deterministically for relevance;
- each selected source becomes a normal Guard-compatible payment intent;
- AgentPay Guard returns `ALLOW`, `REVIEW`, or `BLOCK`;
- the local UI shows proposed spend, allowed spend, and recent audit records.

## 5. What Is Implemented Now

- a local Next.js demo with a built-in Lepton/CitePay preset;
- mock paid creator/source cards for weather risk, climate claims, telemetry attestation, and a blocked scrape cache example;
- deterministic source selection from the preset query;
- mapping from selected sources into the existing `POST /api/payment-intents/evaluate` API;
- Guard decisions across `ALLOW`, `REVIEW`, and `BLOCK`;
- append-only JSONL audit logging with idempotency;
- screenshot-backed proof of the preset-loaded view, Guard decisions, and spend summary.

## 6. What Is Explicitly Not Implemented Yet

- real payment settlement;
- wallet signing;
- live Circle Gateway / x402 / Arc integration;
- custody or private key handling;
- DB / auth;
- smart contracts;
- creator payouts;
- production fraud, AML, or compliance claims.

## 7. How It Uses AgentPay Guard

AgentPay Guard remains the policy and audit foundation. CitePay Agent does not replace the Guard API or decision engine. It produces normal payment intents for selected sources, submits them to `POST /api/payment-intents/evaluate`, and uses the Guard response plus audit record as the control point before any future payment rail would exist.

## 8. Intended Lepton/RFB Fit

The intended fit is a hackathon proof for agentic retrieval, premium source access, and citation-aware workflows. The branch shows a concrete agent use case: an answer pipeline that wants paid or premium sources, but needs deterministic policy and audit checks before any payment path is considered. The Lepton/RFB angle is the agent workflow and source-selection layer, not live payments.

## 9. Demo Steps

1. Run `pnpm dev` and open `http://localhost:3000`.
2. Scroll to `CitePay Agent local flow`.
3. Confirm the built-in preset query:
   `Need weather risk, climate claims, telemetry attestation, and private scrape cache context for an insurance answer`
4. Confirm the preset budget: `0.24 USDC`.
5. Click `Load preset` if needed.
6. Click `Select paid sources and evaluate Guard`.
7. Show the selected source cards, skipped source, Guard outcomes, proposed spend, allowed spend, and recent audit log entries.

## 10. Demo Video Outline Under 3 Minutes

0:00-0:20
- Introduce CitePay Agent as a local paid-source demo built on AgentPay Guard.
- State the constraint up front: no real payments, no wallet signing, no live Circle/x402/Arc integration.

0:20-0:50
- Show the preset query and `0.24 USDC` budget.
- Point to the mock source catalog and explain that selection is deterministic.

0:50-1:40
- Trigger `Select paid sources and evaluate Guard`.
- Show `Weather risk brief` -> `ALLOW`.
- Show `Climate claims dataset` -> `REVIEW`.
- Show `Blocked scrape cache` -> `BLOCK`.
- Show `Telemetry attestation note` -> `REVIEW`.

1:40-2:10
- Show the skipped `Market data note` as `not_relevant`.
- Show proposed spend `0.24 USDC` versus allowed spend `0.08 USDC`.

2:10-2:40
- Explain that each selected source became a normal Guard payment intent and produced or reused an audit record.

2:40-3:00
- Close with the project boundary: this is a deterministic local proof-pack for agent source-selection plus Guard evaluation, not a live payment product.

## 11. Risk / Limitation Disclosure

This branch is a local deterministic demo only. It does not settle funds, sign wallets, call live payment rails, or claim production fraud/compliance coverage. Recipient decisions are driven by the current local Guard policy config, and the audit log is a local JSONL file suitable for MVP proof purposes rather than distributed production infrastructure.
