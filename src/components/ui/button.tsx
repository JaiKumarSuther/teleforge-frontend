import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-secondary";
type Size = "sm" | "md" | "lg";

// States: hover (colour step), focus (global ring), pressed (scale 0.97), disabled, loading.
// Disabled is its own neutral state (not a faded copy of the variant), so it never reads as broken.
// Loading keeps the variant's colours (the button is disabled but aria-busy), with a spinner before the label.
const off = "not-aria-busy:disabled:border-transparent not-aria-busy:disabled:bg-track not-aria-busy:disabled:text-ink-3";
const variants: Record<Variant, string> = {
  primary: `bg-relay text-on-relay hover:bg-relay-hover active:bg-relay-hover ${off}`,
  secondary: `border-line-strong bg-panel text-ink hover:bg-hover active:bg-pressed ${off}`,
  ghost: `text-ink-2 hover:bg-hover hover:text-ink active:bg-pressed not-aria-busy:disabled:bg-transparent not-aria-busy:disabled:text-ink-3`,
  danger: `bg-danger text-on-danger hover:bg-danger-hover active:bg-danger-hover ${off}`,
  "danger-secondary": `border-line-strong bg-panel text-danger-text hover:bg-danger-tint active:bg-danger-tint ${off}`,
};

const sizes: Record<Size, string> = {
  sm: "h-8 gap-1.5 rounded-md px-3 text-label",
  md: "h-10 gap-2 rounded-md px-4 text-sm",
  lg: "h-12 gap-2 rounded-md px-5 text-md",
};

const iconSizes: Record<Size, string> = {
  sm: "size-8 rounded-md",
  md: "size-10 rounded-md",
  lg: "size-12 rounded-md",
};

export const buttonBase =
  "relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap border border-transparent font-medium transition-[background-color,border-color,color,scale] duration-150 ease-out enabled:active:scale-[0.97] disabled:cursor-not-allowed aria-busy:cursor-progress motion-reduce:transition-none motion-reduce:active:scale-100";

export function buttonClass({ variant = "primary", size = "md", icon = false }: { variant?: Variant; size?: Size; icon?: boolean } = {}) {
  return cn(buttonBase, variants[variant], icon ? iconSizes[size] : sizes[size]);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner and keeps the label; the button is disabled while true. */
  loading?: boolean;
  /** Square icon-only button. Requires an aria-label. */
  icon?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, icon, disabled, className, children, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClass({ variant, size, icon }), className)}
      {...props}
    >
      {loading && <Spinner className={icon ? "" : "-ml-0.5"} />}
      {icon && loading ? null : children}
    </button>
  );
});

type LinkProps = { href: string; variant?: Variant; size?: Size; icon?: boolean; className?: string; children: React.ReactNode } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>;

/** A link styled as a button. External URLs open in a new tab. */
export function ButtonLink({ href, variant = "primary", size = "md", icon, className, children, ...props }: LinkProps) {
  const cls = cn(buttonClass({ variant, size, icon }), "active:scale-[0.97] motion-reduce:active:scale-100", className);
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...props}>
      {children}
    </Link>
  );
}
