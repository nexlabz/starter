import { Card } from "@/components/ui/card";
import type { Metadata } from "next";
import Link from "next/link";
import { sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { withTenant } from "@/db/tenant";
import { getEntitlement } from "@/lib/billing/entitlements";
import { requireOrgSession } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const s = await requireOrgSession();
  const ent = await getEntitlement(db, s.orgId);
  const [{ n }] = await withTenant(db, s.orgId, (tx) =>
    tx.select({ n: sql<number>`count(*)::int` }).from(schema.project),
  );
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-muted-foreground">Plan</p><p className="text-2xl font-bold">{ent.plan.name}</p><Link href="/billing" className="text-sm underline">Manage billing</Link></Card>
        <Card><p className="text-sm text-muted-foreground">Projects</p><p className="text-2xl font-bold">{n} / {ent.plan.limits.projects}</p><Link href="/projects" className="text-sm underline">View projects</Link></Card>
        <Card><p className="text-sm text-muted-foreground">Your role</p><p className="text-2xl font-bold capitalize">{s.role}</p><Link href="/team" className="text-sm underline">Team</Link></Card>
      </div>
    </div>
  );
}
