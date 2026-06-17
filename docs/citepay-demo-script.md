# CitePay Local Demo Script

## Goal

Show the deterministic Lepton/CitePay paid-citation flow in under 3 minutes without inventing a query.

## Local Run Command

```bash
pnpm dev
```

Open:

```txt
http://localhost:3000
```

## Demo Preset

Use the built-in `Lepton/CitePay demo preset`.

Exact query:

```txt
Need weather risk, climate claims, telemetry attestation, and private scrape cache context for an insurance answer
```

Exact budget:

```txt
0.24 USDC
```

## Click Path

1. Open the local app.
2. Scroll to `CitePay Agent local flow`.
3. Confirm the query and budget match the preset above.
4. If needed, click `Load preset`.
5. Click `Select paid sources and evaluate Guard`.
6. Review `Selected sources`, `Skipped sources`, `Proposed spend`, `Allowed spend`, and `Recent audit log`.

## What The Viewer Should See

Selected paid source cards:

- `Weather risk brief` from `Weather Desk`: Guard decision `ALLOW`.
- `Climate claims dataset` from `Creator Lab`: Guard decision `REVIEW` because the recipient is not allowlisted.
- `Blocked scrape cache` from `Blocked Source`: Guard decision `BLOCK` because the recipient is denylisted.
- `Telemetry attestation note` from `Telemetry Attestation`: Guard decision `REVIEW` because the recipient requires review.

Skipped source:

- `Market data note`: skipped as `not_relevant`.

Spend summary:

- Proposed spend: `0.24 USDC`.
- Allowed spend: `0.08 USDC`.

Audit behavior:

- Each selected source becomes a normal AgentPay Guard payment intent.
- Each selected source is evaluated through `POST /api/payment-intents/evaluate`.
- Each successful evaluation writes or reuses a JSONL audit record in `data/audit-log.jsonl`.
- Re-running the same preset should reuse deterministic idempotency keys instead of duplicating audit entries for those keys.

## Narration

Say:

> CitePay uses AgentPay Guard as the preflight layer before paid citations. The agent selects paid source cards locally, turns each selection into a payment intent, and Guard decides whether that intent is allowed, requires review, or must be blocked.

Then point to the selected source decisions:

> The same local preset shows the full policy range. A known weather source is allowed, unknown or review-required sources are held for review, and a denylisted source is blocked. The allowed spend only counts sources that Guard allowed.

Close with:

> This is a deterministic local demo. No real payment rail is called and no funds move.

## Intentionally Not Implemented Yet

- Real payments.
- Wallet signing.
- Live Circle Gateway calls.
- Live x402 buyer/seller flow.
- Live Arc integration.
- Creator payouts.
- Source licensing enforcement.
- Secrets or environment variables.
- Database, auth, or accounts.
- Smart contracts.
- External services.
