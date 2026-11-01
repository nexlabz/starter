import { relations } from "drizzle-orm";
import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/* ───────────────────────── Better Auth core ───────────────────────── */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    activeOrganizationId: text("active_organization_id"),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/* ─────────────── Better Auth organization plugin (tenants) ─────────────── */

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  createdAt: createdAt(),
  metadata: text("metadata"),
});

export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    createdAt: createdAt(),
  },
  (t) => [
    index("member_org_idx").on(t.organizationId),
    index("member_user_idx").on(t.userId),
    uniqueIndex("member_org_user_uniq").on(t.organizationId, t.userId),
  ],
);

export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    inviterId: text("inviter_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("invitation_org_idx").on(t.organizationId), index("invitation_email_idx").on(t.email)],
);

/* ───────────────────────── App tables ─────────────────────────
 * RULE: every tenant-owned table has `org_id text NOT NULL REFERENCES organization(id)`
 * and an RLS policy (see drizzle/*_rls.sql). Add yours the same way as `project`.
 */

export const project = pgTable(
  "project",
  {
    id: id(),
    orgId: text("org_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [index("project_org_idx").on(t.orgId)],
);

/* ───────────────────────── Billing (written by Polar webhooks) ─────────────────────────
 * Organization is the billing unit. `org_id` comes from checkout `referenceId`.
 */

export const subscription = pgTable(
  "subscription",
  {
    id: text("id").primaryKey(), // Polar subscription id
    orgId: text("org_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    planKey: text("plan_key"),
    status: text("status").notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    /** Polar's modified_at for this payload; older (out-of-order) webhooks never overwrite newer state. */
    providerModifiedAt: timestamp("provider_modified_at", { withTimezone: true }),
    updatedAt: updatedAt(),
  },
  (t) => [index("subscription_org_idx").on(t.orgId)],
);

export const purchase = pgTable(
  "purchase",
  {
    id: text("id").primaryKey(), // Polar order id
    orgId: text("org_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    planKey: text("plan_key"),
    amountCents: integer("amount_cents").notNull().default(0),
    currency: text("currency").notNull().default("usd"),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("purchase_org_idx").on(t.orgId)],
);

/** Webhook idempotency: one row per processed delivery key. */
export const billingEvent = pgTable("billing_event", {
  key: text("key").primaryKey(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  projects: many(project),
}));
