"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function InviteForm({ emailOn }: { emailOn: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const f = new FormData(e.currentTarget);
        const res = await authClient.organization.inviteMember({ email: String(f.get("email")), role: String(f.get("role")) as "member" | "admin" });
        setBusy(false);
        setMsg(res.error ? { ok: false, text: res.error.message ?? "Could not invite" } : { ok: true, text: emailOn ? "Invitation sent." : "Invitation created. Copy its link below and send it yourself." });
        if (!res.error) { (e.target as HTMLFormElement).reset(); router.refresh(); }
      }}
    >
      <input name="email" type="email" required placeholder="teammate@company.com" className="input !w-64" aria-label="Email" />
      <select name="role" className="input !w-auto" aria-label="Role" defaultValue="member"><option value="member">Member</option><option value="admin">Admin</option></select>
      <button className="btn btn-primary" disabled={busy}>Invite</button>
      {msg && <p role="status" className={`w-full text-sm ${msg.ok ? "text-muted" : "text-danger"}`}>{msg.text}</p>}
    </form>
  );
}

export function RemoveMemberButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  return (
    <button className="btn" onClick={async () => { await authClient.organization.removeMember({ memberIdOrEmail: memberId }); router.refresh(); }}>
      Remove
    </button>
  );
}

export function CopyInviteLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn"
      onClick={async () => {
        await navigator.clipboard.writeText(link);
        setCopied(true);
      }}
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

export function CancelInvitationButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button className="btn" onClick={async () => { await authClient.organization.cancelInvitation({ invitationId: id }); router.refresh(); }}>
      Cancel
    </button>
  );
}

export function AcceptInvitation({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="mt-6">
      <button
        className="btn btn-primary"
        onClick={async () => {
          const res = await authClient.organization.acceptInvitation({ invitationId: id });
          if (res.error) return setError(res.error.message ?? "Could not accept");
          router.push("/dashboard"); router.refresh();
        }}
      >
        Accept invitation
      </button>
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}
