import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-primary bg-primary text-primary-foreground",
        outline: "border border-input bg-transparent text-foreground",
        destructive: "border border-destructive bg-destructive text-destructive-foreground",
        wash: "border border-white bg-white text-signal-foreground",
        washOutline: "border border-white/60 bg-transparent text-white",
        signal: "border border-signal-foreground bg-signal-foreground text-signal",
        signalOutline: "border border-signal-foreground bg-transparent text-signal-foreground",
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
