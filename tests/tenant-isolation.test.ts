import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import * as schema from "@/db/schema";
import { withTenant } from "@/db/tenant";
import { seedOrgs, testDb } from "./helpers";

let db: Awaited<ReturnType<typeof testDb>>;

beforeAll(async () => {
  db = await testDb();
  await seedOrgs(db);
  // Seed as the (RLS-exempt) owner connection: one project per org.
  await db.insert(schema.project).values([
    { id: "pA", orgId: "orgA", name: "A's secret" },
    { id: "pB", orgId: "orgB", name: "B's secret" },
  ]);
});

describe("tenant isolation (RLS)", () => {
  it("a tenant sees only its own rows, even with NO where clause", async () => {
    const a = await withTenant(db, "orgA", (tx) => tx.select().from(schema.project));
    expect(a.map((r) => r.id)).toEqual(["pA"]);
    const b = await withTenant(db, "orgB", (tx) => tx.select().from(schema.project));
    expect(b.map((r) => r.id)).toEqual(["pB"]);
  });

  it("cannot read another tenant's row by id", async () => {
    const rows = await withTenant(db, "orgA", (tx) =>
      tx.select().from(schema.project).where(eq(schema.project.id, "pB")),
    );
    expect(rows).toEqual([]);
  });

  it("cannot update or delete another tenant's row", async () => {
    await withTenant(db, "orgA", (tx) =>
      tx.update(schema.project).set({ name: "hacked" }).where(eq(schema.project.id, "pB")),
    );
    await withTenant(db, "orgA", (tx) => tx.delete(schema.project).where(eq(schema.project.id, "pB")));
    const [b] = await db.select().from(schema.project).where(eq(schema.project.id, "pB"));
    expect(b?.name).toBe("B's secret");
  });

  it("cannot insert a row into another tenant", async () => {
    await expect(
      withTenant(db, "orgA", (tx) => tx.insert(schema.project).values({ orgId: "orgB", name: "planted" })),
    ).rejects.toThrow();
  });

  it("tenant context does not leak after the transaction (pooled-connection safety)", async () => {
    await withTenant(db, "orgA", (tx) => tx.select().from(schema.project));
    const res = await db.execute(`select current_setting('app.org_id', true) as v, current_user as u`);
    const row = res.rows[0] as { v: string | null; u: string };
    expect(row.v ?? "").toBe("");
    expect(row.u).not.toBe("app_rls");
  });

  it("requires an org id", async () => {
    await expect(withTenant(db, "", (tx) => tx.select().from(schema.project))).rejects.toThrow(/orgId/);
  });
});
