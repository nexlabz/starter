import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as schema from "@/db/schema";
import { FREE_PLAN } from "@/lib/billing/catalog";
import { seatsTaken } from "@/lib/billing/entitlements";
import { seedOrgs, testDb } from "./helpers";

const h = vi.hoisted(() => ({ db: undefined as unknown, orgId: "orgA" }));

vi.mock("@/db", async () => ({
  get db() {
    return h.db;
  },
  schema: await import("@/db/schema"),
}));
vi.mock("@/lib/session", () => ({
  requireOrgSession: async () => ({ orgId: h.orgId, user: { id: "u1" }, role: "owner" }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { createProject, deleteProject } = await import("@/app/(app)/projects/actions");

let db: Awaited<ReturnType<typeof testDb>>;

const form = (name: string) => {
  const f = new FormData();
  f.set("name", name);
  return f;
};

beforeAll(async () => {
  db = await testDb();
  h.db = db;
  await seedOrgs(db);
});

beforeEach(async () => {
  await db.delete(schema.project);
  await db.delete(schema.invitation);
  await db.delete(schema.member);
  h.orgId = "orgA";
});

describe("createProject", () => {
  it("returns a plan-limit failure once the plan's projects are used", async () => {
    const max = FREE_PLAN.limits.projects;
    for (let i = 0; i < max; i++) expect((await createProject(form(`p${i}`))).ok).toBe(true);

    const res = await createProject(form("one too many"));
    expect(res).toMatchObject({ ok: false, limit: true });
    expect(res.message).toContain(String(max));
    expect(await db.select().from(schema.project)).toHaveLength(max);
  });

  it("rejects a blank name without flagging a plan limit", async () => {
    const res = await createProject(form("   "));
    expect(res.ok).toBe(false);
    expect(res).not.toHaveProperty("limit");
  });
});

describe("deleteProject", () => {
  it("cannot delete another tenant's project, and says so", async () => {
    await db.insert(schema.project).values({ id: "pB", orgId: "orgB", name: "B's secret" });
    expect((await deleteProject("pB")).ok).toBe(false);
    expect(await db.select().from(schema.project)).toHaveLength(1);
  });
});

describe("seatsTaken", () => {
  it("counts members and open invitations for that org only", async () => {
    const future = new Date(Date.now() + 86_400_000);
    await db.insert(schema.member).values([
      { id: "m1", organizationId: "orgA", userId: "u1", role: "owner" },
      { id: "m2", organizationId: "orgB", userId: "u2", role: "owner" },
    ]);
    await db.insert(schema.invitation).values([
      { id: "i1", organizationId: "orgA", email: "a@x.co", status: "pending", expiresAt: future, inviterId: "u1" },
      { id: "i2", organizationId: "orgA", email: "b@x.co", status: "canceled", expiresAt: future, inviterId: "u1" },
      { id: "i3", organizationId: "orgA", email: "c@x.co", status: "pending", expiresAt: new Date(Date.now() - 1000), inviterId: "u1" },
      { id: "i4", organizationId: "orgB", email: "d@x.co", status: "pending", expiresAt: future, inviterId: "u2" },
    ]);
    expect(await seatsTaken(db, "orgA")).toBe(2);
  });
});
