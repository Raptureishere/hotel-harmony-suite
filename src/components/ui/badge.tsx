import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Room status variants
        available:
          "border-transparent bg-status-available text-status-available-foreground",
        occupied:
          "border-transparent bg-status-occupied text-status-occupied-foreground",
        cleaning:
          "border-transparent bg-status-cleaning text-status-cleaning-foreground",
        maintenance:
          "border-transparent bg-status-maintenance text-status-maintenance-foreground",
        // Payment status variants
        paid: "border-transparent bg-status-available text-status-available-foreground",
        pending:
          "border-transparent bg-status-cleaning text-status-cleaning-foreground",
        partial:
          "border-transparent bg-status-maintenance text-status-maintenance-foreground",
        refunded:
          "border-transparent bg-muted text-muted-foreground",
        // Booking status variants
        reserved:
          "border-transparent bg-status-maintenance text-status-maintenance-foreground",
        "checked-in":
          "border-transparent bg-status-available text-status-available-foreground",
        "checked-out":
          "border-transparent bg-muted text-muted-foreground",
        cancelled:
          "border-transparent bg-destructive text-destructive-foreground",
        // Other
        vip: "border-transparent bg-accent text-accent-foreground",
        info: "border-transparent bg-status-maintenance text-status-maintenance-foreground",
        warning: "border-transparent bg-status-cleaning text-status-cleaning-foreground",
        success: "border-transparent bg-status-available text-status-available-foreground",
        error: "border-transparent bg-status-occupied text-status-occupied-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
