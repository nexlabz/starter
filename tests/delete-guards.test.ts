import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import * as schema from "@/db/schema";
import { soleOwnedWorkspaces } from "@/lib/account";
import { hasActiveSubscription } from "@/lib/billing/entitlements";
import { seedOrgs, testDb } from "./helpers";

let db: Awaited<ReturnType<typeof testDb>>;
// The PGlite and app drizzle clients differ only in their driver.
const appDb = () => db as unknown as Parameters<typeof soleOwnedWorkspaces>[0];

beforeAll(async () => {
  db = await testDb();
  await seedOrgs(db);
});

beforeEach(async () => {
  await db.delete(schema.subscription);
  await db.delete(schema.member);
});

const member = (id: string, organizationId: string, userId: string, role: string) => ({ id, organizationId, userId, role });

describe("soleOwnedWorkspaces", () => {
  it("names a workspace the user owns alone", async () => {
    await db.insert(schema.member).values([member("m1", "orgA", "u1", "owner"), member("m2", "orgA", "u2", "member")]);
    expect(await soleOwnedWorkspaces(appDb(), "u1")).toEqual(["Org A"]);
  });

  it("ignores a workspace with a second owner", async () => {
    await db.insert(schema.member).values([member("m1", "orgA", "u1", "owner"), member("m2", "orgA", "u2", "owner")]);
    expect(await soleOwnedWorkspaces(appDb(), "u1")).toEqual([]);
  });

  it("ignores workspaces where the user is not an owner, and other tenants", async () => {
    await db.insert(schema.member).values([member("m1", "orgA", "u1", "admin"), member("m2", "orgB", "u2", "owner")]);
    expect(await soleOwnedWorkspaces(appDb(), "u1")).toEqual([]);
  });
});

describe("hasActiveSubscription", () => {
  const sub = (orgId: string, status: string) => ({ id: `s-${orgId}-${status}`, orgId, status, planKey: "pro_monthly", productId: "prod" });

  it("is true only for an entitled subscription on that org", async () => {
    await db.insert(schema.subscription).values(sub("orgA", "active"));
    expect(await hasActiveSubscription(db, "orgA")).toBe(true);
    expect(await hasActiveSubscription(db, "orgB")).toBe(false);
  });

  it("is false once canceled", async () => {
    await db.insert(schema.subscription).values(sub("orgA", "canceled"));
    expect(await hasActiveSubscription(db, "orgA")).toBe(false);
  });
});
