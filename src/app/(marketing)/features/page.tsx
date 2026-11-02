import type { Metadata } from "next";
import Link from "next/link";
import { DotField } from "@/components/dot-field";
import { CtaBand } from "@/components/marketing";
import { buttonVariants } from "@/components/ui/button";
import { features } from "@/config/features";

export const metadata: Metadata = {
  title: "Features",
  description: "What's already built: multi-tenant workspaces, auth, subscriptions and one-time payments, SEO, tests and deployment.",
  alternates: { canonical: "/features" },
};

const steps = [
  { t: "Create your copy", d: "Start a new repository from the template.", proof: "gh repo create my-app --template nexlabz/starter --private --clone" },
  { t: "Start the database", d: "Copy the example env file, set BETTER_AUTH_SECRET, then run Postgres and the migrations.", proof: "cp .env.example .env && pnpm install && pnpm db:up && pnpm db:migrate" },
  { t: "Run it", d: "Sign up on your own machine and look around.", proof: "pnpm dev" },
  { t: "Deploy", d: "Point Vercel at the repository and add your keys. Email, Google and payments switch on as you add them.", proof: "docs/DEPLOYING.md" },
];

const yours = ["Your product's screens and data", "Your name, colours and links", "Your plans and prices", "Your accounts with Polar, email and Google"];

export default function FeaturesPage() {
  return (
    <>
      <section className="px-2">
        <div className="bg-wash relative flex min-h-[26rem] overflow-hidden rounded-[28px] text-white max-lg:min-h-[34rem]">
          <DotField caption={false} />
          <div className="pointer-events-none relative flex max-w-2xl flex-col p-6 sm:p-12 lg:w-1/2 lg:justify-end">
            <h1 className="text-[clamp(2.6rem,6vw,5rem)] leading-none font-medium tracking-[-0.04em]">What&apos;s already built</h1>
            <p className="mt-4 max-w-md text-lg text-white/90">Everything a SaaS needs before its first customer, working together from the first run.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8" aria-label="Features">
        <dl className="divide-y divide-border border-y border-border">
          {features.map((f) => (
            <div key={f.t} className="grid gap-3 py-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
              <dt className="text-2xl font-medium tracking-[-0.03em]">{f.t}</dt>
              <dd className="min-w-0">
                <p className="text-muted-foreground">{f.d}</p>
                <p className="mt-3 overflow-x-auto font-mono text-sm whitespace-nowrap">{f.proof}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_2fr]" aria-labelledby="start">
        <h2 id="start" className="text-[clamp(2rem,4.5vw,3.5rem)] leading-tight font-medium">From template to live</h2>
        <ol className="space-y-8">
          {steps.map((s, i) => (
            <li key={s.t} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3">
              <span className="dot-numeral text-5xl">{i + 1}</span>
              <div className="min-w-0">
                <h3 className="text-xl font-medium">{s.t}</h3>
                <p className="mt-1 text-muted-foreground">{s.d}</p>
                <p className="mt-3 overflow-x-auto rounded-xl bg-muted px-4 py-3 font-mono text-sm whitespace-nowrap text-muted-foreground">{s.proof}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_2fr]" aria-labelledby="yours">
        <h2 id="yours" className="text-[clamp(2rem,4.5vw,3.5rem)] leading-tight font-medium">What stays yours</h2>
        <div>
          <ul className="divide-y divide-border border-y border-border">
            {yours.map((y) => <li key={y} className="py-4">{y}</li>)}
          </ul>
          <Link href="/pricing" className={`${buttonVariants({ variant: "outline" })} mt-6`}>See pricing</Link>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
