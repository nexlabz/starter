"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { attempt, reportAuthError } from "@/lib/feedback";

export function OrgSwitcher({ activeId }: { activeId: string }) {
  const router = useRouter();
  const { data: orgs } = authClient.useListOrganizations();
  const [pending, start] = useTransition();
  if (!orgs) return null;
  return (
    <Select
      value={activeId}
      disabled={pending}
      onValueChange={(value) => {
        if (value === "__new") return router.push("/onboarding");
        start(async () => {
          const res = await attempt(() => authClient.organization.setActive({ organizationId: value }));
          if (!res || reportAuthError(res.error, "Could not switch workspace")) return;
          toast.success(`Switched to ${orgs.find((o) => o.id === value)?.name ?? "workspace"}.`);
          router.refresh();
        });
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
