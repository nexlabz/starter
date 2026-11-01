"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { withTenant } from "@/db/tenant";
import type { ActionResult } from "@/lib/action-result";
import { getEntitlement } from "@/lib/billing/entitlements";
import { requireOrgSession } from "@/lib/session";

const failed: ActionResult = { ok: false, message: "Could not save your change. Please try again." };

/** Example of the tenant pattern: verified org -> entitlement check -> RLS-scoped write. */
export async function createProject(formData: FormData): Promise<ActionResult> {
  const s = await requireOrgSession();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 1 || name.length > 80) return { ok: false, message: "Enter a name (1–80 characters)." };

  try {
    const ent = await getEntitlement(db, s.orgId);
    const added = await withTenant(db, s.orgId, async (tx) => {
      const [{ n }] = await tx.select({ n: sql<number>`count(*)::int` }).from(schema.project);
      if (n >= ent.plan.limits.projects) return false;
      await tx.insert(schema.project).values({ orgId: s.orgId, name, createdBy: s.user.id });
      return true;
    });
    if (!added) {
      return { ok: false, limit: true, message: `The ${ent.plan.name} plan allows ${ent.plan.limits.projects} projects. Upgrade to add more.` };
    }
  } catch (e) {
    console.error("[projects] create failed", e);
    return failed;
  }
  revalidatePath("/projects");
  return { ok: true, message: "Project added." };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const s = await requireOrgSession();
  try {
    // RLS makes this a no-op for ids belonging to other organizations.
    const rows = await withTenant(db, s.orgId, (tx) =>
      tx.delete(schema.project).where(eq(schema.project.id, id)).returning({ id: schema.project.id }),
    );
    if (rows.length === 0) return { ok: false, message: "That project no longer exists." };
  } catch (e) {
    console.error("[projects] delete failed", e);
    return failed;
  }
  revalidatePath("/projects");
  return { ok: true, message: "Project deleted." };
}
