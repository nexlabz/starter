import { CircleAlert, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** One sentence about the state of the page, with what to do next. */
export function Notice({ tone = "info", className, children }: { tone?: "info" | "warning"; className?: string; children: React.ReactNode }) {
  const Icon = tone === "warning" ? CircleAlert : Info;
  return (
    <div role="status" className={cn("flex gap-3 rounded-[20px] border border-border bg-card p-4 text-sm shadow-sheet", className)}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", tone === "warning" ? "text-warning" : "text-muted-foreground")} aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
