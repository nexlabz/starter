import { describe, expect, it } from "vitest";
import { PLANS, checkoutProducts, getPlan, paidPlans, planKeyForProduct } from "@/lib/billing/catalog";

describe("billing catalog", () => {
  it("has unique keys and exactly one free plan", () => {
    expect(new Set(PLANS.map((p) => p.key)).size).toBe(PLANS.length);
    expect(PLANS.filter((p) => p.mode === "free")).toHaveLength(1);
  });

  it("every paid plan names its Polar product env var and has a price", () => {
    for (const p of paidPlans()) {
      expect(p.productEnv, p.key).toBeTruthy();
      expect(p.priceUsd, p.key).toBeGreaterThan(0);
    }
  });

  it("subscriptions have an interval, one-time plans do not", () => {
    for (const p of PLANS) {
      if (p.mode === "subscription") expect(p.interval, p.key).toBeTruthy();
      if (p.mode === "one_time") expect(p.interval, p.key).toBeUndefined();
    }
  });

  it("maps product ids to plan keys and back to checkout slugs", () => {
    const env = { POLAR_PRODUCT_PRO_MONTHLY: "m", POLAR_PRODUCT_LIFETIME: "l" };
    expect(planKeyForProduct("m", env)).toBe("pro_monthly");
    expect(planKeyForProduct("nope", env)).toBeNull();
    expect(checkoutProducts(env).map((p) => p.slug).sort()).toEqual(["lifetime", "pro_monthly"]);
    expect(getPlan("free")?.limits.projects).toBeGreaterThan(0);
  });
});
