import { getPlan } from "./catalog";

/** Where a pricing button leads. The page stays static; /start decides per request. */
export function pricingCtaTarget({ signedIn, billing, planKey }: { signedIn: boolean; billing: boolean; planKey: string | null }) {
  if (!signedIn) return "/sign-up";
  const plan = planKey ? getPlan(planKey) : undefined;
  return billing && plan && plan.mode !== "free" ? "/billing" : "/dashboard";
}
