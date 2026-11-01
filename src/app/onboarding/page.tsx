import type { Metadata } from "next";
import { OnboardingForm } from "@/components/onboarding-form";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create your workspace", robots: { index: false } };

export default async function OnboardingPage() {
  const { user } = await requireSession();
  return (
    <main className="mx-auto w-full max-w-sm px-6 py-24">
      <h1 className="text-2xl font-bold">Welcome, {user.name.split(" ")[0]}</h1>
      <p className="mt-2 text-sm text-muted">A workspace is your team&apos;s private space. Everything you create lives inside it.</p>
      <OnboardingForm />
    </main>
  );
}
