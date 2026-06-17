import type { PaymentIntent } from "@/domain/payment-intent/types";
import { addDecimalStrings, compareDecimalStrings } from "@/lib/decimal";
import type {
  CitePaySelectedSource,
  CitePaySelectionInput,
  CitePaySelectionResult,
  CitePaySkippedSource,
  CitePaySourceCard
} from "./types";

export const citePayMockSources: CitePaySourceCard[] = [
  {
    id: "weather-risk-brief",
    title: "Weather risk brief",
    creatorName: "Weather Desk",
    recipient: "weather-api.demo",
    description: "Premium weather risk source for climate, insurance, and regional hazard answers.",
    price: "0.08",
    currency: "USDC",
    scenario: "data_access",
    paymentRail: "future_x402_gateway_citation_payment",
    tags: ["weather", "risk", "climate", "insurance", "data"]
  },
  {
    id: "climate-claims-dataset",
    title: "Climate claims dataset",
    creatorName: "Creator Lab",
    recipient: "creator-lab.demo",
    description: "Creator-owned dataset for insurance claims and climate exposure analysis.",
    price: "0.09",
    currency: "USDC",
    scenario: "data_access",
    paymentRail: "future_x402_gateway_citation_payment",
    tags: ["climate", "claims", "insurance", "data"]
  },
  {
    id: "market-data-note",
    title: "Market data note",
    creatorName: "Market Data API",
    recipient: "market-data-api.demo",
    description: "Paid market data note for trading and pricing context.",
    price: "0.05",
    currency: "USDC",
    scenario: "data_access",
    paymentRail: "future_x402_gateway_citation_payment",
    tags: ["market", "pricing", "trading"]
  },
  {
    id: "telemetry-attestation-note",
    title: "Telemetry attestation note",
    creatorName: "Telemetry Attestation",
    recipient: "telemetry-attestation.demo",
    description: "Machine telemetry attestation source for device provenance answers.",
    price: "0.03",
    currency: "USDC",
    scenario: "machine_to_machine",
    paymentRail: "future_x402_gateway_citation_payment",
    tags: ["telemetry", "attestation", "device", "provenance"]
  },
  {
    id: "blocked-scrape-cache",
    title: "Blocked scrape cache",
    creatorName: "Blocked Source",
    recipient: "blocked-recipient.demo",
    description: "Denied source example for private scrape cache content.",
    price: "0.04",
    currency: "USDC",
    scenario: "data_access",
    paymentRail: "future_x402_gateway_citation_payment",
    tags: ["private", "scrape", "cache"]
  }
];

export const citePayDemoPreset = {
  label: "Lepton/CitePay demo preset",
  agentId: "agent_citepay_demo_001",
  query: "Need weather risk, climate claims, telemetry attestation, and private scrape cache context for an insurance answer",
  budget: "0.24"
} as const;

const tokenPattern = /[a-z0-9]+/g;

function tokenize(value: string): Set<string> {
  return new Set(value.toLowerCase().match(tokenPattern) ?? []);
}

function relevanceScore(queryTokens: Set<string>, source: CitePaySourceCard): number {
  return source.tags.reduce((score, tag) => score + (queryTokens.has(tag.toLowerCase()) ? 1 : 0), 0);
}

export function mapSourceToPaymentIntent(input: {
  agentId: string;
  query: string;
  source: CitePaySourceCard;
  selectionRank: number;
}): PaymentIntent {
  return {
    agentId: input.agentId,
    intent: `Pay ${input.source.price} ${input.source.currency} to cite ${input.source.creatorName} for ${input.source.title} in a CitePay answer about: ${input.query}`,
    amount: input.source.price,
    currency: input.source.currency,
    recipient: input.source.recipient,
    scenario: input.source.scenario,
    paymentRail: input.source.paymentRail,
    idempotencyKey: `citepay-${input.agentId}-${input.source.id}-${input.selectionRank}`
  };
}

export function selectCitePaySources(input: CitePaySelectionInput): CitePaySelectionResult {
  const queryTokens = tokenize(input.query);
  const scored = input.sources.map((source, index) => ({
    source,
    sourceIndex: index,
    relevanceScore: relevanceScore(queryTokens, source)
  }));
  const relevant = scored
    .filter((item) => item.relevanceScore > 0)
    .sort((left, right) => right.relevanceScore - left.relevanceScore || left.sourceIndex - right.sourceIndex);

  const selected: CitePaySelectedSource[] = [];
  const skipped: CitePaySkippedSource[] = scored
    .filter((item) => item.relevanceScore === 0)
    .map((item) => ({
      source: item.source,
      relevanceScore: item.relevanceScore,
      reason: "not_relevant"
    }));
  let totalProposedSpend = "0";

  for (const item of relevant) {
    const nextTotal = addDecimalStrings([totalProposedSpend, item.source.price]);
    if (nextTotal === null || compareDecimalStrings(nextTotal, input.budget) === 1) {
      skipped.push({
        source: item.source,
        relevanceScore: item.relevanceScore,
        reason: "budget_cap"
      });
      continue;
    }

    totalProposedSpend = nextTotal;
    selected.push({
      source: item.source,
      relevanceScore: item.relevanceScore,
      paymentIntent: mapSourceToPaymentIntent({
        agentId: input.agentId,
        query: input.query,
        source: item.source,
        selectionRank: selected.length + 1
      })
    });
  }

  return {
    selected,
    skipped,
    totalProposedSpend
  };
}
