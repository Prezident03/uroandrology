"use client";

import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none aria-[invalid=true]:border-danger";

export function NumberField({
  label,
  error,
  hint,
  className,
  ...props
}: { label: string; error?: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={inputClass}
        {...props}
      />
      {error ? (
        <p id={`${id}-err`} className="text-xs text-danger-text">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
