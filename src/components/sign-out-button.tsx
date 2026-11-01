"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <Button variant="outline" onClick={async () => { await authClient.signOut(); router.push("/"); router.refresh(); }}>
      Sign out
    </Button>
  );
}
