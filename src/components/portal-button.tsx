"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { attempt, reportAuthError } from "@/lib/feedback";

/** Opens Polar's customer portal (invoices, payment method, cancel) for the signed-in purchaser. */
export function PortalButton() {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      pending={pending}
      onClick={() =>
        start(async () => {
          const res = await attempt(() => authClient.customer.portal());
          if (res) reportAuthError(res.error, "Could not open the customer portal");
        })
      }
    >
      Manage subscription &amp; invoices
    </Button>
  );
}
