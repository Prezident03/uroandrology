import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium [&_svg]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "border-border text-muted",
        info: "border-primary/40 bg-primary/10 text-primary",
        guideline: "border-secondary/40 bg-secondary/10 text-secondary",
        warning: "border-warning/40 bg-warning/10 text-warning",
        danger: "border-danger/40 bg-danger/10 text-danger-text",
        success: "border-success/40 bg-success/10 text-success",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
