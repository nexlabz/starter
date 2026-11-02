import type { Metadata } from "next";
import { CtaBand, PageIntro } from "@/components/marketing";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `Why ${site.name} exists and the rules it's built on.`,
  alternates: { canonical: "/about" },
};

const principles = [
  { t: "One place for each decision", d: "Plans live in one file, product identity in another, colours in a third. Changing your mind means one edit, not a search." },
  { t: "Safe when someone forgets", d: "Tenant isolation is enforced by the database, so a query missing its filter still can't read another workspace." },
  { t: "Nothing required until you need it", d: "Postgres is the only service it needs. Email, Google sign-in and payments stay off until you add their keys." },
];

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <PageIntro title="About">
          Every SaaS starts by rebuilding the same month of work: sign-in, teams, billing, keeping customers&apos; data apart. {site.name} is that month, done once and shared.
        </PageIntro>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_2fr]" aria-labelledby="principles">
        <h2 id="principles" className="text-[clamp(2rem,4.5vw,3.5rem)] leading-tight font-medium">How it&apos;s built</h2>
        <dl className="divide-y divide-border border-y border-border">
          {principles.map((p) => (
            <div key={p.t} className="grid gap-2 py-5 md:grid-cols-2 md:gap-8">
              <dt className="font-medium">{p.t}</dt>
              <dd className="text-muted-foreground">{p.d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_2fr]" aria-labelledby="open">
        <h2 id="open" className="text-[clamp(2rem,4.5vw,3.5rem)] leading-tight font-medium">Open source</h2>
        <p className="max-w-xl text-lg text-muted-foreground">
          The template is MIT licensed. Read the code, change anything, and ship it as your own. <a href={site.github} className="text-foreground underline underline-offset-4">The source is on GitHub.</a>
        </p>
      </section>

      <CtaBand />
    </>
  );
}
