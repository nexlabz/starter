"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPlan } from "@/lib/billing/catalog";
import { billingEnabled } from "@/lib/env";
import { isAdminRole, requireOrgSession } from "@/lib/session";

/**
 * Start a Polar checkout for the ACTIVE organization.
 * reference_id is set here, server-side, after verifying membership. The client
 * never supplies it (the Polar plugin does not check org membership itself).
 */
export async function startCheckout(formData: FormData) {
  const s = await requireOrgSession();
  if (!isAdminRole(s.role)) redirect("/billing?error=forbidden");
  if (!billingEnabled()) redirect("/billing?error=disabled");

  const plan = getPlan(String(formData.get("plan")));
  if (!plan || plan.mode === "free") redirect("/billing?error=plan");

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
  if (!url) redirect("/billing?error=checkout");
  redirect(url);
}
