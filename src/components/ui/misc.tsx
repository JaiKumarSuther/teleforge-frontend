import { CheckCircle, Info, Warning, WarningOctagon } from "@phosphor-icons/react/dist/ssr";
import type { BotStatus } from "@/lib/types";
import { cn, avatarTone, initials } from "@/lib/utils";

/* ── Surfaces ───────────────────────────────────────────── */

/** Raised surface: lighter than the page, 1px ring plus soft lift. */
export function Panel({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("panel", className)} {...props}>
      {children}
    </div>
  );
}

export function PageHeader({ title, description, actions, className }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="type-page text-text">{title}</h1>
        {description && <p className="mt-1.5 max-w-[62ch] text-sm text-text-2">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ── Status ─────────────────────────────────────────────── */

const STATUS: Record<BotStatus, { label: string; text: string; dot: string }> = {
  active: { label: "Running", text: "text-ok-text", dot: "bg-ok" },
  stopped: { label: "Stopped", text: "text-text-2", dot: "bg-text-3" },
  draft: { label: "Draft", text: "text-text-2", dot: "border-[1.5px] border-text-3" },
  error: { label: "Error", text: "text-danger-text", dot: "bg-danger" },
};

export const statusLabel = (s: BotStatus) => STATUS[s].label;

/** State as a dot plus its word, never colour alone. */
export function StatusBadge({ status, className }: { status: BotStatus; className?: string }) {
  const s = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-label font-medium whitespace-nowrap", s.text, className)}>
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

/* ── Avatars ────────────────────────────────────────────── */

export function BotAvatar({ name, seed, size = 32, className }: { name: string; seed?: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      data-tone={avatarTone(seed || name)}
      className={cn("avatar inline-flex shrink-0 items-center justify-center font-bold select-none", className)}
      style={{ width: size, height: size, borderRadius: size >= 40 ? 10 : size >= 28 ? 8 : 6, fontSize: Math.round(size * 0.42) }}
    >
      {name.trim().charAt(0).toUpperCase() || "B"}
    </span>
  );
}

/** Initials avatar. The letters are real text, so a button around it can include them in its name. */
export function UserAvatar({ name, size = 28, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-text font-medium text-bg select-none", className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials(name)}
    </span>
  );
}

/* ── Feedback ───────────────────────────────────────────── */

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}

const CALLOUT = {
  danger: { box: "border-danger-line bg-danger-tint", icon: <WarningOctagon weight="fill" className="text-danger-text" size={18} /> },
  warn: { box: "border-warn-line bg-warn-tint", icon: <Warning weight="fill" className="text-warn-text" size={18} /> },
  info: { box: "border-accent-line bg-accent-tint", icon: <Info weight="fill" className="text-accent-text" size={18} /> },
  ok: { box: "border-ok-line bg-ok-tint", icon: <CheckCircle weight="fill" className="text-ok-text" size={18} /> },
} as const;

export function Callout({
  tone = "info",
  title,
  children,
  action,
  className,
  role,
}: {
  tone?: keyof typeof CALLOUT;
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  role?: "status" | "alert";
}) {
  const t = CALLOUT[tone];
  return (
    <div role={role} className={cn("flex flex-col gap-3 rounded-lg border px-4 py-3.5 sm:flex-row sm:items-center", t.box, className)}>
      <div className="flex min-w-0 flex-1 gap-3">
        <span className="mt-px shrink-0">{t.icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text">{title}</p>
          {children && <div className="mt-0.5 text-sm text-text-2">{children}</div>}
        </div>
      </div>
      {action && <div className="shrink-0 pl-[30px] sm:pl-0">{action}</div>}
    </div>
  );
}

export function EmptyState({ title, children, action, className }: { title: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-start px-6 py-10 sm:px-8", className)}>
      <p className="text-md font-medium text-text">{title}</p>
      {children && <div className="mt-1.5 max-w-[56ch] text-sm text-text-2">{children}</div>}
      {action && <div className="mt-5 max-w-full">{action}</div>}
    </div>
  );
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-xs bg-bg-3 px-1 font-sans text-caption font-medium text-text-2 ring-1 ring-line-2 ring-inset", className)}>
      {children}
    </kbd>
  );
}

/* ── Stats ──────────────────────────────────────────────── */

export interface StatItem {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  tone?: "default" | "danger";
  /** Small chart shown to the right of the value */
  chart?: React.ReactNode;
}

/** A row of figures parted by hairlines (the 1px gap shows the line colour through). */
export function StatStrip({ items, className, columns = "grid-cols-2 lg:grid-cols-4" }: { items: StatItem[]; className?: string; columns?: string }) {
  return (
    <dl className={cn("grid gap-px overflow-hidden rounded-lg bg-line shadow-1", columns, className)}>
      {items.map((s) => (
        <div key={s.label} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] content-start gap-x-4 bg-surface px-4 py-4 sm:px-5">
          <dt className="col-start-1 text-label text-text-2">{s.label}</dt>
          <dd className={cn("col-start-1 mt-1.5 text-2xl font-medium tracking-tight", s.tone === "danger" ? "text-danger-text" : "text-text")}>{s.value}</dd>
          {s.detail && <dd className="col-start-1 mt-1 text-label text-text-2">{s.detail}</dd>}
          {s.chart && <dd className="col-start-2 row-span-3 row-start-1 hidden self-end sm:block">{s.chart}</dd>}
        </div>
      ))}
    </dl>
  );
}
