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

## Environment checklist

Only the first two keys are required. Everything else has a safe behaviour when unset, and `/api/health` shows the billing and email mode of any environment.

| Key | Required? | Without it |
|---|---|---|
| `DATABASE_URL` | **Required** | The server refuses to boot in production |
| `BETTER_AUTH_SECRET` | **Required** | The server refuses to boot in production |
| `NEXT_PUBLIC_APP_URL` | Custom domains | Uses the Vercel production domain, or `http://localhost:3000`. Requests from any other origin fail sign-in with "Invalid origin" |
| `RESEND_API_KEY` | Recommended in production | No email goes out. Locally it prints to the terminal. In production, invites still work: copy the link from the Team page |
| `EMAIL_FROM` | With Resend | Uses Resend's test sender, which only delivers to your own address |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional, set both | The "Continue with Google" button is hidden |
| `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET` | Optional, set both | Billing is off: everyone is on Free and checkout buttons are disabled |
| `POLAR_PRODUCT_*` | With Polar | That plan's button shows "Product not set" |
| `POLAR_SERVER` | With Polar | Uses `sandbox`, so set `production` to take real payments |
| `POSTGRES_PORT` | Optional | Local Docker Postgres uses port 5433 |

Details and where to get each key are in [docs/SETUP.md](docs/SETUP.md).

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
