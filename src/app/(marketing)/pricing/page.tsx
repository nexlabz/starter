import type { Metadata } from "next";
import { PricingTable } from "@/components/pricing-table";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free, monthly, yearly and lifetime plans. Billed per organization.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-center text-4xl font-bold">Pricing</h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted">
        Plans are billed per organization. Start free, upgrade when your team needs more.
      </p>
      <div className="mt-12"><PricingTable /></div>
    </section>
  );
}
