"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useId, useRef, useState } from "react";

/** Menu button and dropdown for small screens. The header around it must be `relative`. */
export function MobileNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Remembers the route it was opened on, so navigating anywhere closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (next: boolean) => setOpenOn(next ? pathname : null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const Icon = open ? X : Menu;

  return (
    <div
      className="ml-auto md:hidden"
      onKeyDown={(e) => {
        if (e.key !== "Escape" || e.defaultPrevented || !open) return;
        setOpen(false);
        button.current?.focus();
      }}
    >
      <button
        ref={button}
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Icon className="size-5" aria-hidden />
      </button>
      {open && (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full z-20 flex flex-col gap-3 border-b border-border bg-background px-6 py-4 text-sm shadow-sm"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
