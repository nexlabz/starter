import type { Metadata } from "next";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { OrgSwitcher } from "@/components/org-switcher";
import { SignOutButton } from "@/components/sign-out-button";
import { site } from "@/config/site";
import { requireOrgSession } from "@/lib/session";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/team", label: "Team" },
  { href: "/billing", label: "Billing" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await requireOrgSession();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
          <Link href="/dashboard" className="font-bold">{site.name}</Link>
          <div className="hidden md:block"><OrgSwitcher activeId={s.orgId} /></div>
          <nav aria-label="App" className="ml-2 hidden gap-4 text-sm md:flex">
            {nav.map((n) => (<Link key={n.href} href={n.href} className="text-muted-foreground hover:text-foreground">{n.label}</Link>))}
          </nav>
          <div className="ml-auto hidden items-center gap-3 text-sm text-muted-foreground md:flex">
            <span>{s.user.email}</span>
            <SignOutButton />
          </div>
          <MobileNav>
            <OrgSwitcher activeId={s.orgId} />
            <nav aria-label="App mobile" className="flex flex-col gap-1">
              {nav.map((n) => (<Link key={n.href} href={n.href} className="py-2 text-muted-foreground hover:text-foreground">{n.label}</Link>))}
            </nav>
            <p className="truncate text-muted-foreground">{s.user.email}</p>
            <SignOutButton />
          </MobileNav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
