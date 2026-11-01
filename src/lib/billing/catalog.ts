/**
 * SINGLE SOURCE OF TRUTH for plans. The pricing page, checkout, entitlements,
 * webhook mapping and tests all read from here. To change what you sell:
 *   1. edit PLANS below,
 *   2. create the matching product in Polar (see docs/BILLING.md),
 *   3. put its id in the env var named by `productEnv`.
 * Display prices are for the UI only; Polar charges what the product says.
 */
export type PlanMode = "free" | "subscription" | "one_time";

export type PlanLimits = { projects: number; seats: number };

export type Plan = {
  key: string;
  name: string;
  mode: PlanMode;
  /** Billing interval for subscriptions. */
  interval?: "month" | "year";
  /** UI only, in USD. */
  priceUsd: number;
  blurb: string;
  features: string[];
  limits: PlanLimits;
  /** Higher rank wins when an org holds several entitlements. */
  rank: number;
  /** Env var holding the Polar product id (paid plans only). */
  productEnv?: PolarProductEnv;
  highlight?: boolean;
};

export type PolarProductEnv = "POLAR_PRODUCT_PRO_MONTHLY" | "POLAR_PRODUCT_PRO_YEARLY" | "POLAR_PRODUCT_LIFETIME";

export const PLANS: Plan[] = [
  {
    key: "free",
    name: "Free",
    mode: "free",
    priceUsd: 0,
    blurb: "Try everything with a small workspace.",
    features: ["3 projects", "Up to 3 team members", "Community support"],
    limits: { projects: 3, seats: 3 },
    rank: 0,
  },
  {
    key: "pro_monthly",
    name: "Pro",
    mode: "subscription",
    interval: "month",
    priceUsd: 19,
    blurb: "For growing teams. Cancel any time.",
    features: ["50 projects", "Up to 25 team members", "Email support"],
    limits: { projects: 50, seats: 25 },
    rank: 10,
    productEnv: "POLAR_PRODUCT_PRO_MONTHLY",
    highlight: true,
  },
  {
    key: "pro_yearly",
    name: "Pro (yearly)",
    mode: "subscription",
    interval: "year",
    priceUsd: 190,
    blurb: "Two months free versus monthly.",
    features: ["50 projects", "Up to 25 team members", "Email support"],
    limits: { projects: 50, seats: 25 },
    rank: 10,
    productEnv: "POLAR_PRODUCT_PRO_YEARLY",
  },
  {
    key: "lifetime",
    name: "Lifetime",
    mode: "one_time",
    priceUsd: 299,
    blurb: "Pay once, keep it forever.",
    features: ["200 projects", "Up to 100 team members", "Priority support"],
    limits: { projects: 200, seats: 100 },
    rank: 20,
    productEnv: "POLAR_PRODUCT_LIFETIME",
  },
];

export const FREE_PLAN = PLANS[0];

export const paidPlans = () => PLANS.filter((p) => p.mode !== "free");

export function getPlan(key: string | null | undefined): Plan | undefined {
  return PLANS.find((p) => p.key === key);
}

/** Resolve a Polar product id to a plan key using the env mapping. */
export function planKeyForProduct(productId: string, env: Record<string, string | undefined>): string | null {
  for (const plan of paidPlans()) {
    if (plan.productEnv && env[plan.productEnv] === productId) return plan.key;
  }
  return null;
}

/** slug -> productId pairs for the Polar checkout plugin (skips plans whose env var is unset). */
export function checkoutProducts(env: Record<string, string | undefined>): { slug: string; productId: string }[] {
  return paidPlans().flatMap((p) => {
    const productId = p.productEnv ? env[p.productEnv] : undefined;
    return productId ? [{ slug: p.key, productId }] : [];
  });
}
