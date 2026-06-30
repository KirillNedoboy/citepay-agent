import { readFileSync } from "node:fs";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { buildCircleRailPreview } from "@/domain/payment-intent/rail-preview";
import type { PaymentIntent, PolicyDecision } from "@/domain/payment-intent/types";
import type { AuditRecord } from "./types";

const locks = new Map<string, Promise<unknown>>();

async function withAuditLock<T>(path: string, task: () => Promise<T>): Promise<T> {
  const previous = locks.get(path) ?? Promise.resolve();
  const current = previous.then(task, task);
  locks.set(path, current);

  try {
    return await current;
  } finally {
    if (locks.get(path) === current) {
      locks.delete(path);
    }
  }
}

async function readAuditFile(path: string): Promise<AuditRecord[]> {
  try {
    const content = await readFile(path, "utf8");
    return parseAuditLines(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function parseAuditLines(content: string): AuditRecord[] {
  return content
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as AuditRecord);
}

function makeAuditId(existingCount: number, timestamp: string): string {
  const date = timestamp.slice(0, 10).replaceAll("-", "");
  return `audit_${date}_${String(existingCount + 1).padStart(6, "0")}`;
}

export async function createOrReuseAuditRecord(
  auditPath: string,
  intent: PaymentIntent,
  decision: PolicyDecision
): Promise<AuditRecord> {
  return withAuditLock(auditPath, async () => {
    await mkdir(dirname(auditPath), { recursive: true });
    const records = await readAuditFile(auditPath);
    const existing = records.find((record) => record.idempotencyKey === intent.idempotencyKey);

    if (existing) {
      return existing;
    }

    const timestamp = new Date().toISOString();
    const railPreview = buildCircleRailPreview(intent);
    const record: AuditRecord = {
      eventType: "agent_payment_guard_evaluated",
      auditId: makeAuditId(records.length, timestamp),
      timestamp,
      idempotencyKey: intent.idempotencyKey,
      agentId: intent.agentId,
      intent: intent.intent,
      amount: intent.amount,
      currency: intent.currency,
      recipient: intent.recipient,
      scenario: intent.scenario,
      paymentRail: intent.paymentRail,
      decision: decision.decision,
      riskScore: decision.riskScore,
      policyId: decision.policyId,
      matchedRules: decision.matchedRules,
      reasonCodes: decision.reasonCodes,
      reason: decision.reason,
      executionMode: railPreview.executionMode,
      railPreview
    };

    await appendFile(auditPath, `${JSON.stringify(record)}\n`, "utf8");
    return record;
  });
}

export function readRecentAuditRecords(auditPath: string, limit: number): AuditRecord[] {
  try {
    const content = readFileSync(auditPath, "utf8");
    return parseAuditLines(content).slice(-limit).reverse();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}
