import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { withTenant } from "@/db/tenant";
import { getEntitlement } from "@/lib/billing/entitlements";
import { requireOrgSession } from "@/lib/session";
import { createProject, deleteProject } from "./actions";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const s = await requireOrgSession();
  const { error } = await searchParams;
  const ent = await getEntitlement(db, s.orgId);
  const rows = await withTenant(db, s.orgId, (tx) => tx.select().from(schema.project).orderBy(desc(schema.project.createdAt)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-sm text-muted">
          A sample tenant-owned resource. {rows.length} of {ent.plan.limits.projects} used on the {ent.plan.name} plan.
        </p>
      </div>
      {error === "limit" && (
        <p role="alert" className="card text-sm">You reached your plan&apos;s project limit. <Link className="underline" href="/billing">Upgrade</Link> to add more.</p>
      )}
      {error === "name" && <p role="alert" className="text-sm text-danger">Enter a name (1–80 characters).</p>}
      <form action={createProject} className="flex gap-2">
        <input name="name" required maxLength={80} placeholder="New project name" className="input" aria-label="Project name" />
        <button className="btn btn-primary">Add</button>
      </form>
      <ul className="divide-y divide-border rounded-xl border border-border">
        {rows.length === 0 && <li className="p-4 text-sm text-muted">No projects yet.</li>}
        {rows.map((p) => (
          <li key={p.id} className="flex items-center justify-between p-4">
            <span>{p.name}</span>
            <form action={deleteProject}><input type="hidden" name="id" value={p.id} /><button className="btn">Delete</button></form>
          </li>
        ))}
      </ul>
    </div>
  );
}
