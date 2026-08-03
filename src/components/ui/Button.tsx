import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors a11y-focus disabled:opacity-50 disabled:pointer-events-none shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent-600)] text-white hover:bg-[var(--status-blue)] shadow-sm",
        secondary:
          "border border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
        ghost:
          "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
        danger:
          "border border-[var(--status-red-ring)] text-[var(--status-red)] hover:bg-[var(--status-red-bg)]",
        success:
          "border border-[var(--status-green-ring)] text-[var(--status-green)] hover:bg-[var(--status-green-bg)]",
        warning:
          "border border-[var(--status-amber-ring)] text-[var(--status-amber)] hover:bg-[var(--status-amber-bg)]",
        solidSuccess: "bg-[var(--status-green)] text-white hover:opacity-90",
        solidDanger: "bg-[var(--status-red)] text-white hover:opacity-90",
      },
      size: {
        sm: "px-2 py-1 text-xs rounded-md",
        md: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-sm",
        icon: "h-9 w-9 p-0",
        iconSm: "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    iconLeft?: ReactNode;
    iconRight?: ReactNode;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      iconLeft,
      iconRight,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading ? (
          <Loader2 size={size === "sm" || size === "iconSm" ? 12 : 14} className="animate-spin" aria-hidden />
        ) : (
          iconLeft
        )}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);

Button.displayName = "Button";

export { buttonVariants };
