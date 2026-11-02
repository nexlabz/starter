import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { DotField } from "@/components/dot-field";
import { FeatureTabs, type Feature } from "@/components/feature-tabs";
import { JsonLd } from "@/components/json-ld";
import { PricingTable } from "@/components/pricing-table";
import { site } from "@/config/site";
import { FREE_PLAN, PLANS } from "@/lib/billing/catalog";
import { appUrl } from "@/lib/env";

const features: Feature[] = [
  { t: "Multi-tenant from day one", d: "Organizations, members, roles and invitations. Postgres row-level security keeps every tenant's data apart, even if a query forgets its filter.", proof: "withTenant(db, orgId, (tx) => ...)" },
  { t: "Auth that just works", d: "Email + password and optional Google sign-in with Better Auth. Sessions remember each user's active workspace.", proof: "const { orgId } = await requireOrgSession()" },
  { t: "Subscriptions and one-time payments", d: "Polar handles checkout, tax and invoices. Sell monthly, yearly and lifetime plans side by side, billed per organization.", proof: "src/lib/billing/catalog.ts" },
  { t: "SEO ready", d: "Metadata, Open Graph image, sitemap, robots, structured data and Vercel Analytics are wired in and documented.", proof: "sitemap.ts, robots.ts, opengraph-image.tsx" },
  { t: "Typed, tested, documented", d: "Strict env validation, migration-first Drizzle schema, isolation and billing tests, and setup docs for every account you need.", proof: "pnpm lint && pnpm typecheck && pnpm test" },
  { t: "Deploy in minutes", d: "One-click Vercel deploy or `gh repo create --template`. Works locally with a single Docker Postgres.", proof: "docker compose up -d --wait" },
];

const stats = [
  { n: "1", label: "service needed to run it: Postgres" },
  { n: String(PLANS.length), label: `plans, all edited in one file` },
  { n: String(FREE_PLAN.limits.projects), label: "projects free, per workspace" },
];

const faqs = [
  { q: "What do I need to run it?", a: "A Postgres database. Everything else (email, Google login, payments) is optional and switches on when you add its keys." },
  { q: "Can I change the plans?", a: "Yes. Plans live in one file, src/lib/billing/catalog.ts. Edit it, create the product in Polar, and set its id in your environment." },
  { q: "Is tenant data really isolated?", a: "Tenant tables are protected by Postgres row-level security and covered by automated tests that try to read, change and plant data across organizations." },
  { q: "Is it free to use?", a: "The template is MIT licensed. Hosting and payment-provider fees are yours." },
];

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", name: site.name, url: appUrl(), sameAs: [site.github] },
            { "@type": "SoftwareApplication", name: site.name, applicationCategory: "DeveloperApplication", operatingSystem: "Web", description: site.description, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
            { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
          ],
        }}
      />
      <section className="px-2">
        <div className="bg-wash relative flex min-h-[calc(100svh-5rem)] overflow-hidden rounded-[28px] text-white max-lg:min-h-[44rem]">
          <DotField />
          <div className="pointer-events-none relative flex w-full max-w-3xl flex-col p-6 sm:p-12 lg:w-1/2 lg:justify-end">
            <h1 className="text-[clamp(2.6rem,6vw,5.2rem)] leading-[1] font-medium tracking-[-0.04em]">
              The product is yours.{" "}
              <span className="text-white/70">The plumbing is done.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-white/90">Auth, teams, billing and tenant isolation, ready to deploy. Start on the part only you can build.</p>
            <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
              <Link href="/sign-up" className={buttonVariants({ variant: "wash" })}>Start free</Link>
              <Link href="/pricing" className={buttonVariants({ variant: "washOutline" })}>See pricing</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-3 grid max-w-7xl gap-3 px-5 sm:grid-cols-3 sm:px-8" aria-label="At a glance">
        {stats.map((s) => (
          <div key={s.label} className="flex items-end gap-4 py-8">
            <span className="dot-numeral text-7xl">{s.n}</span>
            <span className="max-w-40 pb-1 text-sm text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8" aria-labelledby="features">
        <h2 id="features" className="mb-12 text-base font-normal tracking-normal text-muted-foreground">Everything a SaaS needs on day one</h2>
        <FeatureTabs features={features} />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8" aria-labelledby="pricing">
        <h2 id="pricing" className="mb-10 text-[clamp(2rem,4.5vw,3.5rem)] leading-tight font-medium">Simple pricing</h2>
        <PricingTable />
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_2fr]" aria-labelledby="faq">
        <h2 id="faq" className="text-[clamp(2rem,4.5vw,3.5rem)] leading-tight font-medium">Questions</h2>
        <dl className="divide-y divide-border border-y border-border">
          {faqs.map((f) => (
            <div key={f.q} className="grid gap-2 py-5 md:grid-cols-2 md:gap-8">
              <dt className="font-medium">{f.q}</dt>
              <dd className="text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="px-2 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-6 rounded-[28px] bg-signal p-6 text-signal-foreground sm:p-12">
          <h2 className="max-w-2xl text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] font-medium">Skip the first month of setup.</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/sign-up" className={buttonVariants({ variant: "signal" })}>Start free</Link>
            <a href={site.github} className={buttonVariants({ variant: "signalOutline" })}>View on GitHub</a>
          </div>
        </div>
      </section>
    </>
  );
}
