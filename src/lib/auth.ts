import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { APIError } from "better-auth/api";
import { organization } from "better-auth/plugins";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { createPolarCore } from "@polar-sh/sdk/2026-10";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { applyPolarEvent } from "@/lib/billing/apply-event";
import { checkoutProducts } from "@/lib/billing/catalog";
import { getEntitlement, seatsTaken } from "@/lib/billing/entitlements";
import { SEAT_LIMIT_CODE } from "@/lib/billing/limit-codes";
import { sendEmail, sendInvitation } from "@/lib/email";
import { appUrl, billingEnabled, getEnv, googleEnabled } from "@/lib/env";
import { site } from "@/config/site";

const env = getEnv();
const baseURL = appUrl();

const polarClient = createPolarCore({
  // When billing is disabled the plugin is still mounted (so types and routes exist) but never used.
  accessToken: env.POLAR_ACCESS_TOKEN ?? "billing-disabled",
  environment: env.POLAR_SERVER,
});

export const auth = betterAuth({
  appName: site.name,
  baseURL,
  secret: env.BETTER_AUTH_SECRET,
  // Vercel preview deployments get their own URL; trust them so sign-in works on previews.
  trustedOrigins: [baseURL, process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
    .filter((v): v is string => Boolean(v))
    .map((v) => (v.startsWith("http") ? v : `https://${v}`)),
  database: drizzleAdapter(db, { provider: "pg", schema }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    // Flip to true once RESEND_API_KEY is set (see docs/SETUP.md).
    requireEmailVerification: false,
  },
  emailVerification: {
    sendOnSignUp: Boolean(env.RESEND_API_KEY),
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({ to: user.email, subject: `Verify your email for ${site.name}`, text: `Verify your email: ${url}` });
    },
  },
  socialProviders: googleEnabled()
    ? { google: { clientId: env.GOOGLE_CLIENT_ID!, clientSecret: env.GOOGLE_CLIENT_SECRET! } }
    : {},

  databaseHooks: {
    session: {
      create: {
        // New sessions start in the user's first organization (if any).
        before: async (s) => {
          const [m] = await db
            .select({ orgId: schema.member.organizationId })
            .from(schema.member)
            .where(eq(schema.member.userId, s.userId))
            .limit(1);
          return { data: { ...s, activeOrganizationId: m?.orgId ?? null } };
        },
      },
    },
  },

  plugins: [
    organization({
      // Seats come from the org's plan (catalog.ts), enforced when a member is added.
      membershipLimit: async (_user, org) => (await getEntitlement(db, org.id)).plan.limits.seats,
      organizationHooks: {
        // Stop at the invite too, so the admin hears about the limit rather than the invitee.
        beforeCreateInvitation: async ({ organization: org }) => {
          const { plan } = await getEntitlement(db, org.id);
          const taken = await seatsTaken(db, org.id);
          if (taken >= plan.limits.seats) {
            throw new APIError("FORBIDDEN", {
              code: SEAT_LIMIT_CODE,
              message: `The ${plan.name} plan allows ${plan.limits.seats} seats, counting pending invitations. Upgrade to invite more.`,
            });
          }
        },
      },
      async sendInvitationEmail(data) {
        const link = `${baseURL}/accept-invitation/${data.id}`;
        await sendInvitation({
          to: data.email,
          subject: `${data.inviter.user.name} invited you to ${data.organization.name}`,
          text: `${data.inviter.user.name} invited you to join ${data.organization.name} on ${site.name}.\nAccept: ${link}`,
        });
      },
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: billingEnabled(),
      use: [
        checkout({
          products: () => Promise.resolve(checkoutProducts(process.env)),
          successUrl: "/billing?checkout=success&checkout_id={CHECKOUT_ID}",
          returnUrl: "/billing",
          authenticatedUsersOnly: true,
        }),
        portal({ returnUrl: `${baseURL}/billing` }),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET ?? "billing-disabled",
          onPayload: async (payload) => {
            const result = await applyPolarEvent(
              db,
              { type: payload.type, data: payload.data as unknown as Record<string, unknown> },
              process.env,
            );
            if (result === "applied") console.log(`[billing] applied ${payload.type}`);
          },
        }),
      ],
    }),
    nextCookies(), // must be last
  ],
});

export type Session = typeof auth.$Infer.Session;
