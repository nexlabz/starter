import { and, count, eq, gt, inArray, isNull } from "drizzle-orm";
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

/** Seats in use: members plus invitations still open to be accepted. */
export async function seatsTaken(db: AnyDb, orgId: string): Promise<number> {
  const d = db as NodePgDatabase<typeof schema>;
  const [[members], [invites]] = await Promise.all([
    d.select({ n: count() }).from(schema.member).where(eq(schema.member.organizationId, orgId)),
    d
      .select({ n: count() })
      .from(schema.invitation)
      .where(
        and(
          eq(schema.invitation.organizationId, orgId),
          eq(schema.invitation.status, "pending"),
          gt(schema.invitation.expiresAt, new Date()),
        ),
      ),
  ]);
  return members.n + invites.n;
}

/** True while Polar is still charging this org. Deleting the org would not stop that. */
export async function hasActiveSubscription(db: AnyDb, orgId: string): Promise<boolean> {
  const d = db as NodePgDatabase<typeof schema>;
  const [row] = await d
    .select({ id: schema.subscription.id })
    .from(schema.subscription)
    .where(and(eq(schema.subscription.orgId, orgId), inArray(schema.subscription.status, [...ENTITLED_STATUSES])))
    .limit(1);
  return Boolean(row);
}
