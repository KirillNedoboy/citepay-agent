import type { CircleRailPreview, Decision } from "@/domain/payment-intent/types";

export type AuditRecord = {
  eventType: "agent_payment_guard_evaluated";
  auditId: string;
  timestamp: string;
  idempotencyKey: string;
  agentId: string;
  intent: string;
  amount: string;
  currency: string;
  recipient: string;
  scenario: string;
  paymentRail: string;
  decision: Decision;
  riskScore: number;
  policyId: string;
  matchedRules: string[];
  reasonCodes: string[];
  reason: string;
  executionMode: CircleRailPreview["executionMode"];
  railPreview: CircleRailPreview;
};
