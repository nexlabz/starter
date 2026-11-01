"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { attempt, reportAuthError } from "@/lib/feedback";

export function InviteForm({ emailOn }: { emailOn: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const form = e.currentTarget;
        const f = new FormData(form);
        const res = await attempt(() => authClient.organization.inviteMember({ email: String(f.get("email")), role: String(f.get("role")) as "member" | "admin" }));
        setBusy(false);
        if (!res || reportAuthError(res.error, "Could not invite")) return;
        toast.success(emailOn ? "Invitation sent." : "Invitation created. Copy its link below and send it yourself.");
        form.reset();
        router.refresh();
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
      <Button disabled={busy}>Invite</Button>
    </form>
  );
}

export function RemoveMemberButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      onClick={async () => {
        const res = await attempt(() => authClient.organization.removeMember({ memberIdOrEmail: memberId }));
        if (!res || reportAuthError(res.error, "Could not remove member")) return;
        toast.success("Member removed.");
        router.refresh();
      }}
    >
      Remove
    </Button>
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
  return (
    <Button
      variant="outline"
      onClick={async () => {
        const res = await attempt(() => authClient.organization.cancelInvitation({ invitationId: id }));
        if (!res || reportAuthError(res.error, "Could not cancel invitation")) return;
        toast.success("Invitation cancelled.");
        router.refresh();
      }}
    >
      Cancel
    </Button>
  );
}

export function AcceptInvitation({ id }: { id: string }) {
  const router = useRouter();
  return (
    <div className="mt-6">
      <Button
        onClick={async () => {
          const res = await attempt(() => authClient.organization.acceptInvitation({ invitationId: id }));
          if (!res || reportAuthError(res.error, "Could not accept")) return;
          toast.success("Invitation accepted.");
          router.push("/dashboard"); router.refresh();
        }}
      >
        Accept invitation
      </Button>
    </div>
  );
}
