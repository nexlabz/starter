import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { DotMeter } from "@/components/dot-meter";
import { Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { listStyles } from "@/components/ui/card";
import { db, schema } from "@/db";
import { CancelInvitationButton, CopyInviteLinkButton, InviteForm, MemberRoleSelect, RemoveMemberButton } from "@/components/team-actions";
import { getEntitlement, seatsTaken } from "@/lib/billing/entitlements";
import { appUrl, emailEnabled } from "@/lib/env";
import { isAdminRole, requireOrgSession } from "@/lib/session";
import { isOwnerRole, memberControls } from "@/lib/team";
import { usage } from "@/lib/usage";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const s = await requireOrgSession();
  const admin = isAdminRole(s.role);
  const [members, invites, ent, taken] = await Promise.all([
    db
      .select({ id: schema.member.id, role: schema.member.role, userId: schema.user.id, name: schema.user.name, email: schema.user.email })
      .from(schema.member)
      .innerJoin(schema.user, eq(schema.user.id, schema.member.userId))
      .where(eq(schema.member.organizationId, s.orgId)),
    db.select().from(schema.invitation).where(and(eq(schema.invitation.organizationId, s.orgId), eq(schema.invitation.status, "pending"))),
    getEntitlement(db, s.orgId),
    seatsTaken(db, s.orgId),
  ]);
  const seats = usage(taken, ent.plan.limits.seats);
  const ownerCount = members.filter((m) => isOwnerRole(m.role)).length;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <PageHeader title="Team">{taken} of {ent.plan.limits.seats} seats used on the {ent.plan.name} plan, including open invitations.</PageHeader>
        <DotMeter used={taken} limit={ent.plan.limits.seats} />
      </div>
      {seats.state === "full" && <Notice tone="warning">Every seat is taken on the {ent.plan.name} plan. <Link href="/billing" className="underline underline-offset-4">Compare plans</Link> or remove a member to invite someone new.</Notice>}
      {admin ? <InviteForm emailOn={emailEnabled()} /> : <Notice>Only owners and admins can invite people or change roles.</Notice>}
      <section aria-labelledby="members">
        <h2 id="members" className="mb-3 text-xl font-medium">Members</h2>
        <ul className={listStyles}>
          {members.map((m) => {
            const { manageable, roles } = memberControls({ viewerRole: s.role, targetRole: m.role, self: m.userId === s.user.id, ownerCount });
            return (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-3 pl-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">{m.name.charAt(0).toUpperCase()}</span>
                  <div className="min-w-0">
                    <p className="font-medium">{m.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{m.email}</p>
                  </div>
                </div>
                {!manageable && <span className="text-sm text-muted-foreground capitalize">{m.role}</span>}
                {manageable && (
                  <span className="flex gap-2">
                    <MemberRoleSelect memberId={m.id} name={m.name} role={m.role} roles={roles} />
                    <RemoveMemberButton memberId={m.id} name={m.name} />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
      {invites.length > 0 && (
        <section aria-labelledby="pending">
          <h2 id="pending" className="mb-3 text-xl font-medium">Pending invitations</h2>
          <ul className={listStyles}>
            {invites.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 p-3 pl-5">
                <span className="min-w-0 text-sm">{i.email} <span className="text-muted-foreground">as {i.role}</span></span>
                {admin && (
                  <span className="flex gap-2">
                    <CopyInviteLinkButton link={`${appUrl()}/accept-invitation/${i.id}`} />
                    <CancelInvitationButton id={i.id} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
