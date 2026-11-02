import { cn } from "@/lib/utils";

const MAX_CELLS = 50;

/** Usage drawn in the same pixels as the hero. One cell per unit, scaled above 50. */
export function DotMeter({ used, limit, className }: { used: number; limit: number; className?: string }) {
  const cells = Math.min(limit, MAX_CELLS);
  const filled = used <= 0 ? 0 : Math.min(cells, Math.ceil((used / limit) * cells));
  return (
    <div className={cn("flex flex-wrap gap-1", className)} aria-hidden>
      {Array.from({ length: cells }, (_, i) => (
        <span key={i} className={cn("size-3 rounded-[2px]", i < filled ? "bg-foreground" : "bg-muted-foreground/25")} />
      ))}
    </div>
  );
}
