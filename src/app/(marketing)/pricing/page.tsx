import type { Metadata } from "next";
import { PricingTable } from "@/components/pricing-table";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free, monthly, yearly and lifetime plans. Billed per organization.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <h1 className="text-[clamp(2.6rem,6vw,5rem)] leading-none font-medium tracking-[-0.04em]">Pricing</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Plans are billed per organization. Start free, upgrade when your team needs more.
      </p>
      <div className="mt-12"><PricingTable /></div>
    </section>
  );
}
