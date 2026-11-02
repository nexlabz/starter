import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { AddProjectForm, DeleteProjectButton } from "@/components/project-forms";
import { DotMeter } from "@/components/dot-meter";
import { Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { listStyles } from "@/components/ui/card";
import { db, schema } from "@/db";
import { withTenant } from "@/db/tenant";
import { getEntitlement } from "@/lib/billing/entitlements";
import { requireOrgSession } from "@/lib/session";
import { usage } from "@/lib/usage";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const s = await requireOrgSession();
  const ent = await getEntitlement(db, s.orgId);
  const rows = await withTenant(db, s.orgId, (tx) => tx.select().from(schema.project).orderBy(desc(schema.project.createdAt)));

  const room = usage(rows.length, ent.plan.limits.projects);

  return (
    <div className="space-y-6">
      <PageHeader title="Projects">{rows.length} of {ent.plan.limits.projects} used on the {ent.plan.name} plan. A sample resource: swap it for your own.</PageHeader>
      <DotMeter used={rows.length} limit={ent.plan.limits.projects} />
      {room.state === "full" ? (
        <Notice tone="warning">You&apos;ve used every project on the {ent.plan.name} plan. <Link href="/billing" className="underline underline-offset-4">Compare plans</Link> or delete one to add another.</Notice>
      ) : (
        <AddProjectForm />
      )}
      {rows.length === 0 ? (
        <p className="rounded-[20px] border border-dashed border-input p-6 text-muted-foreground">No projects yet. Name your first one above.</p>
      ) : (
        <ul className={listStyles}>
          {rows.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 p-3 pl-5">
              <div className="min-w-0">
                <p className="truncate font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">Added {formatDate(p.createdAt)}</p>
              </div>
              <DeleteProjectButton id={p.id} name={p.name} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
