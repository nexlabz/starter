import { cn } from "@/lib/utils";

/** A sheet: the raised surface everything sits on. */
export const cardStyles = "rounded-[20px] border border-border bg-card p-5 text-card-foreground shadow-sheet";

/** Rows on a sheet, for lists of projects, members and invitations. */
export const listStyles = "divide-y divide-border rounded-[20px] border border-border bg-card text-card-foreground shadow-sheet";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn(cardStyles, className)} {...props} />;
}

/**
 * A sheet resting on a tray, with a strip of the tray showing below it for
 * status or an action. `signal` turns the tray lime: use it once per view.
 */
export function Tray({ signal, foot, className, children }: { signal?: boolean; foot?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col rounded-[26px] p-1.5", signal ? "bg-signal text-signal-foreground" : "bg-tray", className)}>
      <div className={cn(cardStyles, "flex flex-1 flex-col border-transparent")}>{children}</div>
      {foot && <div className="px-3.5 py-2.5 text-sm">{foot}</div>}
    </div>
  );
}
