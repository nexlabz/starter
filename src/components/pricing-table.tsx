import { buttonVariants } from "@/components/ui/button";
import { cardStyles } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";
import { PLANS, type Plan } from "@/lib/billing/catalog";

function priceLabel(p: Plan) {
  if (p.mode === "free") return "$0";
  return `$${p.priceUsd}`;
}
function suffix(p: Plan) {
  if (p.mode === "free") return "forever";
  if (p.mode === "one_time") return "one-time";
  return p.interval === "year" ? "/ year" : "/ month";
}

/** Read-only pricing grid driven by the catalog. `cta` renders the action per plan. */
export function PricingTable({ cta }: { cta?: (plan: Plan) => React.ReactNode }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {PLANS.map((p) => (
        <section key={p.key} className={cn(cardStyles, "flex flex-col", p.highlight && "ring-2 ring-primary")} aria-labelledby={`plan-${p.key}`}>
          <h3 id={`plan-${p.key}`} className="text-lg font-semibold">{p.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
          <p className="mt-4 text-3xl font-bold">
            {priceLabel(p)} <span className="text-sm font-normal text-muted-foreground">{suffix(p)}</span>
          </p>
          <ul className="mt-4 flex-1 space-y-2 text-sm">
            {p.features.map((f) => (
              <li key={f} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />{f}</li>
            ))}
          </ul>
          <div className="mt-5">
            {cta ? cta(p) : (
              <Link href={`/start?plan=${p.key}`} prefetch={false} rel="nofollow" className={cn(buttonVariants({ variant: p.highlight ? "default" : "outline" }), "w-full")}>
                {p.mode === "free" ? "Start free" : "Get started"}
              </Link>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
