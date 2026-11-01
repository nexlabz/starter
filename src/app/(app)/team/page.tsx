import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { CancelInvitationButton, InviteForm, RemoveMemberButton } from "@/components/team-actions";
import { getEntitlement } from "@/lib/billing/entitlements";
import { isAdminRole, requireOrgSession } from "@/lib/session";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-sm text-muted">{members.length} of {ent.plan.limits.seats} seats used on the {ent.plan.name} plan.</p>
      </div>
      {admin && <InviteForm />}
      <section aria-labelledby="members">
        <h2 id="members" className="mb-2 font-semibold">Members</h2>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between p-4">
              <div><p className="font-medium">{m.name}</p><p className="text-sm text-muted">{m.email} · {m.role}</p></div>
              {admin && m.userId !== s.user.id && m.role !== "owner" && <RemoveMemberButton memberId={m.id} />}
            </li>
          ))}
        </ul>
      </section>
      {invites.length > 0 && (
        <section aria-labelledby="pending">
          <h2 id="pending" className="mb-2 font-semibold">Pending invitations</h2>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {invites.map((i) => (
              <li key={i.id} className="flex items-center justify-between p-4">
                <span className="text-sm">{i.email} · {i.role}</span>
                {admin && <CancelInvitationButton id={i.id} />}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
