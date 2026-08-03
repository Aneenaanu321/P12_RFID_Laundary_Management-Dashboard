import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "px-2.5 py-1.5 text-sm rounded-lg border bg-[var(--card-bg)] text-[var(--muted)]",
          "border-[var(--border-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--status-blue-bg)] focus:border-[var(--status-blue)]",
          "disabled:opacity-50 disabled:cursor-not-allowed transition-colors a11y-focus",
          error && "border-[var(--status-red)] focus:ring-[var(--status-red-bg)] focus:border-[var(--status-red)]",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
