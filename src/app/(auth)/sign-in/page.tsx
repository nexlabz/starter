import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { googleEnabled } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in", alternates: { canonical: "/sign-in" } };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <AuthForm mode="sign-in" google={googleEnabled()} />
      </Suspense>
    </>
  );
}
