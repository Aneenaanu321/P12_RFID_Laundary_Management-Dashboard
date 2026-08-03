"use client";

import {
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { ChevronDown } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type DropdownContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  close: () => void;
  menuId: string;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("Dropdown components must be used within <Dropdown>");
  return ctx;
}

export function Dropdown({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, close, menuId }}>
      <div ref={rootRef} className={cn("relative inline-flex", className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({
  children,
  className,
  showChevron = true,
  ...props
}: Omit<ButtonProps, "children"> & { children: ReactNode; showChevron?: boolean }) {
  const { open, setOpen, menuId } = useDropdown();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={menuId}
      iconRight={
        showChevron ? (
          <ChevronDown size={13} aria-hidden className={cn("transition-transform", open && "rotate-180")} />
        ) : undefined
      }
      className={className}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function DropdownMenu({
  children,
  align = "end",
  className,
}: {
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const { open, menuId } = useDropdown();
  if (!open) return null;
  return (
    <div
      id={menuId}
      role="menu"
      className={cn(
        "absolute top-full mt-1.5 z-50 min-w-[180px] max-h-72 overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] shadow-lg py-1",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownItem({
  children,
  onSelect,
  href,
  active,
  className,
}: {
  children: ReactNode;
  onSelect?: () => void;
  href?: string;
  active?: boolean;
  className?: string;
}) {
  const { close } = useDropdown();
  const shared = cn(
    "w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors a11y-focus",
    active
      ? "bg-[var(--surface-muted)] text-[var(--foreground)] font-medium"
      : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
    className
  );

  if (href) {
    return (
      <a
        role="menuitem"
        href={href}
        className={shared}
        onClick={() => close()}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      className={shared}
      onClick={() => {
        onSelect?.();
        close();
      }}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 border-t border-[var(--border-subtle)]" role="separator" />;
}
