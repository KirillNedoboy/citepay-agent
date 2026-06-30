import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { createOrReuseAuditRecord, readRecentAuditRecords } from "@/domain/audit/audit-log";
import { evaluatePolicy } from "@/domain/policy/engine";
import { loadPolicyConfig } from "@/domain/policy/policy-config";
import { validatePaymentIntent } from "@/domain/payment-intent/validation";

const tempDirs: string[] = [];
const policy = loadPolicyConfig(join(process.cwd(), "data", "policies.default.json"));

function makeTempAuditPath() {
  const dir = mkdtempSync(join(tmpdir(), "agentpay-audit-"));
  tempDirs.push(dir);
  return join(dir, "audit-log.jsonl");
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("audit log", () => {
  test("reuses an existing audit record for the same idempotency key", async () => {
    const auditPath = makeTempAuditPath();
    const intent = validatePaymentIntent({
      agentId: "agent_market_data_001",
      intent: "Pay $0.005 USDC for market data API access",
      amount: "0.005",
      currency: "USDC",
      recipient: "market-data-api.demo",
      scenario: "api_access",
      paymentRail: "x402_gateway_nanopayment",
      idempotencyKey: "same-key"
    });
    const decision = evaluatePolicy(intent, policy, []);

    const first = await createOrReuseAuditRecord(auditPath, intent, decision);
    const second = await createOrReuseAuditRecord(auditPath, intent, decision);
    const lines = readFileSync(auditPath, "utf8").trim().split("\n");

    expect(second.auditId).toBe(first.auditId);
    expect(lines).toHaveLength(1);
  });

  test("writes valid JSONL audit records with required fields", async () => {
    const auditPath = makeTempAuditPath();
    const intent = validatePaymentIntent({
      agentId: "device_telemetry_042",
      intent: "Device wants to pay $0.001 USDC for telemetry attestation",
      amount: "0.001",
      currency: "USDC",
      recipient: "telemetry-attestation.demo",
      scenario: "machine_to_machine",
      paymentRail: "x402_gateway_nanopayment",
      idempotencyKey: "jsonl-required-fields"
    });
    const decision = evaluatePolicy(intent, policy, []);

    await createOrReuseAuditRecord(auditPath, intent, decision);

    const records = readRecentAuditRecords(auditPath, 10);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      eventType: "agent_payment_guard_evaluated",
      idempotencyKey: "jsonl-required-fields",
      agentId: "device_telemetry_042",
      amount: "0.001",
      currency: "USDC",
      decision: "REVIEW",
      policyId: "default-agentpay-policy-v1",
      executionMode: "mock_preview",
      railPreview: {
        settlementAsset: "USDC",
        executionMode: "mock_preview",
        recipientId: "telemetry-attestation.demo",
        amountUSDC: "0.001"
      }
    });
    expect(records[0].reasonCodes).toContain("RAIL_PREVIEW_ONLY");
    expect(JSON.stringify(records[0])).not.toMatch(/transactionHash|txHash|signature|privateKey|seedPhrase/i);
    expect(records[0].auditId).toMatch(/^audit_/);
    expect(Date.parse(records[0].timestamp)).not.toBeNaN();
  });
});
