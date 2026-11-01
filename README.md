# Nexlabz Starter

Production-minded, multi-tenant SaaS starter by Nexlabz. MIT licensed.

- **Next.js 16** App Router, TypeScript, Tailwind v4
- **Better Auth**: email + password, optional Google, organizations, roles, invitations
- **Postgres + Drizzle**: committed migrations, row-level security on tenant tables
- **Polar**: subscriptions **and** one-time purchases, billed per organization, sandbox first
- **SEO**: metadata, Open Graph image, sitemap, robots, JSON-LD
- **Vercel Analytics + Speed Insights**, typed env validation, health endpoint, tests, CI

Only a Postgres database is required. Email, Google login and payments switch on when you add their keys.

## Start a project

Use the GitHub template:

```bash
gh repo create my-app --template nexlabz/starter --private --clone
cd my-app
```

Or copy it without git history:

```bash
npx degit nexlabz/starter my-app
```

Or deploy straight to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnexlabz%2Fstarter&env=DATABASE_URL,BETTER_AUTH_SECRET&envDescription=Postgres%20connection%20string%20and%20a%2032%2B%20character%20secret&envLink=https%3A%2F%2Fgithub.com%2Fnexlabz%2Fstarter%2Fblob%2Fmain%2Fdocs%2FSETUP.md)

## Run it locally

Needs Node 22+, pnpm and Docker.

```bash
cp .env.example .env          # then set BETTER_AUTH_SECRET: openssl rand -base64 32
pnpm install
pnpm db:up                    # Postgres on localhost:5433
pnpm db:migrate
pnpm dev
```

Open http://localhost:3000, sign up, create a workspace. Emails print to the terminal until you add Resend.

## Docs

| Doc | Covers |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Every account and env var |
| [docs/MULTI-TENANCY.md](docs/MULTI-TENANCY.md) | How tenants work, who sees which page, adding a table |
| [docs/BILLING.md](docs/BILLING.md) | Sandbox in 5 minutes, changing plans, going live |
| [docs/DEPLOYING.md](docs/DEPLOYING.md) | Vercel, migrations, previews |

## Scripts

`dev` · `build` · `lint` · `typecheck` · `test` · `db:up` · `db:down` · `db:generate` · `db:migrate` · `db:studio` · `polar:seed`

## Make it yours

1. `src/config/site.ts`: name, tagline, links
2. `src/app/globals.css`: colour tokens
3. `src/lib/billing/catalog.ts`: plans and limits
4. Replace the sample `project` table with your own, following docs/MULTI-TENANCY.md
