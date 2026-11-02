import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { DotMeter } from "@/components/dot-meter";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Tray, listStyles } from "@/components/ui/card";
import { db, schema } from "@/db";
import { withTenant } from "@/db/tenant";
import { getEntitlement, seatsTaken } from "@/lib/billing/entitlements";
import { requireOrgSession } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

function Usage({ label, used, limit, href, action }: { label: string; used: number; limit: number; href: string; action: string }) {
  return (
    <Tray foot={<Link href={href} className="underline-offset-4 hover:underline">{action}</Link>}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="dot-numeral text-6xl">{used}</span>
        <span className="text-muted-foreground">of {limit}</span>
      </p>
      <DotMeter used={used} limit={limit} className="mt-5" />
    </Tray>
  );
}

export default async function Dashboard() {
  const s = await requireOrgSession();
  const [ent, seats, [org], projects] = await Promise.all([
    getEntitlement(db, s.orgId),
    seatsTaken(db, s.orgId),
    db.select({ name: schema.organization.name }).from(schema.organization).where(eq(schema.organization.id, s.orgId)).limit(1),
    withTenant(db, s.orgId, (tx) => tx.select().from(schema.project).orderBy(desc(schema.project.createdAt))),
  ]);
  return (
    <div className="space-y-8">
      <PageHeader title={org.name}>You&apos;re {s.role === "member" ? "a" : "an"} {s.role} of this workspace.</PageHeader>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Tray signal foot={<Link href="/billing" className="underline-offset-4 hover:underline">Manage billing</Link>}>
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="mt-3 text-5xl font-medium tracking-[-0.04em]">{ent.plan.name}</p>
          <p className="mt-auto pt-5 text-sm text-muted-foreground">{ent.plan.blurb}</p>
        </Tray>
        <Usage label="Projects" used={projects.length} limit={ent.plan.limits.projects} href="/projects" action="View projects" />
        <Usage label="Seats" used={seats} limit={ent.plan.limits.seats} href="/team" action="Manage team" />
      </div>
      <section aria-labelledby="recent">
        <h2 id="recent" className="mb-3 text-xl font-medium">Recent projects</h2>
        {projects.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-dashed border-input p-6">
            <p className="text-muted-foreground">Nothing here yet. Your first project takes a few seconds.</p>
            <Link href="/projects" className={buttonVariants()}>Add a project</Link>
          </div>
        ) : (
          <ul className={listStyles}>
            {projects.slice(0, 5).map((p) => (<li key={p.id} className="truncate px-5 py-4">{p.name}</li>))}
          </ul>
        )}
      </section>
    </div>
  );
}
