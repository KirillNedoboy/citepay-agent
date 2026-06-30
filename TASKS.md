# TASKS.md - Build Plan

## Existing MVP foundation

- [x] TypeScript / Next.js local app.
- [x] Deterministic policy engine.
- [x] `ALLOW` / `REVIEW` / `BLOCK` decisions.
- [x] Decimal-string amount handling.
- [x] JSONL audit log with idempotency.
- [x] Guard evaluation API.
- [x] Audit log API.
- [x] Local demo UI.
- [x] Baseline scenario fixtures.

## Ignyte / Circle / Arc implementation slice

- [x] Add additive `CircleRail`, `PaymentPurpose`, and `CircleRailPreview` types.
- [x] Add pure rail-preview adapter.
- [x] Map `mock_x402_service`, `mock_gateway_nanopayment`, and `arc_settlement_preview`.
- [x] Make unknown future rails `live_disabled`.
- [x] Add stable policy reason codes.
- [x] Add review threshold semantics.
- [x] Update demo sources and scenarios for trusted API, premium dataset, and untrusted source.
- [x] Add audit fields for event type, reason codes, execution mode, and rail preview.
- [x] Update README, architecture, audit schema, and demo script.
- [x] Add `docs/ignyte-circle-arc-brief.md`.
- [x] Show compact rail preview in the demo UI.
- [x] Run focused tests after UI change.
- [x] Run full validation: `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`.
- [x] Run final validation after tracker updates and commit if clean.

## Do not start without explicit approval

- [ ] Live Circle Gateway integration.
- [ ] Live Arc integration.
- [ ] Real x402 buyer/seller payment.
- [ ] Wallet signing.
- [ ] Custody/private key handling.
- [ ] Transaction hash generation.
- [ ] DB/auth.
- [ ] Smart contracts.
- [ ] Background/cron autonomous spend.
