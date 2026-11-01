import Link from "next/link";
import { site } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold">{site.name}</Link>
        <nav aria-label="Main" className="flex items-center gap-5 text-sm">
          <Link href="/pricing" className="text-muted hover:text-foreground">Pricing</Link>
          <Link href="/sign-in" className="text-muted hover:text-foreground">Sign in</Link>
          <Link href="/sign-up" className="btn btn-primary">Get started</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-muted">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <a href={site.github} className="hover:text-foreground">GitHub</a>
      </div>
    </footer>
  );
}
