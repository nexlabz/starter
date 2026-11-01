"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/action-result";
import { auth } from "@/lib/auth";
import { getPlan } from "@/lib/billing/catalog";
import { billingEnabled } from "@/lib/env";
import { isAdminRole, requireOrgSession } from "@/lib/session";

/**
 * Start a Polar checkout for the ACTIVE organization.
 * reference_id is set here, server-side, after verifying membership. The client
 * never supplies it (the Polar plugin does not check org membership itself).
 */
export async function startCheckout(planKey: string): Promise<ActionResult> {
  const s = await requireOrgSession();
  if (!isAdminRole(s.role)) return { ok: false, message: "Only owners and admins can change billing." };
  if (!billingEnabled()) return { ok: false, message: "Billing is not configured. Add the Polar keys from docs/BILLING.md." };

  const plan = getPlan(planKey);
  if (!plan || plan.mode === "free") return { ok: false, message: "Unknown plan." };

  let url: string | undefined;
  try {
    const res = await auth.api.checkout({
      body: { slug: plan.key, reference_id: s.orgId, redirect: false },
      headers: await headers(),
    });
    url = (res as { url?: string }).url;
  } catch (e) {
    console.error("[billing] checkout failed", e);
  }
  if (!url) return { ok: false, message: "Could not start checkout. Is the product id for this plan set?" };
  redirect(url);
}
