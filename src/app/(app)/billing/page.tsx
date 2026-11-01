import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Metadata } from "next";
import { PortalButton } from "@/components/portal-button";
import { PricingTable } from "@/components/pricing-table";
import { db } from "@/db";
import { getEntitlement } from "@/lib/billing/entitlements";
import { billingEnabled, getEnv } from "@/lib/env";
import { isAdminRole, requireOrgSession } from "@/lib/session";
import { startCheckout } from "./actions";

export const metadata: Metadata = { title: "Billing" };

const errors: Record<string, string> = {
  forbidden: "Only owners and admins can change billing.",
  disabled: "Billing is not configured. Add the Polar keys from docs/BILLING.md.",
  plan: "Unknown plan.",
  checkout: "Could not start checkout. Is the product id for this plan set?",
};

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ error?: string; checkout?: string }> }) {
  const s = await requireOrgSession();
  const { error, checkout } = await searchParams;
  const ent = await getEntitlement(db, s.orgId);
  const enabled = billingEnabled();
  const env = getEnv();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">Current plan: <strong>{ent.plan.name}</strong> ({ent.source}). Billing is per workspace.</p>
      </div>
      {checkout === "success" && <Card role="status" className="text-sm">Thanks! Your plan updates as soon as the payment confirmation arrives (usually seconds). Refresh if it still shows the old plan.</Card>}
      {error && <p role="alert" className="text-sm text-destructive">{errors[error] ?? "Something went wrong."}</p>}
      {!enabled && <Card className="text-sm">Billing is <strong>off</strong> (no Polar keys). You are on the Free plan. See docs/BILLING.md to enable the sandbox in about 5 minutes.</Card>}
      {enabled && <p className="text-xs text-muted-foreground">Polar environment: {env.POLAR_SERVER}{env.POLAR_SERVER === "sandbox" ? " (test cards only, no real money)" : ""}</p>}
      <PricingTable
        cta={(p) => {
          if (p.mode === "free") return <span className="block text-center text-sm text-muted-foreground">{ent.plan.key === "free" ? "Current plan" : "Included"}</span>;
          if (ent.plan.key === p.key) return <span className="block text-center text-sm font-semibold">Current plan</span>;
          const configured = p.productEnv ? Boolean(env[p.productEnv]) : false;
          return (
            <form action={startCheckout}>
              <input type="hidden" name="plan" value={p.key} />
              <Button variant={p.highlight ? "default" : "outline"} className="w-full" disabled={!enabled || !configured || !isAdminRole(s.role)}>
                {configured || !enabled ? (p.mode === "one_time" ? "Buy once" : "Subscribe") : "Product not set"}
              </Button>
            </form>
          );
        }}
      />
      {enabled && ent.source === "subscription" && <PortalButton />}
    </div>
  );
}
