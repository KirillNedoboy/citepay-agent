import { describe, expect, test } from "vitest";
import { buildCircleRailPreview } from "@/domain/payment-intent/rail-preview";
import type { PaymentIntent } from "@/domain/payment-intent/types";

function makeIntent(overrides: Partial<PaymentIntent> = {}): PaymentIntent {
  return {
    agentId: "agent_ignyte_demo_001",
    intent: "Buy premium verification data for a research task",
    amount: "0.08",
    currency: "USDC",
    recipient: "trusted-x402-api.demo",
    scenario: "api_access",
    paymentRail: "mock_x402_service",
    idempotencyKey: "rail-preview-test",
    ...overrides
  };
}

describe("Circle and Arc rail preview", () => {
  test("generates a mock x402 paid API preview without execution data", () => {
    const preview = buildCircleRailPreview(makeIntent());

    expect(preview).toEqual({
      rail: "mock_x402_service",
      networkLabel: "x402-compatible paid API",
      settlementAsset: "USDC",
      executionMode: "mock_preview",
      recipientId: "trusted-x402-api.demo",
      amountUSDC: "0.08",
      explanation: "Preview only. AgentPay Guard has not moved funds, signed a transaction, or called a live payment rail."
    });
    expect(Object.keys(preview)).not.toEqual(expect.arrayContaining(["transactionHash", "txHash", "signature", "privateKey"]));
  });

  test("generates an Arc settlement preview with USDC as the settlement asset", () => {
    const preview = buildCircleRailPreview(
      makeIntent({
        amount: "0.25",
        paymentRail: "arc_settlement_preview",
        recipient: "premium-evidence-bundle.demo"
      })
    );

    expect(preview.rail).toBe("arc_settlement_preview");
    expect(preview.networkLabel).toBe("Arc settlement preview");
    expect(preview.settlementAsset).toBe("USDC");
    expect(preview.executionMode).toBe("mock_preview");
    expect(preview.amountUSDC).toBe("0.25");
  });

  test("keeps unknown rails live-disabled instead of pretending to execute", () => {
    const preview = buildCircleRailPreview(makeIntent({ paymentRail: "future_live_circle_api" }));

    expect(preview.rail).toBe("mock_agent_wallet");
    expect(preview.networkLabel).toBe("Circle Agent Wallet preview");
    expect(preview.executionMode).toBe("live_disabled");
    expect(preview.explanation).toContain("Live payment rail is disabled");
  });
});
