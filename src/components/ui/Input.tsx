import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full px-3 py-1.5 text-sm rounded-lg border bg-[var(--card-bg)] text-[var(--foreground)] placeholder:text-[var(--muted-fg)]",
          "border-[var(--border-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--status-blue-bg)] focus:border-[var(--status-blue)]",
          "disabled:opacity-50 disabled:cursor-not-allowed transition-colors a11y-focus",
          error && "border-[var(--status-red)] focus:ring-[var(--status-red-bg)] focus:border-[var(--status-red)]",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
