"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { withTenant } from "@/db/tenant";
import { getEntitlement } from "@/lib/billing/entitlements";
import { requireOrgSession } from "@/lib/session";

/** Example of the tenant pattern: verified org -> entitlement check -> RLS-scoped write. */
export async function createProject(formData: FormData) {
  const s = await requireOrgSession();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 1 || name.length > 80) redirect("/projects?error=name");

  const ent = await getEntitlement(db, s.orgId);
  const ok = await withTenant(db, s.orgId, async (tx) => {
    const [{ n }] = await tx.select({ n: sql<number>`count(*)::int` }).from(schema.project);
    if (n >= ent.plan.limits.projects) return false;
    await tx.insert(schema.project).values({ orgId: s.orgId, name, createdBy: s.user.id });
    return true;
  });
  if (!ok) redirect("/projects?error=limit");
  revalidatePath("/projects");
}

export async function deleteProject(formData: FormData) {
  const s = await requireOrgSession();
  const id = String(formData.get("id") ?? "");
  // RLS makes this a no-op for ids belonging to other organizations.
  await withTenant(db, s.orgId, (tx) => tx.delete(schema.project).where(eq(schema.project.id, id)));
  revalidatePath("/projects");
}
