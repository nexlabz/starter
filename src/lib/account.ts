import "server-only";
import { eq } from "drizzle-orm";
import type { db as appDb } from "@/db";
import * as schema from "@/db/schema";
import { isOwnerRole } from "@/lib/team";

/** Workspaces that would have no owner if this user went away. Delete blocks on these. */
export async function soleOwnedWorkspaces(db: typeof appDb, userId: string) {
  const mine = await db
    .select({ orgId: schema.member.organizationId, role: schema.member.role, name: schema.organization.name })
    .from(schema.member)
    .innerJoin(schema.organization, eq(schema.organization.id, schema.member.organizationId))
    .where(eq(schema.member.userId, userId));

  const sole: string[] = [];
  for (const m of mine.filter((m) => isOwnerRole(m.role))) {
    const everyone = await db.select({ role: schema.member.role }).from(schema.member).where(eq(schema.member.organizationId, m.orgId));
    if (everyone.filter((o) => isOwnerRole(o.role)).length === 1) sole.push(m.name);
  }
  return sole;
}
