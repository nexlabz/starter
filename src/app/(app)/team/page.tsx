import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { CancelInvitationButton, CopyInviteLinkButton, InviteForm, MemberRoleSelect, RemoveMemberButton } from "@/components/team-actions";
import { getEntitlement } from "@/lib/billing/entitlements";
import { appUrl, emailEnabled } from "@/lib/env";
import { isAdminRole, requireOrgSession } from "@/lib/session";
import { isOwnerRole, memberControls } from "@/lib/team";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const s = await requireOrgSession();
  const admin = isAdminRole(s.role);
  const [members, invites, ent] = await Promise.all([
    db
      .select({ id: schema.member.id, role: schema.member.role, userId: schema.user.id, name: schema.user.name, email: schema.user.email })
      .from(schema.member)
      .innerJoin(schema.user, eq(schema.user.id, schema.member.userId))
      .where(eq(schema.member.organizationId, s.orgId)),
    db.select().from(schema.invitation).where(and(eq(schema.invitation.organizationId, s.orgId), eq(schema.invitation.status, "pending"))),
    getEntitlement(db, s.orgId),
  ]);
  const ownerCount = members.filter((m) => isOwnerRole(m.role)).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-sm text-muted-foreground">{members.length} of {ent.plan.limits.seats} seats used on the {ent.plan.name} plan.</p>
      </div>
      {admin && <InviteForm emailOn={emailEnabled()} />}
      <section aria-labelledby="members">
        <h2 id="members" className="mb-2 font-semibold">Members</h2>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {members.map((m) => {
            const { manageable, roles } = memberControls({ viewerRole: s.role, targetRole: m.role, self: m.userId === s.user.id, ownerCount });
            return (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{m.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{m.email}{manageable ? "" : ` · ${m.role}`}</p>
                </div>
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
          <h2 id="pending" className="mb-2 font-semibold">Pending invitations</h2>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {invites.map((i) => (
              <li key={i.id} className="flex items-center justify-between p-4">
                <span className="text-sm">{i.email} · {i.role}</span>
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
