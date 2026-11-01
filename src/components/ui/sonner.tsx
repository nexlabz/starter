"use client";

import { Toaster as Sonner } from "sonner";

const tokens = {
  "--normal-bg": "var(--popover)",
  "--normal-text": "var(--popover-foreground)",
  "--normal-border": "var(--border)",
} as React.CSSProperties;

export function Toaster(props: React.ComponentProps<typeof Sonner>) {
  return <Sonner theme="system" richColors closeButton style={tokens} {...props} />;
}
