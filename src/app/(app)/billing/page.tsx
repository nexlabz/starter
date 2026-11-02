import { Card } from "@/components/ui/card";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { CheckoutButton } from "@/components/checkout-button";
import { PortalButton } from "@/components/portal-button";
import { PricingTable } from "@/components/pricing-table";
import { db } from "@/db";
import { getEntitlement } from "@/lib/billing/entitlements";
import { billingEnabled, getEnv } from "@/lib/env";
import { isAdminRole, requireOrgSession } from "@/lib/session";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const s = await requireOrgSession();
  const { checkout } = await searchParams;
  const ent = await getEntitlement(db, s.orgId);
  const enabled = billingEnabled();
  const env = getEnv();

  return (
    <div className="space-y-6">
      <PageHeader title="Billing">You&apos;re on <strong className="font-semibold text-foreground">{ent.plan.name}</strong> ({ent.source}). Billing is per workspace.</PageHeader>
      {checkout === "success" && <Card role="status" className="text-sm">Thanks! Your plan updates as soon as the payment confirmation arrives (usually seconds). Refresh if it still shows the old plan.</Card>}
      {!enabled && <Card className="text-sm">Billing is <strong>off</strong> (no Polar keys). You are on the Free plan. See docs/BILLING.md to enable the sandbox in about 5 minutes.</Card>}
      {enabled && <p className="text-xs text-muted-foreground">Polar environment: {env.POLAR_SERVER}{env.POLAR_SERVER === "sandbox" ? " (test cards only, no real money)" : ""}</p>}
      <PricingTable
        cta={(p) => {
          if (p.mode === "free") return <span className="block py-3 text-center text-sm text-muted-foreground">{ent.plan.key === "free" ? "Current plan" : "Included"}</span>;
          if (ent.plan.key === p.key) return <span className="block py-3 text-center text-sm font-semibold">Current plan</span>;
          const configured = p.productEnv ? Boolean(env[p.productEnv]) : false;
          return (
            <CheckoutButton plan={p.key} variant={p.highlight ? "signal" : "outline"} className="w-full" disabled={!enabled || !configured || !isAdminRole(s.role)}>
              {configured || !enabled ? (p.mode === "one_time" ? "Buy once" : "Subscribe") : "Product not set"}
            </CheckoutButton>
          );
        }}
      />
      {enabled && ent.source === "subscription" && <PortalButton />}
    </div>
  );
}
