import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { evaluatePolicy } from "@/domain/policy/engine";
import { loadPolicyConfig } from "@/domain/policy/policy-config";
import { validatePaymentIntent } from "@/domain/payment-intent/validation";
import type { AuditRecord } from "@/domain/audit/types";

const root = process.cwd();
const policy = loadPolicyConfig(join(root, "data", "policies.default.json"));

function loadScenario(fileName: string) {
  const raw = readFileSync(join(root, "examples", fileName), "utf8");
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  delete parsed.expectedDecision;
  const intent = parsed;
  return validatePaymentIntent(intent);
}

describe("policy engine", () => {
  test("allows trusted x402 API spend with stable AgentPay reason codes", () => {
    const intent = validatePaymentIntent({
      agentId: "agent_ignyte_demo_001",
      intent: "Buy premium verification data for a research task",
      amount: "0.08",
      currency: "USDC",
      recipient: "trusted-x402-api.demo",
      scenario: "api_access",
      paymentRail: "mock_x402_service",
      idempotencyKey: "ignyte-allow-x402"
    });

    const result = evaluatePolicy(intent, policy, []);

    expect(result.decision).toBe("ALLOW");
    expect(result.reasonCodes).toEqual(
      expect.arrayContaining(["RECIPIENT_TRUSTED", "PURPOSE_ALLOWED", "AMOUNT_WITHIN_LIMIT", "RAIL_PREVIEW_ONLY"])
    );
  });

  test("reviews premium dataset spend above the review threshold", () => {
    const intent = validatePaymentIntent({
      agentId: "agent_ignyte_demo_001",
      intent: "Buy high-value premium source bundle for an agent research task",
      amount: "0.25",
      currency: "USDC",
      recipient: "premium-evidence-bundle.demo",
      scenario: "data_access",
      paymentRail: "mock_gateway_nanopayment",
      idempotencyKey: "ignyte-review-premium-dataset"
    });

    const result = evaluatePolicy(intent, policy, []);

    expect(result.decision).toBe("REVIEW");
    expect(result.reasonCodes).toEqual(
      expect.arrayContaining(["RECIPIENT_REVIEW_REQUIRED", "PURPOSE_ALLOWED", "AMOUNT_EXCEEDS_REVIEW_THRESHOLD", "RAIL_PREVIEW_ONLY"])
    );
  });

  test("blocks untrusted source spend before any rail execution", () => {
    const intent = validatePaymentIntent({
      agentId: "agent_ignyte_demo_001",
      intent: "Buy scraped unverified data cache",
      amount: "0.04",
      currency: "USDC",
      recipient: "blocked-recipient.demo",
      scenario: "data_access",
      paymentRail: "arc_settlement_preview",
      idempotencyKey: "ignyte-block-untrusted-source"
    });

    const result = evaluatePolicy(intent, policy, []);

    expect(result.decision).toBe("BLOCK");
    expect(result.reasonCodes).toEqual(
      expect.arrayContaining(["RECIPIENT_BLOCKED", "PURPOSE_ALLOWED", "AMOUNT_WITHIN_LIMIT", "RAIL_PREVIEW_ONLY"])
    );
  });

  test("allows the API nanopayment scenario", () => {
    const result = evaluatePolicy(loadScenario("scenario-allow-api.json"), policy, []);

    expect(result.decision).toBe("ALLOW");
    expect(result.riskScore).toBeLessThan(30);
    expect(result.matchedRules).toContain("recipient_allowlisted");
    expect(result.matchedRules).toContain("scenario_allowed");
  });

  test("reviews the machine-to-machine scenario", () => {
    const result = evaluatePolicy(loadScenario("scenario-review-machine.json"), policy, []);

    expect(result.decision).toBe("REVIEW");
    expect(result.riskScore).toBeGreaterThanOrEqual(30);
    expect(result.matchedRules).toContain("recipient_requires_review");
  });

  test("blocks the risky autonomous spend scenario", () => {
    const result = evaluatePolicy(loadScenario("scenario-block-risky.json"), policy, []);

    expect(result.decision).toBe("BLOCK");
    expect(result.riskScore).toBeGreaterThanOrEqual(70);
    expect(result.matchedRules).toContain("recipient_denied");
    expect(result.matchedRules).toContain("scenario_allowed");
  });

  test("blocks invalid amount strings", () => {
    const intent = validatePaymentIntent({
      ...loadScenario("scenario-allow-api.json"),
      amount: "1.2.3",
      idempotencyKey: "invalid-amount-test"
    });

    const result = evaluatePolicy(intent, policy, []);

    expect(result.decision).toBe("BLOCK");
    expect(result.matchedRules).toContain("amount_invalid");
  });

  test("blocks unsupported currency", () => {
    const intent = validatePaymentIntent({
      ...loadScenario("scenario-allow-api.json"),
      currency: "ETH",
      idempotencyKey: "unsupported-currency-test"
    });

    const result = evaluatePolicy(intent, policy, []);

    expect(result.decision).toBe("BLOCK");
    expect(result.matchedRules).toContain("currency_unsupported");
  });

  test.each([
    ["0", "amount_invalid"],
    ["-1", "amount_invalid"],
    ["1.2.3", "amount_invalid"],
    ["999999999999999999999999999999.999999", "amount_above_hard_max"]
  ])("blocks invalid or unsafe amount edge case %s", (amount, expectedRule) => {
    const intent = validatePaymentIntent({
      ...loadScenario("scenario-allow-api.json"),
      amount,
      idempotencyKey: `amount-edge-${amount}`
    });

    const result = evaluatePolicy(intent, policy, []);

    expect(result.decision).toBe("BLOCK");
    expect(result.matchedRules).toContain(expectedRule);
  });

  test("allows tiny positive decimal amounts without floating-point math", () => {
    const intent = validatePaymentIntent({
      ...loadScenario("scenario-allow-api.json"),
      amount: "0.000001",
      idempotencyKey: "tiny-positive-decimal"
    });

    const result = evaluatePolicy(intent, policy, []);

    expect(result.decision).toBe("ALLOW");
    expect(result.matchedRules).toContain("amount_below_per_payment_limit");
  });

  test("blocks denylisted recipients", () => {
    const intent = validatePaymentIntent({
      ...loadScenario("scenario-allow-api.json"),
      recipient: "blocked-recipient.demo",
      idempotencyKey: "denylisted-recipient"
    });

    const result = evaluatePolicy(intent, policy, []);

    expect(result.decision).toBe("BLOCK");
    expect(result.matchedRules).toContain("recipient_denied");
  });

  test("reviews unknown recipients", () => {
    const intent = validatePaymentIntent({
      ...loadScenario("scenario-allow-api.json"),
      recipient: "new-api.demo",
      idempotencyKey: "unknown-recipient"
    });

    const result = evaluatePolicy(intent, policy, []);

    expect(result.decision).toBe("REVIEW");
    expect(result.matchedRules).toContain("recipient_unknown");
  });

  test("reviews unknown scenarios", () => {
    const intent = validatePaymentIntent({
      ...loadScenario("scenario-allow-api.json"),
      scenario: "new_scenario",
      idempotencyKey: "unknown-scenario"
    });

    const result = evaluatePolicy(intent, policy, []);

    expect(result.decision).toBe("REVIEW");
    expect(result.matchedRules).toContain("scenario_unknown");
  });

  test("suspicious keywords increase risk and require review", () => {
    const intent = validatePaymentIntent({
      ...loadScenario("scenario-allow-api.json"),
      intent: "Pay $0.005 USDC for unverified API access",
      idempotencyKey: "suspicious-keyword"
    });

    const result = evaluatePolicy(intent, policy, []);

    expect(result.decision).toBe("REVIEW");
    expect(result.riskScore).toBeGreaterThanOrEqual(policy.decisionThresholds.reviewAt);
    expect(result.matchedRules).toContain("suspicious_keyword_detected");
  });

  test("blocks when daily spend limit would be exceeded", () => {
    const intent = validatePaymentIntent({
      ...loadScenario("scenario-allow-api.json"),
      amount: "0.01",
      idempotencyKey: "daily-limit"
    });
    const existingAllowedSpend = makeAuditRecord({
      agentId: intent.agentId,
      amount: "25.00",
      decision: "ALLOW"
    });

    const result = evaluatePolicy(intent, policy, [existingAllowedSpend]);

    expect(result.decision).toBe("BLOCK");
    expect(result.matchedRules).toContain("daily_limit_exceeded");
  });

  test("reviews when velocity limit is exceeded", () => {
    const intent = validatePaymentIntent({
      ...loadScenario("scenario-allow-api.json"),
      idempotencyKey: "velocity-limit"
    });
    const recentAttempts = Array.from({ length: policy.velocity.maxAttemptsPerWindow }, (_, index) =>
      makeAuditRecord({
        auditId: `audit_velocity_${index}`,
        agentId: intent.agentId,
        idempotencyKey: `velocity-${index}`,
        timestamp: new Date().toISOString()
      })
    );

    const result = evaluatePolicy(intent, policy, recentAttempts);

    expect(result.decision).toBe("REVIEW");
    expect(result.matchedRules).toContain("velocity_limit_exceeded");
  });
});

