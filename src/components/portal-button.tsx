"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

/** Opens Polar's customer portal (invoices, payment method, cancel) for the signed-in purchaser. */
export function PortalButton() {
  return <Button variant="outline" onClick={() => authClient.customer.portal()}>Manage subscription &amp; invoices</Button>;
}
