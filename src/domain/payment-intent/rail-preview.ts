import type { CircleRail, CircleRailPreview, PaymentIntent, PaymentPurpose } from "./types";

const previewOnlyExplanation =
  "Preview only. AgentPay Guard has not moved funds, signed a transaction, or called a live payment rail.";

const railLabels: Record<CircleRail, string> = {
  mock_agent_wallet: "Circle Agent Wallet preview",
  mock_gateway_nanopayment: "Circle Gateway Nanopayment preview",
  mock_x402_service: "x402-compatible paid API",
  arc_settlement_preview: "Arc settlement preview"
};

function normalizeRail(paymentRail: string): CircleRail {
  if (paymentRail === "mock_x402_service" || paymentRail === "x402_gateway_nanopayment") {
    return "mock_x402_service";
  }
  if (paymentRail === "mock_gateway_nanopayment" || paymentRail === "future_x402_gateway_citation_payment") {
    return "mock_gateway_nanopayment";
  }
  if (paymentRail === "arc_settlement_preview") {
    return "arc_settlement_preview";
  }
  if (paymentRail === "mock_agent_wallet") {
    return "mock_agent_wallet";
  }
  return "mock_agent_wallet";
}

export function mapScenarioToPaymentPurpose(scenario: string): PaymentPurpose {
  if (scenario === "api_access") {
    return "api_data_purchase";
  }
  if (scenario === "data_access") {
    return "premium_research_source";
  }
  if (scenario === "machine_to_machine") {
    return "verification_or_attestation";
  }
  if (scenario === "compute_access") {
    return "agent_to_agent_service";
  }
  return "unknown";
}

export function buildCircleRailPreview(intent: PaymentIntent): CircleRailPreview {
  const rail = normalizeRail(intent.paymentRail);
  const isKnownPreviewRail =
    intent.paymentRail === "mock_x402_service" ||
    intent.paymentRail === "x402_gateway_nanopayment" ||
    intent.paymentRail === "mock_gateway_nanopayment" ||
    intent.paymentRail === "future_x402_gateway_citation_payment" ||
    intent.paymentRail === "arc_settlement_preview" ||
    intent.paymentRail === "mock_agent_wallet";

  return {
    rail,
    networkLabel: railLabels[rail],
    settlementAsset: "USDC",
    executionMode: isKnownPreviewRail ? "mock_preview" : "live_disabled",
    recipientId: intent.recipient,
    amountUSDC: intent.amount,
    explanation: isKnownPreviewRail
      ? previewOnlyExplanation
      : "Live payment rail is disabled. This response is an adapter boundary preview, not a production integration."
  };
}
