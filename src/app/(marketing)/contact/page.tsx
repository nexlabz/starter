import type { Metadata } from "next";
import { PageIntro } from "@/components/marketing";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `How to reach ${site.name}.`,
  alternates: { canonical: "/contact" },
};

const routes = [
  { t: "Questions and billing", d: "Anything about your account, plan or invoices.", href: `mailto:${site.supportEmail}`, action: site.supportEmail },
  { t: "Bugs and feature requests", d: "Open an issue so others can follow along.", href: `${site.github}/issues`, action: "Open an issue" },
  { t: "Security reports", d: "Email us privately. Please don't open a public issue.", href: `mailto:${site.supportEmail}?subject=Security%20report`, action: "Report privately" },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <PageIntro title="Contact">Pick the route that fits and it reaches the right place first time.</PageIntro>
      <dl className="mt-12 divide-y divide-border border-y border-border">
        {routes.map((r) => (
          <div key={r.t} className="grid gap-2 py-6 md:grid-cols-[1fr_1fr_11rem] md:items-baseline md:gap-8">
            <dt className="text-xl font-medium">{r.t}</dt>
            <dd className="text-muted-foreground">{r.d}</dd>
            <dd className="md:text-right"><a href={r.href} className="underline underline-offset-4">{r.action}</a></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
