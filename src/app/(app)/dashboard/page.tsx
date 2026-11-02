import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Check } from "lucide-react";
import { DotMeter } from "@/components/dot-meter";
import { Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, Tray, listStyles } from "@/components/ui/card";
import { db, schema } from "@/db";
import { withTenant } from "@/db/tenant";
import { getEntitlement, seatsTaken } from "@/lib/billing/entitlements";
import { billingEnabled } from "@/lib/env";
import { isAdminRole, requireOrgSession } from "@/lib/session";
import { usage } from "@/lib/usage";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

function Usage({ label, used, limit, href, action }: { label: string; used: number; limit: number; href: string; action: string }) {
  const room = usage(used, limit);
  return (
    <Tray foot={<Link href={href} className="underline-offset-4 hover:underline">{action}</Link>}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className={cn(room.state === "ok" ? "text-muted-foreground" : "font-semibold text-warning")}>{room.label}</p>
      </div>
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
  const admin = isAdminRole(s.role);
  const full = [
    usage(projects.length, ent.plan.limits.projects).state === "full" && "projects",
    usage(seats, ent.plan.limits.seats).state === "full" && "seats",
  ].filter(Boolean);
  const steps = [
    { label: "Add your first project", href: "/projects", done: projects.length > 0 },
    ...(admin ? [{ label: "Invite a teammate", href: "/team", done: seats > 1 }] : []),
    ...(admin && billingEnabled() ? [{ label: "Choose a plan", href: "/billing", done: ent.source !== "free" }] : []),
  ];
  const stepsLeft = steps.filter((step) => !step.done).length;

  return (
    <div className="space-y-8">
      <PageHeader title={org.name} action={<Link href="/projects" className={buttonVariants()}>Add a project</Link>}>
        You&apos;re {s.role === "member" ? "a" : "an"} {s.role} of this workspace, on the {ent.plan.name} plan.
      </PageHeader>
      {full.length > 0 && (
        <Notice tone="warning">You&apos;ve reached your {full.join(" and ")} limit. <Link href="/billing" className="underline underline-offset-4">Compare plans</Link> to add more.</Notice>
      )}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Tray signal foot={<Link href="/billing" className="underline-offset-4 hover:underline">Manage billing</Link>}>
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="mt-3 text-5xl font-medium tracking-[-0.04em]">{ent.plan.name}</p>
          <p className="mt-auto pt-5 text-sm text-muted-foreground">{ent.plan.blurb}</p>
        </Tray>
        <Usage label="Projects" used={projects.length} limit={ent.plan.limits.projects} href="/projects" action="View projects" />
        <Usage label="Seats" used={seats} limit={ent.plan.limits.seats} href="/team" action="Manage team" />
      </div>
      <div className={cn("grid gap-8", stepsLeft > 0 && "lg:grid-cols-[2fr_1fr]")}>
        <section aria-labelledby="recent" className="min-w-0">
          <h2 id="recent" className="mb-3 text-xl font-medium">Recent projects</h2>
          {projects.length === 0 ? (
            <p className="rounded-[20px] border border-dashed border-input p-6 text-muted-foreground">Nothing here yet. Your first project takes a few seconds.</p>
          ) : (
            <ul className={listStyles}>
              {projects.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-4 px-5 py-4">
                  <span className="min-w-0 truncate font-medium">{p.name}</span>
                  <span className="shrink-0 text-sm text-muted-foreground">{formatDate(p.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        {stepsLeft > 0 && (
          <section aria-labelledby="next">
            <h2 id="next" className="mb-3 text-xl font-medium">Next steps</h2>
            <Card className="p-2">
              <ol>
                {steps.map((step) => (
                  <li key={step.label}>
                    <Link href={step.href} className="flex items-center gap-3 rounded-xl p-3 text-sm hover:bg-muted">
                      <span aria-hidden className={cn("flex size-5 shrink-0 items-center justify-center rounded-[4px]", step.done ? "bg-foreground text-background" : "border border-input")}>
                        {step.done && <Check className="size-3.5" />}
                      </span>
                      <span className={cn(step.done && "text-muted-foreground line-through")}>{step.label}</span>
                      {step.done && <span className="sr-only">(done)</span>}
                    </Link>
                  </li>
                ))}
              </ol>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
