import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { pricingCtaTarget } from "@/lib/billing/cta";
import { billingEnabled } from "@/lib/env";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const target = pricingCtaTarget({
    signedIn: Boolean(session),
    billing: billingEnabled(),
    planKey: request.nextUrl.searchParams.get("plan"),
  });
  return NextResponse.redirect(new URL(target, request.url));
}
