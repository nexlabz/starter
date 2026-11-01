import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { AddProjectForm, DeleteProjectButton } from "@/components/project-forms";
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
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          A sample tenant-owned resource. {rows.length} of {ent.plan.limits.projects} used on the {ent.plan.name} plan.
        </p>
      </div>
      <AddProjectForm />
      <ul className="divide-y divide-border rounded-xl border border-border">
        {rows.length === 0 && <li className="p-4 text-sm text-muted-foreground">No projects yet.</li>}
        {rows.map((p) => (
          <li key={p.id} className="flex items-center justify-between p-4">
            <span>{p.name}</span>
            <DeleteProjectButton id={p.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
