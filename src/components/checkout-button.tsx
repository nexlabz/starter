"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { startCheckout } from "@/app/(app)/billing/actions";
import { attempt, reportResult } from "@/lib/feedback";

/** Starts a Polar checkout. Success redirects away, so only failures come back here. */
export function CheckoutButton({ plan, ...props }: { plan: string } & React.ComponentProps<typeof Button>) {
  const [pending, start] = useTransition();
  return (
    <Button
      {...props}
      pending={pending}
      onClick={() =>
        start(async () => {
          const res = await attempt(() => startCheckout(plan));
          if (res) reportResult(res);
        })
      }
    />
  );
}
