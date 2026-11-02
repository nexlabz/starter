"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type Feature = { t: string; d: string; proof: string };

/** One feature in focus at a time. Every panel stays in the HTML for crawlers. */
export function FeatureTabs({ features }: { features: Feature[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      <ul className="space-y-1">
        {features.map((f, i) => (
          <li key={f.t}>
            <button
              type="button"
              aria-expanded={i === active}
              aria-controls={`feature-${i}`}
              onClick={() => setActive(i)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setActive(i); }}
              className={cn(
                "cursor-pointer text-left text-[clamp(1.6rem,3.4vw,2.6rem)] leading-[1.2] font-medium tracking-[-0.03em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                i === active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.t}
            </button>
          </li>
        ))}
      </ul>
      <div className="self-end rounded-[26px] bg-tray p-1.5">
        {features.map((f, i) => (
          <div key={f.t} id={`feature-${i}`} hidden={i !== active} className="rounded-[20px] border border-border bg-card p-6 shadow-sheet">
            <p className="text-lg leading-relaxed">{f.d}</p>
            <p className="mt-8 overflow-x-auto rounded-xl bg-muted px-4 py-3 font-mono text-sm whitespace-nowrap text-muted-foreground">{f.proof}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
