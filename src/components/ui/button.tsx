import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-primary bg-primary text-primary-foreground",
        outline: "border border-border bg-background text-foreground",
        destructive: "border border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Button({
  className,
  variant,
  pending,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { pending?: boolean }) {
  return (
    <button className={cn(buttonVariants({ variant }), className)} disabled={pending || disabled} aria-busy={pending || undefined} {...props}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
