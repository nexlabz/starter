/**
 * Single place for product identity. Change these (and src/app/globals.css tokens)
 * to rebrand. Nothing else hardcodes the name, URL or tagline.
 */
export const site = {
  name: "Nexlabz Starter",
  tagline: "Multi-tenant SaaS starter: auth, teams, billing, SEO — ready to deploy.",
  description:
    "Open-source Next.js starter with Better Auth organizations, Postgres + Drizzle with row-level security, Polar payments (subscriptions and one-time), and an SEO-ready landing page.",
  keywords: ["Next.js starter", "SaaS boilerplate", "multi-tenant", "Better Auth", "Drizzle", "Polar payments"],
  twitter: "@nexlabz",
  github: "https://github.com/nexlabz/starter",
  supportEmail: "hello@example.com",
} as const;
