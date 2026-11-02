"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/** The main site links, marking the page you're on. */
export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  return site.nav.map(({ href, label }) => (
    <Link
      key={href}
      href={href}
      aria-current={pathname === href ? "page" : undefined}
      className={cn("text-muted-foreground hover:text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-foreground", className)}
    >
      {label}
    </Link>
  ));
}