function makeAuditRecord(overrides: Partial<AuditRecord> = {}): AuditRecord {
  return {
    eventType: "agent_payment_guard_evaluated",
    auditId: "audit_test_000001",
    timestamp: new Date().toISOString(),
    idempotencyKey: "audit-test",
    agentId: "agent_market_data_001",
    intent: "Pay $1 USDC for market data API access",
    amount: "1.00",
    currency: "USDC",
    recipient: "market-data-api.demo",
    scenario: "api_access",
    paymentRail: "x402_gateway_nanopayment",
    decision: "ALLOW",
    riskScore: 10,
    policyId: "default-agentpay-policy-v1",
    matchedRules: ["recipient_allowlisted"],
    reasonCodes: ["RECIPIENT_TRUSTED", "PURPOSE_ALLOWED", "AMOUNT_WITHIN_LIMIT", "RAIL_PREVIEW_ONLY"],
    reason: "test record",
    executionMode: "mock_preview",
    railPreview: {
      rail: "mock_x402_service",
      networkLabel: "x402-compatible paid API",
      settlementAsset: "USDC",
      executionMode: "mock_preview",
      recipientId: "market-data-api.demo",
      amountUSDC: "1.00",
      explanation: "Preview only. AgentPay Guard has not moved funds, signed a transaction, or called a live payment rail."
    },
    ...overrides
  };
}
