import { Card } from "@/components/ui/card";
import type { Metadata } from "next";
import { Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { CheckoutButton } from "@/components/checkout-button";
import { PortalButton } from "@/components/portal-button";
import { PricingTable } from "@/components/pricing-table";
import { db } from "@/db";
import { getEntitlement } from "@/lib/billing/entitlements";
import { billingEnabled, getEnv } from "@/lib/env";
import { isAdminRole, requireOrgSession } from "@/lib/session";

export const metadata: Metadata = { title: "Billing" };

const paidBy = {
  free: "No payment needed",
  subscription: "Renews automatically",
  purchase: "Paid once, yours for good",
};

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const s = await requireOrgSession();
  const { checkout } = await searchParams;
  const ent = await getEntitlement(db, s.orgId);
  const enabled = billingEnabled();
  const env = getEnv();

  const admin = isAdminRole(s.role);

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" action={enabled && ent.source === "subscription" ? <PortalButton /> : undefined}>Plans apply to this whole workspace.</PageHeader>
      <Card className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
        <p className="text-2xl font-medium">{ent.plan.name} plan</p>
        <p className="text-sm text-muted-foreground">{paidBy[ent.source]}</p>
      </Card>
      {checkout === "success" && <Notice>Thanks! Your plan updates as soon as the payment confirmation arrives, usually within seconds. Refresh if it still shows the old plan.</Notice>}
      {!enabled && <Notice>Payments are off because no Polar keys are set, so every workspace stays on Free. See docs/BILLING.md to turn on the sandbox in about 5 minutes.</Notice>}
      {enabled && env.POLAR_SERVER === "sandbox" && <Notice>Polar is in sandbox mode: test cards only, no real money.</Notice>}
      {enabled && !admin && <Notice>Only owners and admins can change the plan.</Notice>}
      <h2 className="pt-2 text-xl font-medium">Compare plans</h2>
      <PricingTable
        cta={(p) => {
          if (p.mode === "free") return <span className="block py-3 text-center text-sm text-muted-foreground">{ent.plan.key === "free" ? "Current plan" : "Included"}</span>;
          if (ent.plan.key === p.key) return <span className="block py-3 text-center text-sm font-semibold">Current plan</span>;
          const configured = p.productEnv ? Boolean(env[p.productEnv]) : false;
          return (
            <CheckoutButton plan={p.key} variant={p.highlight ? "signal" : "outline"} className="w-full" disabled={!enabled || !configured || !admin}>
              {configured || !enabled ? (p.mode === "one_time" ? "Buy once" : "Subscribe") : "Product not set"}
            </CheckoutButton>
          );
        }}
      />
    </div>
  );
}
