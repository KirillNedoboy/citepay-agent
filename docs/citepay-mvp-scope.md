# CitePay MVP Scope

## Objective

Document the implemented local demo layer on top of AgentPay Guard: mock paid creator/source cards that an agent can select, producing payment intents for the existing Guard API.

This is a product-scope extension, not a payment integration.

## Implemented Local Slice

The first CitePay MVP code slice is implemented as a deterministic local flow:

- mock source cards live in `src/domain/citepay/source-selection.ts`;
- strong source-selection types live in `src/domain/citepay/types.ts`;
- unit tests live in `tests/citepay-selection.test.ts`;
- the local UI shows source selection and Guard evaluation results through the existing API route.
- the local UI includes a deterministic Lepton/CitePay demo preset query and budget.

The implementation does not add real payments, wallets, live integrations, database/auth, smart contracts, secrets, or external services.

## In Scope For The Implemented Local Slice

- Mock creator/source cards with title, creator/source id, short description, price, currency, intended citation/use case, and trust/risk hints.
- An agent-side selection flow where a user can evaluate generated payment intents from the local source catalog.
- Reuse of `POST /api/payment-intents/evaluate` without changing real payment behavior.
- Guard output for each selected source: decision, risk score, reason, matched rules, audit id, and recent audit entries.
- Decimal-string source prices only.
- The audit log remains at `data/audit-log.jsonl`.
- The MVP remains local with no external service calls.

## Out Of Scope For This Phase

- Real payment execution.
- Live creator payouts.
- Real source licensing enforcement.
- Production content marketplace behavior.
- User accounts, creator dashboards, admin dashboards, or billing settings.
- New payment rails or wallet flows.
- Policy editing UI.

## Do Not Start Yet

Do not start these without a separate explicit request:

- live Circle Gateway integration;
- real x402 buyer/seller payment;
- wallet signing;
- custody/private key handling;
- DB/auth;
- smart contracts.

## Payment Intent Mapping

Each selected mock source generates a normal AgentPay Guard payment intent shape like:

```json
{
  "agentId": "agent_citepay_demo_001",
  "intent": "Pay 0.05 USDC to cite premium source creator-lab.demo in an agent answer",
  "amount": "0.05",
  "currency": "USDC",
  "recipient": "creator-lab.demo",
  "scenario": "data_access",
  "paymentRail": "future_x402_gateway_citation_payment",
  "idempotencyKey": "citepay-demo-creator-lab-001"
}
```

The current policy may return `REVIEW` for unknown recipients. That is acceptable for the first CitePay implementation because it demonstrates why paid citation payments need preflight policy and audit.

## Acceptance Criteria

- Existing AgentPay Guard scenarios still work.
- Existing API contracts remain compatible.
- Selecting a mock source produces a complete payment intent.
- Evaluating that intent writes or reuses an audit record through the existing Guard path.
- UI copy does not imply real payments are executed.
- No secrets, private keys, wallets, database, auth, or smart contracts are added.

## Documentation Boundary

The current AgentPay Guard MVP boundary remains intact. README and related proof-pack docs now describe CitePay Agent as an additive local demo on top of the existing Guard foundation.

## Next Safe Step

Finalize the proof-pack consistency review and submission draft using the existing preset screenshots.
