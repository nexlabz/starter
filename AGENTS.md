<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules

Read README.md and docs/ first.

- Get `orgId` only from `requireOrgSession()`. Never accept one from the client.
- Tenant tables: `org_id NOT NULL` with a real FK, an RLS policy, and access only through `withTenant`. Follow docs/MULTI-TENANCY.md and add a wrong-tenant test.
- Plans, prices and limits live only in `src/lib/billing/catalog.ts`.
- Product name and links live only in `src/config/site.ts`. Colours live in `src/app/globals.css`.
- New env var: add it to `src/lib/env.ts`, `.env.example` and docs/SETUP.md.
- Schema changes go through `pnpm db:generate`. Never edit an applied migration.
- Polar payloads are snake_case. Type test fixtures against the SDK models.
- Before finishing: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
