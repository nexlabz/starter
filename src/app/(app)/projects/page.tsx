import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { AddProjectForm, DeleteProjectButton } from "@/components/project-forms";
import { DotMeter } from "@/components/dot-meter";
import { PageHeader } from "@/components/page-header";
import { listStyles } from "@/components/ui/card";
import { db, schema } from "@/db";
import { withTenant } from "@/db/tenant";
import { getEntitlement } from "@/lib/billing/entitlements";
import { requireOrgSession } from "@/lib/session";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const s = await requireOrgSession();
  const ent = await getEntitlement(db, s.orgId);
  const rows = await withTenant(db, s.orgId, (tx) => tx.select().from(schema.project).orderBy(desc(schema.project.createdAt)));

  return (
    <div className="space-y-6">
      <PageHeader title="Projects">A sample tenant-owned resource. {rows.length} of {ent.plan.limits.projects} used on the {ent.plan.name} plan.</PageHeader>
      <DotMeter used={rows.length} limit={ent.plan.limits.projects} />
      <AddProjectForm />
      <ul className={listStyles}>
        {rows.length === 0 && <li className="p-5 text-muted-foreground">No projects yet. Name your first one above.</li>}
        {rows.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 p-3 pl-5">
            <span className="min-w-0 truncate">{p.name}</span>
            <DeleteProjectButton id={p.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
