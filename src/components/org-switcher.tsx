"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";

export function OrgSwitcher({ activeId }: { activeId: string }) {
  const router = useRouter();
  const { data: orgs } = authClient.useListOrganizations();
  if (!orgs) return null;
  return (
    <Select
      value={activeId}
      onValueChange={async (value) => {
        if (value === "__new") return router.push("/onboarding");
        await authClient.organization.setActive({ organizationId: value });
        router.refresh();
      }}
    >
      <SelectTrigger aria-label="Switch workspace"><SelectValue /></SelectTrigger>
      <SelectContent>
        {orgs.map((o) => (<SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>))}
        <SelectItem value="__new"><span className="inline-flex items-center gap-1"><Plus className="size-4" aria-hidden />New workspace</span></SelectItem>
      </SelectContent>
    </Select>
  );
}
