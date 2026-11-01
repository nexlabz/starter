"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { attempt, reportAuthError } from "@/lib/feedback";

export function AuthForm({ mode, google }: { mode: "sign-in" | "sign-up"; google: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    const res =
      mode === "sign-up"
        ? await authClient.signUp.email({ email, password, name: String(f.get("name")) })
        : await authClient.signIn.email({ email, password });
    setBusy(false);
    if (res.error) return setError(res.error.message ?? "Something went wrong");
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-16">
      <h1 className="text-2xl font-bold">{mode === "sign-up" ? "Create your account" : "Welcome back"}</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "sign-up" && (
          <label className="block text-sm">Name<Input name="name" required className="mt-1" autoComplete="name" /></label>
        )}
        <label className="block text-sm">Email<Input name="email" type="email" required className="mt-1" autoComplete="email" /></label>
        <label className="block text-sm">Password<Input name="password" type="password" required minLength={10} className="mt-1" autoComplete={mode === "sign-up" ? "new-password" : "current-password"} /></label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button className="w-full" disabled={busy}>{busy ? "…" : mode === "sign-up" ? "Sign up" : "Sign in"}</Button>
      </form>
      {google && (
        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={async () => {
            const res = await attempt(() => authClient.signIn.social({ provider: "google", callbackURL: dest }));
            if (res) reportAuthError(res.error, "Could not sign in with Google");
          }}
        >
          Continue with Google
        </Button>
      )}
      <p className="mt-6 text-sm text-muted-foreground">
        {mode === "sign-up" ? (<>Have an account? <Link className="underline" href="/sign-in">Sign in</Link></>) : (<>New here? <Link className="underline" href="/sign-up">Create an account</Link></>)}
      </p>
    </div>
  );
}
