# Multi-tenancy

## Model

- A **user** can belong to many **organizations** (shown in the UI as workspaces) through **member** rows, each with a role: `owner`, `admin` or `member`.
- The session stores one `activeOrganizationId`. Everything a user sees belongs to that organization.
- The organization is the tenant and the billing unit. Plans and limits attach to it, not to the user.

## Who can see what

| Page | Visitor | Signed in, no workspace | Member | Admin / owner |
|---|---|---|---|---|
| `/`, `/pricing` | Yes | Yes | Yes | Yes |
| `/sign-in`, `/sign-up` | Yes | Yes | Yes | Yes |
| `/onboarding` | Redirected to sign-in | Yes | Yes | Yes |
| `/accept-invitation/[id]` | Sign in first | Yes | Yes | Yes |
| `/dashboard`, `/projects` | Redirected to sign-in | Redirected to onboarding | Yes | Yes |
| `/team` | Redirected to sign-in | Redirected to onboarding | View | Invite, remove |
| `/billing` | Redirected to sign-in | Redirected to onboarding | View | Buy, upgrade |

App pages are `noindex`, disallowed in `robots.ts`, and left out of the sitemap. The Polar customer portal opens for the person who bought the plan.

## Three layers of protection

1. **`src/proxy.ts`** redirects requests with no session cookie. This is a convenience, not security.
2. **`requireOrgSession()`** (`src/lib/session.ts`) loads the session and re-checks membership in the database. It is the only source of `orgId`. Never take an org id from the client.
3. **Row-level security.** `withTenant(db, orgId, fn)` (`src/db/tenant.ts`) opens a transaction, sets `app.org_id`, and switches to the restricted `app_rls` role. Postgres then filters every row, so a query missing its `WHERE` still cannot cross tenants. Both settings end with the transaction, so pooled connections stay clean.

`tests/tenant-isolation.test.ts` runs real migrations and tries to read, change, delete and plant data across tenants.

## Adding a tenant table

1. Add it to `src/db/schema.ts` with `orgId: text("org_id").notNull().references(() => organization.id, { onDelete: "cascade" })` and an index.
2. Run `pnpm db:generate`.
3. Run `pnpm drizzle-kit generate --custom --name my_table_rls`, and copy the four statements from `drizzle/0001_rls.sql` (enable, force, policy, grant).
4. Run `pnpm db:migrate`.
5. Read and write it only inside `withTenant`.
6. Add a wrong-tenant case to the isolation test.

## Things that are not under RLS

- Auth tables (`user`, `session`, `member`, ...) are managed by Better Auth.
- Billing tables are written by webhooks. Always filter them by `orgId`, as `getEntitlement` does.

## Known requirement

The `0001_rls` migration creates a role and grants it to the connecting user, so the database user running migrations needs permission to create roles. If it can't, create `app_rls` as a database admin and re-run migrations.
