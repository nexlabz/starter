import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PricingTable } from "@/components/pricing-table";
import { site } from "@/config/site";
import { appUrl } from "@/lib/env";

const features = [
  { t: "Multi-tenant from day one", d: "Organizations, members, roles and invitations. Postgres row-level security keeps every tenant's data apart, even if a query forgets its filter." },
  { t: "Auth that just works", d: "Email + password and optional Google sign-in with Better Auth. Sessions remember each user's active workspace." },
  { t: "Subscriptions and one-time payments", d: "Polar handles checkout, tax and invoices. Sell monthly, yearly and lifetime plans side by side, billed per organization." },
  { t: "SEO ready", d: "Metadata, Open Graph image, sitemap, robots, structured data and Vercel Analytics are wired in and documented." },
  { t: "Typed, tested, documented", d: "Strict env validation, migration-first Drizzle schema, isolation and billing tests, and setup docs for every account you need." },
  { t: "Deploy in minutes", d: "One-click Vercel deploy or `gh repo create --template`. Works locally with a single Docker Postgres." },
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
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{site.tagline}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{site.description}</p>
        <div className="mt-10 flex justify-center gap-3">
          <Link href="/sign-up" className={buttonVariants()}>Start free</Link>
          <Link href="/pricing" className={buttonVariants({ variant: "outline" })}>See pricing</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12" aria-labelledby="features">
        <h2 id="features" className="text-center text-3xl font-bold">Everything a SaaS needs on day one</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.t}>
              <h3 className="font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16" aria-labelledby="pricing">
        <h2 id="pricing" className="text-center text-3xl font-bold">Simple pricing</h2>
        <div className="mt-10"><PricingTable /></div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16" aria-labelledby="faq">
        <h2 id="faq" className="text-center text-3xl font-bold">Questions</h2>
        <dl className="mt-8 space-y-6">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
