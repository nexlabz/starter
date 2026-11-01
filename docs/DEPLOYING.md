# Deploying to Vercel

1. Create a Postgres database (Neon has a free plan).
2. Push your repo to GitHub and import it in Vercel, or use the Deploy button in the README.
3. Set `DATABASE_URL` and `BETTER_AUTH_SECRET`. Add `RESEND_API_KEY` and `EMAIL_FROM` for production email; without them, sending email throws.
4. Deploy. `vercel.json` runs `pnpm db:migrate && pnpm build`, so migrations are applied on each build.
5. Turn on Web Analytics and Speed Insights in the Vercel project.
6. Open `/api/health` and confirm `"ok": true`.

## Custom domain

Set `NEXT_PUBLIC_APP_URL=https://yourdomain.com` and redeploy. This value goes into SEO metadata at build time, and auth rejects other origins. Update the Polar webhook and Google redirect URLs too.

## Preview deployments

Previews use the Preview-scope env vars and run migrations during the build. Point `DATABASE_URL` for Preview at a separate database or a Neon branch, or a pull request's migration will run against production.

## Vercel Hobby

The Hobby plan's terms are for non-commercial use. Move to a paid plan before charging customers.

## Other hosts

The app is a standard Next.js server and uses no Vercel-only APIs apart from the analytics components, which do nothing elsewhere.

## Deploying from GitHub Actions (no Git connection)

`.github/workflows/deploy.yml` deploys every push to `main` with the Vercel CLI, so the
Vercel project stays unconnected from the repo. Create a token at
<https://vercel.com/account/tokens>, then add three repo secrets:

```bash
gh secret set VERCEL_TOKEN        # paste the token when prompted
gh secret set VERCEL_ORG_ID       # orgId from .vercel/project.json after `vercel link`
gh secret set VERCEL_PROJECT_ID   # projectId from the same file
```

Without these secrets the workflow skips and stays green, so template copies are unaffected.
