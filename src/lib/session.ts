import "server-only";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { auth } from "./auth";

/** Current session or redirect to sign-in. */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  return session;
}

/**
 * Session + a verified active organization. This is the ONLY way pages and
 * actions should obtain an `orgId`: it re-checks membership in the database,
 * so a stale session pointing at an org you were removed from fails closed.
 */
export async function requireOrgSession() {
  const session = await requireSession();
  const orgId = session.session.activeOrganizationId;
  if (!orgId) redirect("/onboarding");

  const [m] = await db
    .select({ role: schema.member.role })
    .from(schema.member)
    .where(and(eq(schema.member.organizationId, orgId), eq(schema.member.userId, session.user.id)))
    .limit(1);
  if (!m) redirect("/onboarding");

  return { ...session, orgId, role: m.role };
}

export const isAdminRole = (role: string) => role.split(",").some((r) => r === "owner" || r === "admin");
