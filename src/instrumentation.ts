// Fail the boot (not the first request) when required config is missing in production.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "production") {
    const { getEnv } = await import("@/lib/env");
    getEnv();
  }
}
