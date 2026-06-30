# CHECKPOINT.md

## Project direction

AgentPay Guard is a local preflight policy and audit layer for AI-agent USDC payment intents before x402, Circle Gateway, or Arc-compatible payment flows.

Current direction: Ignyte / Circle / Arc builder proof. The app demonstrates deterministic `ALLOW`, `REVIEW`, and `BLOCK` decisions, append-only JSONL audit evidence, and preview-only rail metadata.

## Branch and commit

- Branch at checkpoint creation: `feature/ignyte-circle-arc-preview`
- Baseline commit before this follow-up: `3246f69 feat: adapt AgentPay Guard for Circle Arc challenge`

## Implementation status

- Circle / Arc rail preview is implemented as local mock/preview metadata.
- Policy responses include stable `reasonCodes`.
- Demo UI shows decisions, reason codes, matched rules, rail preview rows, and a structured audit JSON preview.
- Audit records preserve the existing shape and add TZ-relevant top-level fields: `intentId`, `recipientLabel`, `amountUSDC`, `purpose`, and `rail`.
- Demo scenarios cover `ALLOW`, `REVIEW`, and `BLOCK`.

## Validation status

Fresh validation for this checkpoint:

```bash
pnpm test       # passed, 6 files, 40 tests
pnpm lint       # passed
pnpm typecheck  # passed
pnpm build      # passed
pnpm typecheck  # passed again after restoring generated next-env.d.ts drift
```

## Safety boundaries

Do not add without explicit approval:

- live Circle Gateway calls;
- live Arc integration;
- live x402 buyer/seller execution;
- wallet custody, private keys, seed phrases, or signing;
- swaps, trading, order execution, or transaction hashes;
- cron/background autonomous spend;
- DB/auth/smart contracts;
- official Circle, Arc, Ignyte, or x402 integration claims.

## Changed areas

- `src/app/demo-client.tsx`
- `src/app/demo-metrics.ts`
- `src/app/globals.css`
- `src/domain/audit/*`
- `src/domain/payment-intent/rail-preview.ts`
- `tests/audit-log.test.ts`
- `tests/demo-metrics.test.ts`
- `CHECKPOINT.md`
- `docs/audit-log-schema.md`
- `docs/citepay-demo-script.md`

## Preview/mock only

- `railPreview`
- `executionMode: "mock_preview"` and `live_disabled`
- x402 / Circle Gateway / Arc labels in UI and audit records
- local demo source selection and policy outcomes

These fields are evidence for a guarded preflight layer. They are not payment execution evidence.

## Next recommended step

After this focused follow-up commit, review the committed diff and prepare the PR or submission package without expanding into live payment execution.
