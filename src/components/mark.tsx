import { cn } from "@/lib/utils";

const cells = [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]];

/** The logo: five cells of the dot field, set as a cross. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 3 3" className={cn("size-4", className)} fill="currentColor" aria-hidden>
      {cells.map(([x, y]) => <rect key={`${x}${y}`} x={x + 0.05} y={y + 0.05} width={0.9} height={0.9} />)}
    </svg>
  );
}
