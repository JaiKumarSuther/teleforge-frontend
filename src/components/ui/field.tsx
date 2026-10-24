"use client";

import { forwardRef, useId, useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/** Shared text-field look: 3:1 edge, inset focus outline (never a border change), 16px text on phones so iOS doesn't zoom. */
export const fieldClass =
  "block w-full rounded-md border border-line-input bg-surface px-3 text-md text-text placeholder:text-placeholder sm:text-sm " +
  "transition-[border-color] duration-150 hover:border-text-2 " +
  "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-focus " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:outline-danger " +
  "disabled:cursor-not-allowed disabled:border-line-2 disabled:bg-bg-3 disabled:text-text-3";

interface ShellProps {
  label: React.ReactNode;
  htmlFor: string;
  hint?: React.ReactNode;
  error?: string | null;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Label above, control, then one line reserved for help or the error (no layout jump when an error appears). */
export function FieldShell({ label, htmlFor, hint, error, aside, children, className }: ShellProps) {
  const msgId = `${htmlFor}-msg`;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex min-h-5 items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-label font-medium text-text">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {(hint || error) && (
        <div id={msgId} className={cn("min-h-4 text-label", error ? "text-danger-text" : "text-text-2")}>
          {error || hint}
        </div>
      )}
    </div>
  );
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string | null;
  aside?: React.ReactNode;
  /** Monospace text for codes and tokens */
  code?: boolean;
  leading?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, aside, code, leading, className, wrapperClassName, id, type = "text", ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id || autoId;
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";

  return (
    <FieldShell label={label} htmlFor={inputId} hint={hint} error={error} aside={aside} className={wrapperClassName}>
      <div className="relative">
        {leading && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-3">{leading}</span>}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && reveal ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? `${inputId}-msg` : undefined}
          className={cn(fieldClass, "h-10", code && "font-mono text-sm sm:text-label", leading && "pl-9", isPassword && "pr-11", className)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? "Hide" : "Show"}
            aria-pressed={reveal}
            className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-sm text-text-2 hover:bg-bg-hover hover:text-text"
          >
            {reveal ? <EyeSlash /> : <Eye />}
          </button>
        )}
      </div>
    </FieldShell>
  );
});

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string | null;
  aside?: React.ReactNode;
  max?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, aside, max, className, id, value, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id || autoId;
  const length = typeof value === "string" ? value.length : 0;
  const over = max !== undefined && length > max;
  const counter =
    max !== undefined ? (
      <span className={cn("text-label", over ? "text-danger-text" : "text-text-2")} aria-live="polite">
        {length.toLocaleString()} / {max.toLocaleString()}
      </span>
    ) : null;
  return (
    <FieldShell label={label} htmlFor={inputId} hint={hint} error={error} aside={aside ?? counter}>
      <textarea
        ref={ref}
        id={inputId}
        value={value}
        aria-invalid={error || over ? true : undefined}
        aria-describedby={hint || error ? `${inputId}-msg` : undefined}
        className={cn(fieldClass, "min-h-40 resize-y py-2.5 leading-relaxed", className)}
        {...props}
      />
    </FieldShell>
  );
});
