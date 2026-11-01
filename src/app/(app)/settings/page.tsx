import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { DeleteAccountButton, DeleteWorkspaceButton, PasswordForm, ProfileForm, WorkspaceForm } from "@/components/settings-forms";
import { Card } from "@/components/ui/card";
import { db, schema } from "@/db";
import { isAdminRole, requireOrgSession } from "@/lib/session";
import { isOwnerRole } from "@/lib/team";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const s = await requireOrgSession();
  const [[org], [credential]] = await Promise.all([
    db.select({ name: schema.organization.name }).from(schema.organization).where(eq(schema.organization.id, s.orgId)).limit(1),
    db
      .select({ id: schema.account.id })
      .from(schema.account)
      .where(and(eq(schema.account.userId, s.user.id), eq(schema.account.providerId, "credential")))
      .limit(1),
  ]);
  const hasPassword = Boolean(credential);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and this workspace.</p>
      </div>
      <section aria-labelledby="workspace" className="space-y-4">
        <h2 id="workspace" className="font-semibold">Workspace</h2>
        <Card className="space-y-4">
          {isAdminRole(s.role) ? <WorkspaceForm name={org.name} /> : <p className="text-sm">{org.name}. Ask an owner or admin to change this.</p>}
        </Card>
      </section>
      <section aria-labelledby="account" className="space-y-4">
        <h2 id="account" className="font-semibold">Account</h2>
        <Card className="space-y-4">
          <ProfileForm name={s.user.name} email={s.user.email} />
        </Card>
        {hasPassword && <Card className="space-y-4"><PasswordForm orgId={s.orgId} /></Card>}
      </section>
      <section aria-labelledby="danger" className="space-y-4">
        <h2 id="danger" className="font-semibold text-destructive">Danger zone</h2>
        <Card className="space-y-4">
          {isOwnerRole(s.role) && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">Delete workspace</p>
                <p className="text-sm text-muted-foreground">Removes {org.name}, its projects and its members.</p>
              </div>
              <DeleteWorkspaceButton orgId={s.orgId} name={org.name} />
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">Delete account</p>
              <p className="text-sm text-muted-foreground">Removes your account and signs you out.</p>
            </div>
            <DeleteAccountButton hasPassword={hasPassword} />
          </div>
        </Card>
      </section>
    </div>
  );
}
