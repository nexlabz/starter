import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Mark } from "@/components/mark";
import { MobileNav } from "@/components/mobile-nav";
import { site } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="relative">
      <div className="flex items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold"><Mark />{site.name}</Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm md:flex">
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
    <footer className="mt-auto overflow-hidden px-5 pt-16 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <a href={site.github} className="hover:text-foreground">GitHub</a>
      </div>
      <p aria-hidden className="mt-6 -mb-[0.2em] text-[12.5vw] leading-none font-semibold tracking-[-0.05em] whitespace-nowrap text-tray select-none">{site.name}</p>
    </footer>
  );
}
