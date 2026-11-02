import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { googleEnabled } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in", alternates: { canonical: "/sign-in" } };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AuthShell>
      <Suspense>
        <AuthForm mode="sign-in" google={googleEnabled()} />
      </Suspense>
    </AuthShell>
  );
}
