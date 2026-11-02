import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { OnboardingForm } from "@/components/onboarding-form";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create your workspace", robots: { index: false } };

export default async function OnboardingPage() {
  const { user } = await requireSession();
  return (
    <AuthShell>
      <h1 className="text-4xl font-medium">Welcome, {user.name.split(" ")[0]}</h1>
      <p className="mt-2 text-muted-foreground">A workspace is your team&apos;s private space. Everything you create lives inside it.</p>
      <OnboardingForm />
    </AuthShell>
  );
}
