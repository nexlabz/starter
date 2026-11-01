"use client";

import { authClient } from "@/lib/auth-client";

/** Opens Polar's customer portal (invoices, payment method, cancel) for the signed-in purchaser. */
export function PortalButton() {
  return <button className="btn" onClick={() => authClient.customer.portal()}>Manage subscription &amp; invoices</button>;
}
