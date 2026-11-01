import { eq, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import { planKeyForProduct } from "./catalog";

/**
 * The subset of a Polar webhook we rely on. Polar payloads are snake_case
 * (product_id, modified_at, ...); tests type their fixtures against the SDK models
 * so a field rename fails the suite instead of silently granting nothing.
 */
export type PolarEvent = { type: string; data: Record<string, unknown> };

type Db = NodePgDatabase<typeof schema>;

const str = (v: unknown) => (typeof v === "string" ? v : undefined);
const date = (v: unknown) => {
  const d = v instanceof Date ? v : typeof v === "string" ? new Date(v) : undefined;
  return d && !Number.isNaN(d.getTime()) ? d : undefined;
};

/** Org id travels in checkout `reference_id`, which Polar stores as metadata.referenceId. */
export function orgIdOf(data: Record<string, unknown>): string | undefined {
  const md = data.metadata as Record<string, unknown> | undefined;
  return str(md?.referenceId) ?? str(md?.reference_id);
}

export type ApplyResult = "applied" | "duplicate" | "ignored";

/**
 * Apply one Polar event to our tables. Idempotent: a delivery key is inserted in
 * the same transaction as the change, so a retry of a processed event is a no-op
 * and a failed attempt leaves nothing behind (Polar will retry the webhook).
 */
export async function applyPolarEvent(
  db: Db,
  event: PolarEvent,
  productEnv: Record<string, string | undefined>,
): Promise<ApplyResult> {
  const { type, data } = event;
  const handled =
    type === "order.paid" || type === "order.refunded" || type.startsWith("subscription.");
  if (!handled) return "ignored";

  const id = str(data.id);
  if (!id) return "ignored";
  const orgId = orgIdOf(data);
  if (!orgId) {
    // Purchases made outside our checkout (no referenceId) cannot be attributed to a tenant.
    console.warn(`[billing] ${type} ${id} has no metadata.referenceId; ignoring`);
    return "ignored";
  }

  const key = `${type}:${id}:${str(data.modified_at) ?? str(data.created_at) ?? ""}`;

  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(schema.billingEvent)
      .values({ key, type })
      .onConflictDoNothing()
      .returning({ key: schema.billingEvent.key });
    if (inserted.length === 0) return "duplicate";

    const productId = str(data.product_id) ?? str((data.product as Record<string, unknown> | undefined)?.id) ?? "";
    const planKey = planKeyForProduct(productId, productEnv);
    if (!planKey) console.warn(`[billing] ${type} ${id}: product ${productId} matches no plan in catalog.ts/env`);

    if (type === "order.paid") {
      // Subscription renewals also emit order.paid; only one-time purchases create a `purchase` row.
      if (str(data.subscription_id)) return "ignored";
      await tx
        .insert(schema.purchase)
        .values({
          id,
          orgId,
          productId,
          planKey,
          amountCents: typeof data.total_amount === "number" ? data.total_amount : 0,
          currency: str(data.currency) ?? "usd",
        })
        .onConflictDoNothing();
      return "applied";
    }

    if (type === "order.refunded") {
      // Only a full refund revokes access; partial refunds keep it (policy: see docs/BILLING.md).
      if (str(data.status) === "refunded") {
        await tx.update(schema.purchase).set({ refundedAt: new Date() }).where(eq(schema.purchase.id, id));
      }
      return "applied";
    }

    // subscription.*
    const modifiedAt = date(data.modified_at) ?? date(data.created_at) ?? new Date();
    const values = {
      id,
      orgId,
      productId,
      planKey,
      status: str(data.status) ?? "incomplete",
      currentPeriodEnd: date(data.current_period_end) ?? null,
      cancelAtPeriodEnd: data.cancel_at_period_end === true,
      providerModifiedAt: modifiedAt,
    };
    await tx
      .insert(schema.subscription)
      .values(values)
      .onConflictDoUpdate({
        target: schema.subscription.id,
        set: {
          productId: values.productId,
          planKey: values.planKey,
          status: values.status,
          currentPeriodEnd: values.currentPeriodEnd,
          cancelAtPeriodEnd: values.cancelAtPeriodEnd,
          providerModifiedAt: values.providerModifiedAt,
        },
        // Never let an older, out-of-order webhook overwrite newer state.
        setWhere: sql`${schema.subscription.providerModifiedAt} is null or ${schema.subscription.providerModifiedAt} <= ${modifiedAt.toISOString()}`,
      });
    return "applied";
  });
}
