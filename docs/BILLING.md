# Billing with Polar

Polar is the merchant of record: it runs checkout, tax and invoices. You sell subscriptions, one-time purchases, or both at once.

With no Polar keys the app runs normally, billing is off, and everyone is on Free.

## How it works

1. `src/lib/billing/catalog.ts` defines the plans. The pricing page, checkout, limits and webhook mapping all read it.
2. `startCheckout` (a server action) verifies the user is an admin of the active organization, then opens Polar checkout with that organization as `reference_id`. The client never sends the org id.
3. Polar sends webhooks to `/api/auth/polar/webhooks`. `applyPolarEvent` stores them idempotently in `subscription` and `purchase`.
4. `getEntitlement(db, orgId)` picks the highest plan the organization holds, or Free.

The plan changes only when the webhook arrives, never on the redirect back from checkout.

## Sandbox in 5 minutes

1. Create an organization at https://sandbox.polar.sh.
2. Create an access token in its settings and put it in `.env` with `POLAR_SERVER=sandbox` and `POLAR_ACCESS_TOKEN=...`.
3. Run `pnpm polar:seed`. It creates a product for each paid plan and prints the `POLAR_PRODUCT_*` lines. Paste them into `.env`.
4. Expose your local app with a tunnel (for example `cloudflared tunnel --url http://localhost:3000`).
5. In Polar, add a webhook endpoint at `<tunnel url>/api/auth/polar/webhooks`, subscribe to `order.*` and `subscription.*`, and copy the secret into `POLAR_WEBHOOK_SECRET`.
6. Set `NEXT_PUBLIC_APP_URL` to the tunnel URL, restart, and buy a plan on `/billing` using a test card from Polar's docs.

## Change what you sell

1. Edit `PLANS` in `catalog.ts`: name, mode (`subscription` or `one_time`), price, limits.
2. Adding a paid plan? Add its env var to `PolarProductEnv` in `catalog.ts`, to `src/lib/env.ts`, and to `.env.example`.
3. Run `pnpm polar:seed`, or create the product by hand. Polar charges what the product says; `priceUsd` is only for display, so keep them equal.

## Going live

Production tokens, products and webhooks are separate from the sandbox. Create them all again on polar.sh, set `POLAR_SERVER=production`, and make one real purchase and refund before announcing. `polar:seed` runs against the sandbox only.

## Default policies (change them if yours differ)

| Case | Behaviour | Where |
|---|---|---|
| Subscription `active` or `trialing` | Paid plan | `ENTITLED_STATUSES` |
| Cancelled, period not over | Stays paid until Polar ends it | Polar status |
| `past_due` | Loses access at once (no grace period) | `ENTITLED_STATUSES` |
| Full refund of a one-time purchase | Access removed | `apply-event.ts` |
| Partial refund | Access kept | `apply-event.ts` |
| Over limit after a downgrade | Existing data stays, new items are blocked | `createProject` |
| Event with no `referenceId` | Logged and ignored | `apply-event.ts` |
| Product id not in env | Stored with no plan, logged, grants nothing | `apply-event.ts` |

Polar retries failed webhooks. There is no reconciliation job yet, so a webhook Polar gives up on leaves the plan out of date; check the delivery log in Polar if a payment doesn't apply.
