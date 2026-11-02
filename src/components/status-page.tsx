import Link from "next/link";
import { Mark } from "@/components/mark";
import { site } from "@/config/site";

/** Shell for 404 and error pages. Needs no session or data, so it renders when those fail. */
export function StatusPage({ code, title, body, children }: { code: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col justify-center gap-4 px-6 py-24 sm:px-16">
      <Link href="/" className="inline-flex items-center gap-2 self-start font-semibold"><Mark />{site.name}</Link>
      <p className="dot-numeral mt-6 text-[clamp(5rem,22vw,14rem)] text-muted-foreground">{code}</p>
      <h1 className="text-4xl font-medium">{title}</h1>
      <p className="max-w-md text-muted-foreground">{body}</p>
      <div className="mt-2 flex flex-wrap gap-3">{children}</div>
    </main>
  );
}
