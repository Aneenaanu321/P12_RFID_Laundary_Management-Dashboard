"use client";

import { ReactNode, useId } from "react";
import { Input, type InputProps } from "@/components/ui/Input";
import { Select, type SelectProps } from "@/components/ui/Select";
import { cn } from "@/lib/cn";

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-xs font-medium text-[var(--muted)]">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-[var(--status-red)]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-[var(--muted-fg)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormInput({
  label,
  error,
  hint,
  id,
  className,
  ...props
}: InputProps & { label: string; error?: string; hint?: string }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FormField label={label} htmlFor={inputId} error={error} hint={hint} className={className}>
      <Input id={inputId} error={Boolean(error)} aria-invalid={Boolean(error)} {...props} />
    </FormField>
  );
}

export function FormSelect({
  label,
  error,
  hint,
  id,
  className,
  children,
  ...props
}: SelectProps & { label: string; error?: string; hint?: string }) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <FormField label={label} htmlFor={selectId} error={error} hint={hint} className={className}>
      <Select id={selectId} error={Boolean(error)} aria-invalid={Boolean(error)} className="w-full" {...props}>
        {children}
      </Select>
    </FormField>
  );
}
