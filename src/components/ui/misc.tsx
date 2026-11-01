import { CheckCircle, Info, Warning, WarningOctagon } from "@phosphor-icons/react/dist/ssr";
import type { BotStatus } from "@/lib/types";
import { botColor } from "@/lib/bot-color";
import { cn, initials } from "@/lib/utils";

/* ── Surfaces ───────────────────────────────────────────── */

/** Panel: lighter than the page, hairline border, no shadow. */
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
        <h1 className="type-page text-ink">{title}</h1>
        {description && <p className="mt-1.5 max-w-[62ch] text-sm text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ── Status ─────────────────────────────────────────────── */

// Running is green, stopped grey, draft amber, error red. The word carries the meaning; the dot is the glance.
const STATUS: Record<BotStatus, { label: string; text: string; dot: string }> = {
  active: { label: "Running", text: "text-live-text", dot: "bg-live" },
  stopped: { label: "Stopped", text: "text-ink-2", dot: "bg-ink-3" },
  draft: { label: "Draft", text: "text-amber-text", dot: "bg-amber" },
  error: { label: "Error", text: "text-danger-text", dot: "bg-danger" },
};

export const statusLabel = (s: BotStatus) => STATUS[s].label;

/** Just the dot, for places where the word sits elsewhere (the avatar is hidden from screen readers, so keep the word elsewhere). */
export function StatusDot({ status, className }: { status: BotStatus; className?: string }) {
  return <span aria-hidden className={cn("size-2 shrink-0 rounded-full", STATUS[status].dot, className)} />;
}

/** State as a dot plus its word, never colour alone. */
export function StatusBadge({ status, className }: { status: BotStatus; className?: string }) {
  const s = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-label font-medium whitespace-nowrap", s.text, className)}>
      <StatusDot status={status} />
      {s.label}
    </span>
  );
}

/* ── Avatars ────────────────────────────────────────────── */

/**
 * Bot avatar: a circle in the bot's identity colour with a white initial.
 * Pass `status` to add the status dot on the avatar; `ringClass` is the background it sits on (the dot gets a 2px cut-out in that colour).
 */
export function BotAvatar({
  name,
  seed,
  size = 32,
  status,
  ringClass = "ring-panel",
  className,
}: {
  name: string;
  seed?: string;
  size?: number;
  status?: BotStatus;
  ringClass?: string;
  className?: string;
}) {
  const c = botColor(seed || name);
  const dotSize = size >= 36 ? "size-3" : "size-2.5";
  return (
    <span aria-hidden className={cn("relative inline-flex shrink-0", className)} style={{ width: size, height: size }}>
      <span
        className="inline-flex size-full items-center justify-center rounded-full font-semibold select-none"
        style={{ background: c.avatar, color: c.initial, fontSize: Math.round(size * 0.42) }}
      >
        {name.trim().charAt(0).toUpperCase() || "B"}
      </span>
      {status && <StatusDot status={status} className={cn("absolute right-0 bottom-0 ring-2", dotSize, ringClass)} />}
    </span>
  );
}

/** Initials avatar. The letters are real text, so a button around it can include them in its name. */
export function UserAvatar({ name, size = 28, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-ink font-medium text-paper select-none", className)}
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
  warn: { box: "border-amber-line bg-amber-tint", icon: <Warning weight="fill" className="text-amber-text" size={18} /> },
  info: { box: "border-relay-line bg-relay-tint", icon: <Info weight="fill" className="text-relay-link" size={18} /> },
  ok: { box: "border-live-line bg-live-tint", icon: <CheckCircle weight="fill" className="text-live-text" size={18} /> },
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
          <p className="text-sm font-medium text-ink">{title}</p>
          {children && <div className="mt-0.5 text-sm text-ink-2">{children}</div>}
        </div>
      </div>
      {action && <div className="shrink-0 pl-[30px] sm:pl-0">{action}</div>}
    </div>
  );
}

export function EmptyState({ title, children, action, className }: { title: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-start px-6 py-10 sm:px-8", className)}>
      <p className="text-md font-medium text-ink">{title}</p>
      {children && <div className="mt-1.5 max-w-[56ch] text-sm text-ink-2">{children}</div>}
      {action && <div className="mt-5 max-w-full">{action}</div>}
    </div>
  );
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-xs bg-track px-1 font-sans text-caption font-medium text-ink-2 ring-1 ring-line-strong ring-inset", className)}>
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
        <div key={s.label} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] content-start gap-x-4 bg-panel px-4 py-4 sm:px-5">
          <dt className="col-start-1 text-label text-ink-2">{s.label}</dt>
          <dd className={cn("col-start-1 mt-1.5 text-2xl font-medium tracking-tight", s.tone === "danger" ? "text-danger-text" : "text-ink")}>{s.value}</dd>
          {s.detail && <dd className="col-start-1 mt-1 text-label text-ink-2">{s.detail}</dd>}
          {s.chart && <dd className="col-start-2 row-span-3 row-start-1 hidden self-end sm:block">{s.chart}</dd>}
        </div>
      ))}
    </dl>
  );
}
