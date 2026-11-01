"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { attempt, reportAuthError } from "@/lib/feedback";

export function SignOutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      pending={pending}
      onClick={() =>
        start(async () => {
          const res = await attempt(() => authClient.signOut());
          if (!res || reportAuthError(res.error, "Could not sign out")) return;
          router.push("/");
          router.refresh();
        })
      }
    >
      Sign out
    </Button>
  );
}
