"use client";

import { ReactNode, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW =
    size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : size === "xl" ? "max-w-3xl" : "max-w-lg";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "bg-[var(--card-bg)] rounded-2xl shadow-xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border-subtle)] outline-none",
          maxW,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--border-subtle)] px-5 py-4 flex items-start justify-between gap-3 z-10">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-[var(--foreground)]">
              {title}
            </h2>
            {description && (
              <p id={descId} className="text-sm text-[var(--muted)] mt-1">
                {description}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            onClick={onClose}
            aria-label="Close"
            className="text-[var(--muted-fg)]"
          >
            <X size={18} aria-hidden />
          </Button>
        </div>
        {children && <div className="p-5">{children}</div>}
        {footer && (
          <div className="px-5 py-4 border-t border-[var(--border-subtle)] flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  formAction,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  onConfirm?: () => void;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  const confirmVariant =
    variant === "danger" ? "solidDanger" : variant === "warning" ? "warning" : "primary";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          {formAction ? (
            <form
              action={async (fd) => {
                await formAction(fd);
                onClose();
              }}
            >
              <Button type="submit" variant={confirmVariant}>
                {confirmLabel}
              </Button>
            </form>
          ) : (
            <Button
              type="button"
              variant={confirmVariant}
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
            >
              {confirmLabel}
            </Button>
          )}
        </>
      }
    />
  );
}
