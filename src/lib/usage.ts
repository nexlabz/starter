export type Usage = { state: "ok" | "near" | "full"; left: number; label: string };

/** Where a plan limit stands, in words. "Near" means one left, or 80% used on larger limits. */
export function usage(used: number, limit: number): Usage {
  const left = Math.max(limit - used, 0);
  if (left === 0) return { state: "full", left, label: "Limit reached" };
  const near = left === 1 || used / limit >= 0.8;
  return { state: near ? "near" : "ok", left, label: `${left} left` };
}
