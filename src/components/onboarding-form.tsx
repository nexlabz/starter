"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function OnboardingForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const name = String(new FormData(e.currentTarget).get("name"));
    // Random suffix keeps slugs unique without a round trip.
    const slug = `${slugify(name) || "workspace"}-${Math.random().toString(36).slice(2, 6)}`;
    const res = await authClient.organization.create({ name, slug });
    if (res.error || !res.data) {
      setBusy(false);
      return setError(res.error?.message ?? "Could not create workspace");
    }
    await authClient.organization.setActive({ organizationId: res.data.id });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block text-sm">Workspace name<Input name="name" required minLength={2} className="mt-1" placeholder="Acme Inc." /></label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button className="w-full" disabled={busy}>{busy ? "Creating…" : "Create workspace"}</Button>
    </form>
  );
}
