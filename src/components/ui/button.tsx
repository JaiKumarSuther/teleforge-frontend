import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-secondary";
type Size = "sm" | "md" | "lg";

// Disabled is its own neutral state (not a faded copy of the variant), so it never reads as broken.
const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover disabled:bg-bg-3 disabled:text-text-3",
  secondary: "bg-surface text-text shadow-1 hover:bg-bg-2 hover:shadow-2 disabled:bg-bg-3 disabled:text-text-3 disabled:shadow-none",
  ghost: "text-text-2 hover:bg-bg-hover hover:text-text disabled:text-text-3 disabled:bg-transparent",
  danger: "bg-danger text-on-accent hover:bg-danger-hover disabled:bg-bg-3 disabled:text-text-3",
  "danger-secondary": "bg-surface text-danger-text shadow-1 hover:bg-danger-tint hover:shadow-2 disabled:bg-bg-3 disabled:text-text-3 disabled:shadow-none",
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
  "relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap border border-transparent font-medium transition-[background-color,box-shadow,color,scale] duration-150 ease-out enabled:active:scale-[0.97] disabled:cursor-not-allowed";

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
  const cls = cn(buttonClass({ variant, size, icon }), "active:scale-[0.97]", className);
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
