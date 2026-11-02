import type { Metadata } from "next";
import { PageIntro } from "@/components/marketing";
import { changelog } from "@/config/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What changed, and when.",
  alternates: { canonical: "/changelog" },
};

const format = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" });

export default function ChangelogPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <PageIntro title="Changelog">What changed, and when.</PageIntro>
      <ol className="mt-12 divide-y divide-border border-y border-border">
        {changelog.map((release) => (
          <li key={release.date} className="grid gap-3 py-8 lg:grid-cols-[1fr_2fr] lg:gap-10">
            <h2 className="text-xl font-medium"><time dateTime={release.date}>{format.format(new Date(release.date))}</time></h2>
            <ul className="space-y-2 text-muted-foreground">
              {release.changes.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
