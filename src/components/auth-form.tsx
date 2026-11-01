"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

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
          <label className="block text-sm">Name<input name="name" required className="input mt-1" autoComplete="name" /></label>
        )}
        <label className="block text-sm">Email<input name="email" type="email" required className="input mt-1" autoComplete="email" /></label>
        <label className="block text-sm">Password<input name="password" type="password" required minLength={10} className="input mt-1" autoComplete={mode === "sign-up" ? "new-password" : "current-password"} /></label>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? "…" : mode === "sign-up" ? "Sign up" : "Sign in"}</button>
      </form>
      {google && (
        <button className="btn mt-3 w-full" onClick={() => authClient.signIn.social({ provider: "google", callbackURL: dest })}>
          Continue with Google
        </button>
      )}
      <p className="mt-6 text-sm text-muted">
        {mode === "sign-up" ? (<>Have an account? <Link className="underline" href="/sign-in">Sign in</Link></>) : (<>New here? <Link className="underline" href="/sign-up">Create an account</Link></>)}
      </p>
    </div>
  );
}
