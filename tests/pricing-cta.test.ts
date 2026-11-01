import { describe, expect, it } from "vitest";
import { pricingCtaTarget } from "@/lib/billing/cta";
import { paidPlans } from "@/lib/billing/catalog";

const paid = paidPlans()[0].key;

describe("pricingCtaTarget", () => {
  it("sends visitors to sign-up whatever the plan or billing state", () => {
    for (const billing of [true, false]) {
      for (const planKey of [paid, "free", "nope", null]) {
        expect(pricingCtaTarget({ signedIn: false, billing, planKey })).toBe("/sign-up");
      }
    }
  });

  it("sends signed-in users on a paid plan to billing", () => {
    expect(pricingCtaTarget({ signedIn: true, billing: true, planKey: paid })).toBe("/billing");
  });

  it("does not strand signed-in users on billing when it is off", () => {
    expect(pricingCtaTarget({ signedIn: true, billing: false, planKey: paid })).toBe("/dashboard");
  });

  it("sends free and unknown plans to the dashboard", () => {
    expect(pricingCtaTarget({ signedIn: true, billing: true, planKey: "free" })).toBe("/dashboard");
    expect(pricingCtaTarget({ signedIn: true, billing: true, planKey: "nope" })).toBe("/dashboard");
    expect(pricingCtaTarget({ signedIn: true, billing: true, planKey: null })).toBe("/dashboard");
  });
});
