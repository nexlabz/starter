"use client";

import { ConfirmButton } from "@/components/confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { attempt, reportAuthError } from "@/lib/feedback";
import type { MemberRole } from "@/lib/team";

export function InviteForm({ emailOn }: { emailOn: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        start(async () => {
          const res = await attempt(() => authClient.organization.inviteMember({ email: String(f.get("email")), role: String(f.get("role")) as "member" | "admin" }));
          if (!res || reportAuthError(res.error, "Could not invite")) return;
          toast.success(emailOn ? "Invitation sent." : "Invitation created. Copy its link below and send it yourself.");
          form.reset();
          router.refresh();
        });
      }}
    >
      <Input name="email" type="email" required placeholder="teammate@company.com" className="w-64" aria-label="Email" />
      <Select name="role" defaultValue="member">
        <SelectTrigger aria-label="Role"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="member">Member</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      <Button pending={pending}>Invite</Button>
    </form>
  );
}

export function RemoveMemberButton({ memberId, name }: { memberId: string; name: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      label="Remove"
      title={`Remove ${name}?`}
      description="They lose access to this workspace straight away. You can invite them again later."
      confirmLabel="Remove member"
      onConfirm={async () => {
        const res = await attempt(() => authClient.organization.removeMember({ memberIdOrEmail: memberId }));
        if (!res || reportAuthError(res.error, "Could not remove member")) return false;
        toast.success(`${name} removed.`);
        router.refresh();
        return true;
      }}
    />
  );
}

export function MemberRoleSelect({ memberId, name, role, roles }: { memberId: string; name: string; role: string; roles: MemberRole[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Select
      value={role}
      disabled={pending}
      onValueChange={(next) =>
        start(async () => {
          const res = await attempt(() => authClient.organization.updateMemberRole({ memberId, role: next as MemberRole }));
          if (!res || reportAuthError(res.error, "Could not change role")) return;
          toast.success(`${name} is now ${next === "member" ? "a member" : `an ${next}`}.`);
          router.refresh();
        })
      }
    >
      <SelectTrigger aria-label={`Role for ${name}`}><SelectValue /></SelectTrigger>
      <SelectContent>
        {roles.map((r) => (<SelectItem key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</SelectItem>))}
      </SelectContent>
    </Select>
  );
}

export function CopyInviteLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button variant="outline"
      onClick={async () => {
        const done = await attempt(() => navigator.clipboard.writeText(link).then(() => true), "Could not copy the link");
        if (!done) return;
        setCopied(true);
        toast.success("Invite link copied.");
      }}
    >
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}

export function CancelInvitationButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      pending={pending}
      onClick={() =>
        start(async () => {
          const res = await attempt(() => authClient.organization.cancelInvitation({ invitationId: id }));
          if (!res || reportAuthError(res.error, "Could not cancel invitation")) return;
          toast.success("Invitation cancelled.");
          router.refresh();
        })
      }
    >
      Cancel
    </Button>
  );
}

export function AcceptInvitation({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="mt-6">
      <Button
        pending={pending}
        onClick={() =>
          start(async () => {
            const res = await attempt(() => authClient.organization.acceptInvitation({ invitationId: id }));
            if (!res || reportAuthError(res.error, "Could not accept")) return;
            toast.success("Invitation accepted.");
            router.push("/dashboard"); router.refresh();
          })
        }
      >
        Accept invitation
      </Button>
    </div>
  );
}
