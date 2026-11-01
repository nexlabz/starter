"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { attempt, reportAuthError } from "@/lib/feedback";

export function WorkspaceForm({ name }: { name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const next = String(new FormData(e.currentTarget).get("name")).trim();
        start(async () => {
          const res = await attempt(() => authClient.organization.update({ data: { name: next } }));
          if (!res || reportAuthError(res.error, "Could not rename workspace")) return;
          toast.success("Workspace renamed.");
          router.refresh();
        });
      }}
    >
      <label className="block text-sm">Workspace name<Input name="name" required minLength={2} defaultValue={name} className="mt-1" /></label>
      <Button pending={pending}>Save</Button>
    </form>
  );
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const next = String(new FormData(e.currentTarget).get("name")).trim();
        start(async () => {
          const res = await attempt(() => authClient.updateUser({ name: next }));
          if (!res || reportAuthError(res.error, "Could not update your name")) return;
          toast.success("Name updated.");
          router.refresh();
        });
      }}
    >
      <label className="block text-sm">Name<Input name="name" required defaultValue={name} className="mt-1" autoComplete="name" /></label>
      <p className="text-sm text-muted-foreground">Signed in as {email}</p>
      <Button pending={pending}>Save</Button>
    </form>
  );
}

export function PasswordForm({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        start(async () => {
          const res = await attempt(() =>
            authClient.changePassword({
              currentPassword: String(f.get("current")),
              newPassword: String(f.get("next")),
              revokeOtherSessions: true,
            }),
          );
          if (!res || reportAuthError(res.error, "Could not change password")) return;
          // Revoking sessions issues a new one, which starts in the user's first workspace.
          await attempt(() => authClient.organization.setActive({ organizationId: orgId }));
          toast.success("Password changed. Other devices were signed out.");
          form.reset();
          router.refresh();
        });
      }}
    >
      <label className="block text-sm">Current password<Input name="current" type="password" required className="mt-1" autoComplete="current-password" /></label>
      <label className="block text-sm">New password<Input name="next" type="password" required minLength={10} className="mt-1" autoComplete="new-password" /></label>
      <Button pending={pending}>Change password</Button>
    </form>
  );
}

export function DeleteWorkspaceButton({ orgId, name }: { orgId: string; name: string }) {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  return (
    <ConfirmButton
      label="Delete workspace"
      title={`Delete ${name}?`}
      description="This deletes its projects and removes every member. It cannot be undone."
      confirmLabel="Delete workspace"
      confirmDisabled={typed !== name}
      onConfirm={async () => {
        const res = await attempt(() => authClient.organization.delete({ organizationId: orgId }));
        if (!res || reportAuthError(res.error, "Could not delete workspace")) return false;
        toast.success(`${name} deleted.`);
        // Deleting clears the active workspace, so move to another one if there is one.
        const orgs = await attempt(() => authClient.organization.list());
        const next = orgs?.data?.[0];
        if (next) await attempt(() => authClient.organization.setActive({ organizationId: next.id }));
        router.push(next ? "/dashboard" : "/onboarding");
        router.refresh();
        return true;
      }}
    >
      <label className="mt-4 block text-sm">Type <strong>{name}</strong> to confirm<Input value={typed} onChange={(e) => setTyped(e.target.value)} className="mt-1" autoComplete="off" /></label>
    </ConfirmButton>
  );
}

export function DeleteAccountButton({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  return (
    <ConfirmButton
      label="Delete account"
      title="Delete your account?"
      description="This removes your account and your access to every workspace. It cannot be undone."
      confirmLabel="Delete account"
      confirmDisabled={hasPassword && password.length === 0}
      onConfirm={async () => {
        const res = await attempt(() => authClient.deleteUser(hasPassword ? { password } : {}));
        if (!res || reportAuthError(res.error, "Could not delete account")) return false;
        toast.success("Account deleted.");
        router.push("/");
        router.refresh();
        return true;
      }}
    >
      {hasPassword && (
        <label className="mt-4 block text-sm">Password<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" autoComplete="current-password" /></label>
      )}
    </ConfirmButton>
  );
}
