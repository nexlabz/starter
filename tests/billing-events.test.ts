import type { models } from "@polar-sh/sdk/2026-10";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import * as schema from "@/db/schema";
import { applyPolarEvent } from "@/lib/billing/apply-event";
import { getEntitlement } from "@/lib/billing/entitlements";
import { seedOrgs, testDb } from "./helpers";

const env = { POLAR_PRODUCT_PRO_MONTHLY: "prod_m", POLAR_PRODUCT_LIFETIME: "prod_l" };
let db: Awaited<ReturnType<typeof testDb>>;

// pglite db is structurally compatible with the node-postgres type used in app code.
const apply = (e: Parameters<typeof applyPolarEvent>[1]) =>
  applyPolarEvent(db as unknown as Parameters<typeof applyPolarEvent>[0], e, env);
const entitle = (org: string) => getEntitlement(db as unknown as Parameters<typeof getEntitlement>[0], org);

// `satisfies` pins fixtures to Polar's real wire format: renaming a field here or upstream fails tsc.
type SubFields = Pick<
  models.Subscription,
  "id" | "product_id" | "status" | "cancel_at_period_end" | "current_period_end" | "modified_at" | "metadata"
>;
type OrderFields = Pick<models.Order, "id" | "product_id" | "total_amount" | "currency" | "metadata" | "subscription_id" | "modified_at" | "status">;

const sub = (over: Partial<SubFields> = {}) => ({
  type: "subscription.active",
  data: {
    id: "sub1",
    product_id: "prod_m",
    status: "active",
    cancel_at_period_end: false,
    current_period_end: "2030-01-01T00:00:00Z",
    modified_at: "2026-01-01T00:00:00Z",
    metadata: { referenceId: "orgA" },
    ...over,
  } satisfies SubFields,
});

const order = (over: Partial<OrderFields> = {}) =>
  ({
    id: "ord1",
    product_id: "prod_l",
    total_amount: 29900,
    currency: "usd",
    metadata: { referenceId: "orgA" },
    subscription_id: null,
    modified_at: null,
    status: "paid",
    ...over,
  }) satisfies OrderFields;

beforeEach(async () => {
  db = await testDb();
  await seedOrgs(db);
});

describe("polar webhook -> entitlements", () => {
  it("free by default", async () => {
    expect((await entitle("orgA")).plan.key).toBe("free");
  });

  it("active subscription upgrades the org it was bought for, not others", async () => {
    expect(await apply(sub())).toBe("applied");
    expect((await entitle("orgA")).plan.key).toBe("pro_monthly");
    expect((await entitle("orgB")).plan.key).toBe("free");
  });

  it("is idempotent: the same delivery twice is a duplicate", async () => {
    await apply(sub());
    expect(await apply(sub())).toBe("duplicate");
    expect(await db.select().from(schema.subscription)).toHaveLength(1);
  });

  it("an older out-of-order webhook cannot overwrite newer state", async () => {
    await apply(sub({ status: "canceled", modified_at: "2026-03-01T00:00:00Z" }));
    await apply(sub({ status: "active", modified_at: "2026-02-01T00:00:00Z" }));
    expect((await entitle("orgA")).plan.key).toBe("free");
  });

  it("one-time purchase grants lifetime until fully refunded", async () => {
    await apply({ type: "order.paid", data: order() });
    const [row] = await db.select().from(schema.purchase);
    expect(row).toMatchObject({ planKey: "lifetime", amountCents: 29900, orgId: "orgA" });
    expect((await entitle("orgA")).plan.key).toBe("lifetime");
    await apply({ type: "order.refunded", data: order({ status: "partially_refunded", modified_at: "2026-01-02T00:00:00Z" }) });
    expect((await entitle("orgA")).plan.key).toBe("lifetime");
    await apply({ type: "order.refunded", data: order({ status: "refunded", modified_at: "2026-01-03T00:00:00Z" }) });
    expect((await entitle("orgA")).plan.key).toBe("free");
  });

  it("subscription renewals (order.paid with a subscription) do not create a purchase", async () => {
    await apply({ type: "order.paid", data: order({ id: "ord2", subscription_id: "sub1", product_id: "prod_m" }) });
    expect(await db.select().from(schema.purchase)).toHaveLength(0);
  });

  it("events with no referenceId are ignored, not guessed", async () => {
    expect(await apply({ type: "order.paid", data: order({ id: "ord3", metadata: {} }) })).toBe("ignored");
    expect(await db.select().from(schema.purchase)).toHaveLength(0);
  });

  it("records subscription period and cancel state from the payload", async () => {
    await apply(sub({ cancel_at_period_end: true }));
    const [row] = await db.select().from(schema.subscription);
    expect(row.cancelAtPeriodEnd).toBe(true);
    expect(row.currentPeriodEnd?.toISOString()).toBe("2030-01-01T00:00:00.000Z");
    expect((await entitle("orgA")).plan.key).toBe("pro_monthly"); // still paid until the period ends
  });

  it("highest rank wins when an org holds several entitlements", async () => {
    await apply(sub());
    await apply({ type: "order.paid", data: order({ id: "ord4" }) });
    expect((await entitle("orgA")).plan.key).toBe("lifetime");
    await db.update(schema.purchase).set({ refundedAt: new Date() }).where(eq(schema.purchase.id, "ord4"));
    expect((await entitle("orgA")).plan.key).toBe("pro_monthly");
  });
});
