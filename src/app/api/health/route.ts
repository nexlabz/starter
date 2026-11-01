import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { billingEnabled, getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

// Liveness + readiness. Reports WHICH config is active (never secret values) so a
// mis-pointed environment is visible at a glance.
export async function GET() {
  let dbOk = false;
  try {
    await db.execute(sql`select 1`);
    dbOk = true;
  } catch {}
  const env = getEnv();
  return NextResponse.json(
    {
      ok: dbOk,
      db: dbOk,
      billing: billingEnabled() ? `polar:${env.POLAR_SERVER}` : "disabled",
      email: env.RESEND_API_KEY ? "resend" : "console",
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    },
    { status: dbOk ? 200 : 503 },
  );
}
