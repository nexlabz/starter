"use client";

import { CreditCard, FolderKanban, LayoutDashboard, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const groups = [
  {
    title: "Work",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/projects", label: "Projects", icon: FolderKanban },
    ],
  },
  {
    title: "Workspace",
    items: [
      { href: "/team", label: "Team", icon: Users },
      { href: "/billing", label: "Billing", icon: CreditCard },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppNav({ label }: { label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="space-y-5">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-1 px-4 text-xs text-muted-foreground">{group.title}</p>
          <div className="flex flex-col gap-1">
            {group.items.map(({ href, label, icon: Icon }) => {
              const current = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors",
                    current ? "bg-card font-semibold text-foreground shadow-sheet" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
