import Link from "next/link";
import { site } from "@/config/site";

/** Shell for 404 and error pages. Needs no session or data, so it renders when those fail. */
export function StatusPage({ code, title, body, children }: { code: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <Link href="/" className="text-lg font-bold">{site.name}</Link>
      <p className="text-sm font-semibold text-primary">{code}</p>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="max-w-md text-muted-foreground">{body}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">{children}</div>
    </main>
  );
}
