# Product

## Register

product

## Users

Builder, reviewer, and operator users who need to inspect an AI-agent payment intent before any stablecoin payment rail is used. They are evaluating whether the request is trusted, within policy, auditable, and safe to pass toward a future x402, Circle Gateway, or Arc-compatible flow.

## Product Purpose

AgentPay Guard is a deterministic preflight policy and audit layer for autonomous AI-agent payments. It validates a payment intent, applies explicit rules, returns `ALLOW`, `REVIEW`, or `BLOCK`, and records the decision in append-only JSONL audit evidence without moving funds or signing transactions.

## Brand Personality

Clear, controlled, evidence-first. The interface should feel like a compact operational console: direct, legible, and trustworthy under review.

## Anti-references

Do not make it look like a generic payment button, wallet app, trading console, compliance suite, or promotional landing page. Avoid overclaiming live Circle, Arc, x402, custody, signing, AML/KYC, fraud prevention, partnerships, grants, traction, or production readiness.

## Design Principles

- Show the decision path before showing any payment rail preview.
- Keep policy, rail, and audit evidence visible without decorative distraction.
- Make the local/mock boundary obvious wherever payment execution could be inferred.
- Use familiar dashboard controls and dense but readable evidence panels.
- Prefer deterministic labels and machine-readable proof over marketing copy.

## Accessibility & Inclusion

Target WCAG AA contrast, keyboard-usable controls, readable compact text, and no motion that hides content or blocks task flow. The product should remain usable for reviewers scanning tables, code-like IDs, and risk states.
