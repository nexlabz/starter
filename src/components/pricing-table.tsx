import { buttonVariants } from "@/components/ui/button";
import { Tray } from "@/components/ui/card";
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
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {PLANS.map((p) => (
        <section key={p.key} aria-labelledby={`plan-${p.key}`} className="flex">
          <Tray
            signal={p.highlight}
            className="flex-1"
            foot={cta ? cta(p) : (
              <Link href={`/start?plan=${p.key}`} prefetch={false} rel="nofollow" className={cn(buttonVariants({ variant: p.highlight ? "signal" : "outline" }), "w-full")}>
                {p.mode === "free" ? "Start free" : "Get started"}
              </Link>
            )}
          >
            <h3 id={`plan-${p.key}`} className="text-xl font-medium">{p.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
            <p className="mt-6 flex items-baseline gap-2">
              <span className="dot-numeral text-5xl">{priceLabel(p)}</span>
              <span className="text-sm text-muted-foreground">{suffix(p)}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0" aria-hidden />{f}</li>
              ))}
            </ul>
          </Tray>
        </section>
      ))}
    </div>
  );
}
