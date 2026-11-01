import { z } from "zod";

const optional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v : undefined));

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required (Postgres connection string)"),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters (openssl rand -base64 32)"),
  NEXT_PUBLIC_APP_URL: optional.pipe(z.string().url().optional()),

  // Email. Without RESEND_API_KEY emails are printed to the server console (dev only).
  RESEND_API_KEY: optional,
  EMAIL_FROM: z.string().default("Nexlabz Starter <onboarding@resend.dev>"),

  // Social login (optional). Both must be set to enable Google.
  GOOGLE_CLIENT_ID: optional,
  GOOGLE_CLIENT_SECRET: optional,

  // Billing (optional). Without POLAR_ACCESS_TOKEN the app runs with billing disabled.
  POLAR_ACCESS_TOKEN: optional,
  POLAR_WEBHOOK_SECRET: optional,
  POLAR_SERVER: z.enum(["sandbox", "production"]).default("sandbox"),
  POLAR_PRODUCT_PRO_MONTHLY: optional,
  POLAR_PRODUCT_PRO_YEARLY: optional,
  POLAR_PRODUCT_LIFETIME: optional,
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

/**
 * Validated environment. Throws with a readable list of problems.
 * Set SKIP_ENV_VALIDATION=1 for builds/CI that have no real secrets
 * (placeholders are substituted; never use it at runtime in production).
 */
export function getEnv(): Env {
  if (cached) return cached;
  const raw = { ...process.env } as Record<string, string | undefined>;
  if (process.env.SKIP_ENV_VALIDATION === "1") {
    raw.DATABASE_URL ||= "postgres://skip:skip@localhost:5432/skip";
    raw.BETTER_AUTH_SECRET ||= "skip-validation-placeholder-secret-0000000";
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid environment:\n${lines.join("\n")}\nSee docs/SETUP.md and .env.example.`);
  }
  cached = parsed.data;
  return cached;
}

export const billingEnabled = () => Boolean(getEnv().POLAR_ACCESS_TOKEN && getEnv().POLAR_WEBHOOK_SECRET);
export const googleEnabled = () => Boolean(getEnv().GOOGLE_CLIENT_ID && getEnv().GOOGLE_CLIENT_SECRET);

/** Public base URL: explicit NEXT_PUBLIC_APP_URL > Vercel production domain > localhost. */
export function appUrl(): string {
  const e = getEnv();
  if (e.NEXT_PUBLIC_APP_URL) return e.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
