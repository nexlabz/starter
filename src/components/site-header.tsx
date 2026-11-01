import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { site } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="relative border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold">{site.name}</Link>
        <nav aria-label="Main" className="hidden items-center gap-5 text-sm md:flex">
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
          <Link href="/sign-in" className="text-muted-foreground hover:text-foreground">Sign in</Link>
          <Link href="/sign-up" className={buttonVariants()}>Get started</Link>
        </nav>
        <MobileNav>
          <nav aria-label="Main mobile" className="flex flex-col gap-1">
            <Link href="/pricing" className="py-2 text-muted-foreground hover:text-foreground">Pricing</Link>
            <Link href="/sign-in" className="py-2 text-muted-foreground hover:text-foreground">Sign in</Link>
            <Link href="/sign-up" className={buttonVariants()}>Get started</Link>
          </nav>
        </MobileNav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <a href={site.github} className="hover:text-foreground">GitHub</a>
      </div>
    </footer>
  );
}
