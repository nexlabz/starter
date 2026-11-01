import { cn } from "@/lib/utils";

export const cardStyles = "rounded-xl border border-border bg-card p-5 text-card-foreground";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn(cardStyles, className)} {...props} />;
}
