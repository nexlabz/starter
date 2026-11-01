# Setup: accounts and environment variables

Copy `.env.example` to `.env`. On Vercel, set the same names under Project Settings → Environment Variables.

## Accounts

| Service | Needed for | Required? | Where to get keys |
|---|---|---|---|
| Postgres (Neon, or local Docker) | All data | **Yes** | neon.tech → project → Connection string |
| Vercel | Hosting, Analytics | For deploying | vercel.com |
| Resend | Verification and invitation email | **Yes in production** | resend.com → API Keys, then verify a sending domain |
| Polar | Payments | Optional | sandbox.polar.sh (test), polar.sh (live). See BILLING.md |
| Google Cloud | "Continue with Google" | Optional | Console → Credentials → OAuth client |

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string |
| `BETTER_AUTH_SECRET` | Yes | 32+ chars: `openssl rand -base64 32`. Changing it signs everyone out |
| `NEXT_PUBLIC_APP_URL` | Custom domains | Public URL. On Vercel the production domain is detected if unset. Sign-in rejects requests from any other origin, so set it if you see "Invalid origin" |
| `RESEND_API_KEY` | Production | Without it, dev prints email to the console and production throws |
| `EMAIL_FROM` | With Resend | Must be on your verified domain |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional | Set both. Redirect URI: `<app url>/api/auth/callback/google` |
| `POLAR_SERVER` | With Polar | `sandbox` or `production` |
| `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET` | With Polar | Both are needed to enable billing |
| `POLAR_PRODUCT_PRO_MONTHLY`, `POLAR_PRODUCT_PRO_YEARLY`, `POLAR_PRODUCT_LIFETIME` | With Polar | One per paid plan in `catalog.ts` |
| `POSTGRES_PORT` | Optional | Host port for local Docker Postgres. Default 5433 |

Required variables are validated by `src/lib/env.ts`. A production server refuses to boot if one is missing, and the error lists what to fix. `SKIP_ENV_VALIDATION=1` is for CI builds only.

Check any environment at `/api/health`: it shows the database status, billing mode and email mode, never secret values.

## Turn on email verification

Once Resend works, set `requireEmailVerification: true` in `src/lib/auth.ts`.
