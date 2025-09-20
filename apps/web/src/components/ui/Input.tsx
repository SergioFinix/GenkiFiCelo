import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "glass" | "outline";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-background border border-input",
      glass: "bg-glass backdrop-blur-md border border-white/20 placeholder:text-white/60",
      outline: "bg-transparent border-2 border-white/30 placeholder:text-white/60",
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl px-4 py-3 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
