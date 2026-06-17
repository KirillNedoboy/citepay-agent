import { describe, expect, test } from "vitest";
import { evaluatePolicy } from "@/domain/policy/engine";
import { loadPolicyConfig } from "@/domain/policy/policy-config";
import {
  citePayDemoPreset,
  citePayMockSources,
  mapSourceToPaymentIntent,
  selectCitePaySources
} from "@/domain/citepay/source-selection";
import { addDecimalStrings } from "@/lib/decimal";

const policy = loadPolicyConfig("data/policies.default.json");

describe("CitePay source selection", () => {
  test("selects paid sources by deterministic query relevance", () => {
    const result = selectCitePaySources({
      agentId: "agent_citepay_demo_001",
      query: "Need weather and climate risk data for an insurance answer",
      budget: "0.25",
      sources: citePayMockSources
    });

    expect(result.selected.map((item) => item.source.id)).toEqual([
      "weather-risk-brief",
      "climate-claims-dataset"
    ]);
    expect(result.skipped.find((item) => item.source.id === "market-data-note")?.reason).toBe("not_relevant");
  });

  test("skips relevant sources that exceed the decimal-string budget cap", () => {
    const result = selectCitePaySources({
      agentId: "agent_citepay_demo_001",
      query: "Need weather and climate risk data for an insurance answer",
      budget: "0.10",
      sources: citePayMockSources
    });

    expect(result.selected.map((item) => item.source.id)).toEqual(["weather-risk-brief"]);
    expect(result.totalProposedSpend).toBe("0.08");
    expect(result.skipped.find((item) => item.source.id === "climate-claims-dataset")?.reason).toBe("budget_cap");
  });

  test("maps selected sources to existing Guard-compatible payment intents", () => {
    const source = citePayMockSources.find((item) => item.id === "weather-risk-brief");
    expect(source).toBeDefined();

    const intent = mapSourceToPaymentIntent({
      agentId: "agent_citepay_demo_001",
      query: "Need weather risk data",
      source: source!,
      selectionRank: 1
    });

    expect(intent).toEqual({
      agentId: "agent_citepay_demo_001",
      intent: "Pay 0.08 USDC to cite Weather Desk for Weather risk brief in a CitePay answer about: Need weather risk data",
      amount: "0.08",
      currency: "USDC",
      recipient: "weather-api.demo",
      scenario: "data_access",
      paymentRail: "future_x402_gateway_citation_payment",
      idempotencyKey: "citepay-agent_citepay_demo_001-weather-risk-brief-1"
    });
  });

  test("preserves REVIEW and BLOCK decisions from the existing Guard policy", () => {
    const reviewSource = citePayMockSources.find((item) => item.id === "telemetry-attestation-note");
    const blockedSource = citePayMockSources.find((item) => item.id === "blocked-scrape-cache");
    expect(reviewSource).toBeDefined();
    expect(blockedSource).toBeDefined();

    const reviewIntent = mapSourceToPaymentIntent({
      agentId: "agent_citepay_demo_001",
      query: "Need telemetry attestation",
      source: reviewSource!,
      selectionRank: 1
    });
    const blockedIntent = mapSourceToPaymentIntent({
      agentId: "agent_citepay_demo_001",
      query: "Need private scrape cache",
      source: blockedSource!,
      selectionRank: 2
    });

    expect(evaluatePolicy(reviewIntent, policy, []).decision).toBe("REVIEW");
    expect(evaluatePolicy(blockedIntent, policy, []).decision).toBe("BLOCK");
  });

  test("demo preset selects paid sources with visible Guard outcomes and skipped sources", () => {
    const result = selectCitePaySources({
      agentId: citePayDemoPreset.agentId,
      query: citePayDemoPreset.query,
      budget: citePayDemoPreset.budget,
      sources: citePayMockSources
    });

    expect(citePayDemoPreset.query).toBe(
      "Need weather risk, climate claims, telemetry attestation, and private scrape cache context for an insurance answer"
    );
    expect(citePayDemoPreset.budget).toBe("0.24");
    expect(result.totalProposedSpend).toBe("0.24");
    expect(result.selected.map((item) => item.source.id)).toEqual([
      "weather-risk-brief",
      "climate-claims-dataset",
      "blocked-scrape-cache",
      "telemetry-attestation-note"
    ]);
    expect(result.skipped.find((item) => item.source.id === "market-data-note")?.reason).toBe("not_relevant");

    const evaluated = result.selected.map((item) => ({
      sourceId: item.source.id,
      decision: evaluatePolicy(item.paymentIntent, policy, []).decision,
      amount: item.source.price
    }));

    expect(evaluated.map((item) => [item.sourceId, item.decision])).toEqual([
      ["weather-risk-brief", "ALLOW"],
      ["climate-claims-dataset", "REVIEW"],
      ["blocked-scrape-cache", "BLOCK"],
      ["telemetry-attestation-note", "REVIEW"]
    ]);
    expect(addDecimalStrings(evaluated.filter((item) => item.decision === "ALLOW").map((item) => item.amount))).toBe("0.08");
  });
});
