"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { THEME_KEY, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

const CHANGE = "theme-change";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const read = () => (localStorage.getItem(THEME_KEY) as Theme | null) ?? "system";

function apply(theme: Theme) {
  if (theme === "system") {
    localStorage.removeItem(THEME_KEY);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }
  window.dispatchEvent(new Event(CHANGE));
}

/** Light, dark or system, remembered in this browser. */
export function ThemeToggle({ labels, className }: { labels?: boolean; className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => "system");
  return (
    <div role="radiogroup" aria-label="Theme" className={cn("inline-flex gap-0.5 rounded-full bg-muted p-0.5", className)}>
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => apply(value)}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-full px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            theme === value ? "bg-card text-foreground shadow-sheet" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden />
          {labels && label}
        </button>
      ))}
    </div>
  );
}
