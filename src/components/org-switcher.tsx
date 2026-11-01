"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function OrgSwitcher({ activeId }: { activeId: string }) {
  const router = useRouter();
  const { data: orgs } = authClient.useListOrganizations();
  if (!orgs) return null;
  return (
    <select
      aria-label="Switch workspace"
      className="input !w-auto"
      value={activeId}
      onChange={async (e) => {
        if (e.target.value === "__new") return router.push("/onboarding");
        await authClient.organization.setActive({ organizationId: e.target.value });
        router.refresh();
      }}
    >
      {orgs.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
      <option value="__new">+ New workspace…</option>
    </select>
  );
}
