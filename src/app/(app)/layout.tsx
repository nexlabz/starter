import type { Metadata } from "next";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { Mark } from "@/components/mark";
import { MobileNav } from "@/components/mobile-nav";
import { OrgSwitcher } from "@/components/org-switcher";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/config/site";
import { requireOrgSession } from "@/lib/session";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await requireOrgSession();
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="sticky top-2 m-2 hidden h-[calc(100vh-1rem)] w-64 shrink-0 flex-col gap-6 overflow-y-auto rounded-[26px] bg-tray p-3 md:flex">
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-3 pt-2 font-semibold"><Mark />{site.name}</Link>
        <OrgSwitcher activeId={s.orgId} />
        <AppNav label="App" />
        <div className="mt-auto space-y-3 px-3 pb-2 text-sm">
          <div className="min-w-0">
            <p className="truncate font-medium">{s.user.name}</p>
            <p className="truncate text-muted-foreground">{s.user.email}</p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </aside>
      <header className="relative flex items-center gap-4 px-5 py-3 md:hidden">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-semibold"><Mark />{site.name}</Link>
        <MobileNav>
          <OrgSwitcher activeId={s.orgId} />
          <AppNav label="App mobile" />
          <p className="truncate text-muted-foreground">{s.user.email}</p>
          <div className="flex items-center justify-between gap-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </MobileNav>
      </header>
      <main className="w-full min-w-0 flex-1 px-5 py-6 md:py-10 md:pr-10 md:pl-8"><div className="mx-auto max-w-5xl">{children}</div></main>
    </div>
  );
}
