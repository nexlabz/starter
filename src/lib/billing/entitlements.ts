import { and, eq, inArray, isNull } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "@/db/schema";
import { FREE_PLAN, getPlan, type Plan } from "./catalog";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDb = PgDatabase<PgQueryResultHKT, any> | NodePgDatabase<typeof schema>;

/** Subscription states that grant access. `past_due` is intentionally NOT entitled; change here if you want a grace period. */
export const ENTITLED_STATUSES = ["active", "trialing"] as const;

export type Entitlement = { plan: Plan; source: "free" | "subscription" | "purchase" };

/**
 * Plan an organization is entitled to right now. Highest-rank plan among
 * active subscriptions and non-refunded one-time purchases, else Free.
 * Always scoped by orgId; callers must have verified the user belongs to that org.
 */
export async function getEntitlement(db: AnyDb, orgId: string): Promise<Entitlement> {
  const d = db as NodePgDatabase<typeof schema>;
  const [subs, buys] = await Promise.all([
    d
      .select({ planKey: schema.subscription.planKey })
      .from(schema.subscription)
      .where(and(eq(schema.subscription.orgId, orgId), inArray(schema.subscription.status, [...ENTITLED_STATUSES]))),
    d
      .select({ planKey: schema.purchase.planKey })
      .from(schema.purchase)
      .where(and(eq(schema.purchase.orgId, orgId), isNull(schema.purchase.refundedAt))),
  ]);

  let best: Entitlement = { plan: FREE_PLAN, source: "free" };
  for (const [rows, source] of [
    [subs, "subscription"],
    [buys, "purchase"],
  ] as const) {
    for (const row of rows) {
      const plan = getPlan(row.planKey);
      if (plan && plan.rank > best.plan.rank) best = { plan, source };
    }
  }
  return best;
}
