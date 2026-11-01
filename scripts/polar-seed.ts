import { createPolar } from "@polar-sh/sdk/2026-10";
import { PLANS } from "../src/lib/billing/catalog";

// Creates one Polar SANDBOX product per paid plan in catalog.ts and prints the env lines to paste.
// Re-running reuses products by name, so it never creates duplicates.
async function main() {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) throw new Error("POLAR_ACCESS_TOKEN is not set. Create one in the Polar sandbox (see docs/BILLING.md).");
  if ((process.env.POLAR_SERVER ?? "sandbox") !== "sandbox") throw new Error("Seeding only runs against the sandbox.");

  const polar = createPolar({ accessToken, environment: "sandbox" });
  const existing = await polar.products.list({ limit: 100 });
  const lines: string[] = [];

  for (const plan of PLANS) {
    if (plan.mode === "free" || !plan.productEnv) continue;
    const found = existing.items.find((p) => p.name === plan.name);
    if (found) {
      lines.push(`${plan.productEnv}=${found.id}`);
      console.log(`exists   ${plan.name}`);
      continue;
    }
    const price = { amount_type: "fixed" as const, price_currency: "usd" as const, price_amount: plan.priceUsd * 100 };
    const product = await polar.products.create(
      plan.mode === "subscription"
        ? { name: plan.name, description: plan.blurb, recurring_interval: plan.interval!, prices: [price] }
        : { name: plan.name, description: plan.blurb, prices: [price] },
    );
    lines.push(`${plan.productEnv}=${product.id}`);
    console.log(`created  ${plan.name}`);
  }
  console.log(`\nAdd these to .env:\n\n${lines.join("\n")}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
