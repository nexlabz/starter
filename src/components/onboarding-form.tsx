"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { attempt } from "@/lib/feedback";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function OnboardingForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const name = String(new FormData(e.currentTarget).get("name"));
    // Random suffix keeps slugs unique without a round trip.
    const slug = `${slugify(name) || "workspace"}-${Math.random().toString(36).slice(2, 6)}`;
    start(async () => {
      const res = await attempt(() => authClient.organization.create({ name, slug }));
      if (!res) return;
      if (res.error || !res.data) return setError(res.error?.message ?? "Could not create workspace");
      const organizationId = res.data.id;
      const active = await attempt(() => authClient.organization.setActive({ organizationId }));
      if (!active) return;
      if (active.error) return setError(active.error.message ?? "Workspace created, but could not open it");
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block text-sm">Workspace name<Input name="name" required minLength={2} className="mt-1" placeholder="Acme Inc." /></label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button className="w-full" pending={pending}>Create workspace</Button>
    </form>
  );
}
