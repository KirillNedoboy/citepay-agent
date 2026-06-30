# Architecture

## MVP flow

```txt
Browser demo UI
  ->
POST /api/payment-intents/evaluate
  ->
Request validation
  ->
Policy config loader
  ->
Policy engine
  ->
Risk score + decision
  ->
Circle/Arc rail preview adapter
  ->
Audit JSONL append or idempotent reuse
  ->
Decision response
```

## Payment rail boundary

```txt
AI Agent / Machine Client
  ->
AgentPay Guard
  ->
ALLOW / REVIEW / BLOCK
  ->
mock x402 / Circle Gateway / Arc rail preview
```

The MVP stops at the decision and preview layer. It does not call live payment rails.

## Rail preview adapter

`src/domain/payment-intent/rail-preview.ts` maps a validated `PaymentIntent` to a typed `CircleRailPreview`.

The preview includes:

- rail label;
- settlement asset `USDC`;
- execution mode: `mock_preview` or `live_disabled`;
- recipient;
- amount;
- explanation of the no-execution boundary.

It intentionally does not include transaction hashes, signatures, private keys, network calls, or payment execution semantics.

## Main modules

```txt
src/domain/payment-intent
  types
  validation
  evaluate
  rail-preview

src/domain/policy
  policy-config
  engine

src/domain/audit
  types
  audit-log

src/domain/citepay
  source-selection
  types

src/lib
  decimal
  paths
```

## Persistence

MVP uses files:

- `data/policies.default.json`
- `data/audit-log.jsonl`

No DB is required for this slice.

## Failure posture

Internal error must not result in `ALLOW`.

Expected behavior:

- validation error -> structured 400 with `BLOCK`;
- policy/audit internal error -> non-ALLOW safe failure;
- unknown future rail -> `executionMode: "live_disabled"`;
- no hidden payment execution path.
