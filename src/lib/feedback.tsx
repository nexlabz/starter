import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action-result";
import { SEAT_LIMIT_CODE } from "@/lib/billing/limit-codes";

const LIMIT_CODES = new Set([SEAT_LIMIT_CODE, "ORGANIZATION_MEMBERSHIP_LIMIT_REACHED", "INVITATION_LIMIT_REACHED"]);

export const isLimitCode = (code: string | undefined) => Boolean(code) && LIMIT_CODES.has(code!);

/** A plan-limit block: says so and links to billing, and stays up long enough to act on. */
export function toastLimit(message: string) {
  toast.error(message, {
    duration: 10_000,
    action: <Link className="ml-auto font-semibold underline" href="/billing">View billing</Link>,
  });
}

export function reportResult(res: ActionResult) {
  if (res.ok) toast.success(res.message);
  else if (res.limit) toastLimit(res.message);
  else toast.error(res.message);
}

/** Reports a Better Auth client error. Returns true if there was one. */
export function reportAuthError(error: { code?: string; message?: string } | null | undefined, fallback: string) {
  if (!error) return false;
  if (isLimitCode(error.code)) toastLimit(error.message ?? fallback);
  else toast.error(error.message ?? fallback);
  return true;
}

/** Runs a mutation and toasts anything it throws. Next.js redirects pass through. */
export async function attempt<T>(run: () => Promise<T>, fallback = "Something went wrong. Please try again."): Promise<T | undefined> {
  try {
    return await run();
  } catch (e) {
    unstable_rethrow(e);
    console.error(e);
    toast.error(fallback);
    return undefined;
  }
}
