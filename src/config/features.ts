export type Feature = { t: string; d: string; proof: string };

export const features: Feature[] = [
  { t: "Multi-tenant from day one", d: "Organizations, members, roles and invitations. Postgres row-level security keeps every tenant's data apart, even if a query forgets its filter.", proof: "withTenant(db, orgId, (tx) => ...)" },
  { t: "Auth that just works", d: "Email + password and optional Google sign-in with Better Auth. Sessions remember each user's active workspace.", proof: "const { orgId } = await requireOrgSession()" },
  { t: "Subscriptions and one-time payments", d: "Polar handles checkout, tax and invoices. Sell monthly, yearly and lifetime plans side by side, billed per organization.", proof: "src/lib/billing/catalog.ts" },
  { t: "SEO ready", d: "Metadata, Open Graph image, sitemap, robots, structured data and Vercel Analytics are wired in and documented.", proof: "sitemap.ts, robots.ts, opengraph-image.tsx" },
  { t: "Typed, tested, documented", d: "Strict env validation, migration-first Drizzle schema, isolation and billing tests, and setup docs for every account you need.", proof: "pnpm lint && pnpm typecheck && pnpm test" },
  { t: "Deploy in minutes", d: "One-click Vercel deploy, or create your copy with the GitHub CLI. Works locally with a single Docker Postgres.", proof: "docker compose up -d --wait" },
];
