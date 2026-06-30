# Audit Log Schema

Audit log file:

```txt
data/audit-log.jsonl
```

Each line is a complete JSON object. The file is append-only, except that a repeated `idempotencyKey` returns the existing record instead of appending a duplicate line.

## Example

```json
{
  "eventType": "agent_payment_guard_evaluated",
  "auditId": "audit_20260629_000001",
  "timestamp": "2026-06-29T12:00:00.000Z",
  "idempotencyKey": "ignyte-allow-x402",
  "agentId": "agent_ignyte_demo_001",
  "intent": "Buy premium verification data for a research task",
  "amount": "0.08",
  "currency": "USDC",
  "recipient": "trusted-x402-api.demo",
  "scenario": "api_access",
  "paymentRail": "mock_x402_service",
  "decision": "ALLOW",
  "riskScore": 10,
  "policyId": "default-agentpay-policy-v1",
  "matchedRules": [
    "recipient_allowlisted",
    "scenario_allowed",
    "amount_below_per_payment_limit"
  ],
  "reasonCodes": [
    "RAIL_PREVIEW_ONLY",
    "RECIPIENT_TRUSTED",
    "PURPOSE_ALLOWED",
    "AMOUNT_WITHIN_LIMIT"
  ],
  "reason": "Recipient is allowlisted, amount is below limits, and scenario is allowed.",
  "executionMode": "mock_preview",
  "railPreview": {
    "rail": "mock_x402_service",
    "networkLabel": "x402-compatible paid API",
    "settlementAsset": "USDC",
    "executionMode": "mock_preview",
    "recipientId": "trusted-x402-api.demo",
    "amountUSDC": "0.08",
    "explanation": "Preview only. AgentPay Guard has not moved funds, signed a transaction, or called a live payment rail."
  }
}
```

## Required fields

- `eventType`
- `auditId`
- `timestamp`
- `idempotencyKey`
- `agentId`
- `intent`
- `amount`
- `currency`
- `recipient`
- `scenario`
- `paymentRail`
- `decision`
- `riskScore`
- `policyId`
- `matchedRules`
- `reasonCodes`
- `reason`
- `executionMode`
- `railPreview`

## Rules

- JSONL, not a JSON array.
- One line per unique `idempotencyKey`.
- No secrets.
- No private keys.
- No auth tokens.
- No signatures.
- No fake transaction hashes.
- No live payment execution evidence is written by this MVP.
