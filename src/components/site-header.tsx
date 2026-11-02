import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Mark } from "@/components/mark";
import { MobileNav } from "@/components/mobile-nav";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="relative">
      <div className="flex items-center justify-between gap-6 px-5 py-3 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold"><Mark />{site.name}</Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm lg:flex">
          <NavLinks />
        </nav>
        <div className="hidden items-center gap-6 text-sm lg:flex">
          <Link href="/sign-in" className="text-muted-foreground hover:text-foreground">Sign in</Link>
          <Link href="/sign-up" className={buttonVariants()}>Get started</Link>
        </div>
        <MobileNav>
          <nav aria-label="Main mobile" className="flex flex-col gap-1">
            <NavLinks className="py-2" />
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
    <footer className="mt-auto overflow-hidden px-5 pt-16 sm:px-8">
      <div className="grid gap-8 border-t border-border pt-8 text-sm sm:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-4">
          <p className="max-w-xs text-muted-foreground">{site.tagline}</p>
          <ThemeToggle />
        </div>
        <nav aria-label="Product" className="flex flex-col gap-2">
          <NavLinks />
        </nav>
        <nav aria-label="Legal and source" className="flex flex-col gap-2 text-muted-foreground">
          {site.legal.map((l) => <Link key={l.href} href={l.href} className="hover:text-foreground">{l.label}</Link>)}
          <a href={site.github} className="hover:text-foreground">GitHub</a>
        </nav>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">© {new Date().getFullYear()} {site.name}</p>
      <p aria-hidden className="mt-6 -mb-[0.2em] text-[12.5vw] leading-none font-semibold tracking-[-0.05em] whitespace-nowrap text-tray select-none">{site.name}</p>
    </footer>
  );
}
