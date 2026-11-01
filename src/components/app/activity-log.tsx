"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowBendDownLeft, ArrowBendUpRight, CaretDown, PencilSimple, Play, Stop, WarningOctagon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { EmptyState, Panel, Skeleton } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/segmented";
import { dayKey, dayLabel } from "@/components/app/chat";
import { useBotActivity } from "@/lib/hooks";
import type { Activity, ActivityType } from "@/lib/types";
import { cn, formatClock, smartQuotes } from "@/lib/utils";

const KIND: Record<ActivityType, { label: string; icon: React.ReactNode; tone: string; chip: string }> = {
  message_in: { label: "Message", icon: <ArrowBendDownLeft />, tone: "text-text-2", chip: "bg-bg-3 text-text-2" },
  message_out: { label: "Reply", icon: <ArrowBendUpRight />, tone: "text-accent-text", chip: "bg-accent-tint text-accent-text" },
  started: { label: "Started", icon: <Play weight="fill" />, tone: "text-ok-text", chip: "bg-ok-tint text-ok-text" },
  stopped: { label: "Stopped", icon: <Stop weight="fill" />, tone: "text-text-2", chip: "bg-bg-3 text-text-2" },
  config_updated: { label: "Updated", icon: <PencilSimple />, tone: "text-text-2", chip: "bg-bg-3 text-text-2" },
  error: { label: "Error", icon: <WarningOctagon weight="fill" />, tone: "text-danger-text", chip: "bg-danger-tint text-danger-text" },
};

/** `key` is the value used in the `?type=` query param, so links such as `?type=errors` land filtered. */
const FILTERS = [
  { key: "", types: "", label: "All" },
  { key: "messages", types: "message_in,message_out", label: "Messages" },
  { key: "lifecycle", types: "started,stopped,config_updated", label: "Lifecycle" },
  { key: "errors", types: "error", label: "Errors" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function filterFromParam(param: string | null): (typeof FILTERS)[number] {
  const p = (param ?? "").toLowerCase();
  // Accept "error" as well as "errors"
  return FILTERS.find((f) => f.key === p || (p === "error" && f.key === "errors")) ?? FILTERS[0];
}

function groupByDay(items: Activity[]) {
  const groups: { key: string; label: string; items: Activity[] }[] = [];
  for (const a of items) {
    const key = dayKey(a.createdAt);
    const last = groups.at(-1);
    if (last && last.key === key) last.items.push(a);
    else groups.push({ key, label: dayLabel(a.createdAt), items: [a] });
  }
  return groups;
}

function TimelineRow({ a }: { a: Activity }) {
  const k = KIND[a.type];
  const [open, setOpen] = useState(false);
  const isError = a.type === "error";
  const text = a.meta?.text || a.meta?.error;
  const full = a.meta?.error || a.description;
  const body = isError ? full : text;

  const content = body ? (
    <span className={cn("block [overflow-wrap:anywhere]", isError ? "text-danger-text" : "text-text", !(isError && open) && "line-clamp-3")}>
      {a.type === "message_in" && a.meta?.fromName && <span className="text-text-2">{a.meta.fromName}: </span>}
      {isError ? smartQuotes(body) : body}
    </span>
  ) : (
    <span className="block text-text-2">{smartQuotes(a.description)}</span>
  );

  return (
    <li className="flex gap-3 px-4 py-3 sm:px-5">
      <span aria-hidden className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[15px]", k.chip)}>
        {k.icon}
      </span>
      <div className="min-w-0 flex-1 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className={cn("text-label font-medium", k.tone)}>{k.label}</span>
          <time dateTime={a.createdAt} title={new Date(a.createdAt).toLocaleString()} className="shrink-0 text-label text-text-2">
            {formatClock(a.createdAt)}
          </time>
        </div>
        {isError ? (
          <div className="mt-0.5">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="group -mx-1.5 flex w-[calc(100%+0.75rem)] items-start gap-2 rounded-md px-1.5 py-0.5 text-left hover:bg-bg-hover"
            >
              <span className="min-w-0 flex-1">{content}</span>
              <CaretDown aria-hidden className={cn("mt-1 shrink-0 text-text-2 transition-transform duration-150", open && "rotate-180")} />
              <span className="sr-only">{open ? "Collapse error" : "Show full error"}</span>
            </button>
            {open && (
              <pre className="mt-2 max-h-64 overflow-auto rounded-md border border-danger-line bg-danger-tint p-3 font-mono text-label whitespace-pre-wrap text-text [overflow-wrap:anywhere]">
                {a.meta?.error || a.description}
              </pre>
            )}
          </div>
        ) : (
          <p className="mt-0.5">{content}</p>
        )}
      </div>
    </li>
  );
}

export function ActivityLog({ botId, live }: { botId: string; live: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = filterFromParam(searchParams.get("type"));
  const [limit, setLimit] = useState(25);
  const { data, isLoading, isValidating } = useBotActivity(botId, { types: filter.types || undefined, limit, live });
  const items = data?.data;
  const groups = useMemo(() => groupByDay(items ?? []), [items]);
  const total = data?.pagination.total ?? 0;
  const count = items?.length ?? 0;

  function setFilter(key: FilterKey) {
    setLimit(25);
    router.replace(key ? `${pathname}?type=${key}` : pathname, { scroll: false });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Segmented<FilterKey> label="Filter events" value={filter.key} onChange={setFilter} options={FILTERS.map((f) => ({ value: f.key, label: f.label }))} />
        </div>
        <p className="text-label text-text-2">
          <span>{total.toLocaleString()}</span> {total === 1 ? "event" : "events"} in the last 30 days
        </p>
      </div>

      {/* overflow-clip keeps the rounded corners without becoming a scroll container, so the day headers can stick to the page header */}
      <Panel className="overflow-clip">
        {isLoading && !data ? (
          <div className="space-y-4 p-5" aria-busy="true" aria-label="Loading activity">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : count === 0 ? (
          <EmptyState title={filter.key ? "Nothing of this kind yet" : "No activity yet"}>
            {filter.key ? "No events of this type in the last 30 days." : "Starting the bot records the first event. Messages and replies follow as people write to it."}
          </EmptyState>
        ) : (
          <div>
            {groups.map((g) => (
              <section key={g.key} aria-label={g.label}>
                <h3 className="sticky top-[6.5rem] z-10 border-y border-line bg-bg-2 px-4 py-1.5 text-label font-medium text-text-2 first:border-t-0 sm:px-5">{g.label}</h3>
                <ol className="divide-y divide-line">
                  {g.items.map((a) => (
                    <TimelineRow key={a._id} a={a} />
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}
        {count < total && (
          <div className="flex items-center justify-between gap-3 border-t border-line bg-bg-2 px-5 py-3">
            <span className="text-label text-text-2">
              Showing {count} of {total.toLocaleString()}
            </span>
            <Button variant="secondary" size="sm" loading={isValidating && count < limit} onClick={() => setLimit((l) => Math.min(100, l + 25))} disabled={limit >= 100}>
              {limit >= 100 ? "Latest 100 shown" : "Show 25 more"}
            </Button>
          </div>
        )}
      </Panel>
    </div>
  );
}
