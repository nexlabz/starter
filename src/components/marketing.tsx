import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/config/site";

/** Page title and one line of context, for every marketing page except the home page. */
export function PageIntro({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <header>
      <h1 className="text-[clamp(2.6rem,6vw,5rem)] leading-none font-medium tracking-[-0.04em]">{title}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">{children}</p>
    </header>
  );
}

/** The lime closing panel. One per page, always last. */
export function CtaBand() {
  return (
    <section className="px-2 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-6 rounded-[28px] bg-signal p-6 text-signal-foreground sm:p-12">
        <h2 className="max-w-2xl text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] font-medium">Skip the first month of setup.</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/sign-up" className={buttonVariants({ variant: "signal" })}>Start free</Link>
          <a href={site.github} className={buttonVariants({ variant: "signalOutline" })}>View on GitHub</a>
        </div>
      </div>
    </section>
  );
}

/** Long-form copy for the legal pages. */
export function Prose({ sections }: { sections: { title: string; body: string }[] }) {
  return (
    <div className="mt-12 max-w-2xl space-y-8">
      {sections.map((s) => (
        <section key={s.title}>
          <h2 className="text-xl font-medium">{s.title}</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
        </section>
      ))}
    </div>
  );
}
