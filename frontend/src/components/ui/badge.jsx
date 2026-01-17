import * as React from "react";
import { cn } from "../../lib/utils";

const Badge = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary/10 text-primary border-primary/20",
      secondary: "bg-secondary/10 text-secondary border-secondary/20",
      success: "bg-green-500/10 text-green-600 border-green-500/20",
      warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      destructive: "bg-destructive/10 text-destructive border-destructive/20",
      outline: "bg-transparent border-border text-foreground",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
