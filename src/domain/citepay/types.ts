import type { PaymentIntent } from "@/domain/payment-intent/types";

export type CitePaySourceCard = {
  id: string;
  title: string;
  creatorName: string;
  recipient: string;
  description: string;
  price: string;
  currency: string;
  scenario: string;
  paymentRail: string;
  tags: string[];
};

export type CitePaySelectionInput = {
  agentId: string;
  query: string;
  budget: string;
  sources: CitePaySourceCard[];
};

export type CitePaySkippedReason = "not_relevant" | "budget_cap";

export type CitePaySelectedSource = {
  source: CitePaySourceCard;
  relevanceScore: number;
  paymentIntent: PaymentIntent;
};

export type CitePaySkippedSource = {
  source: CitePaySourceCard;
  relevanceScore: number;
  reason: CitePaySkippedReason;
};

export type CitePaySelectionResult = {
  selected: CitePaySelectedSource[];
  skipped: CitePaySkippedSource[];
  totalProposedSpend: string;
};

