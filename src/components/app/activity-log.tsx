"use client";

import { useState } from "react";
import { ArrowBendDownLeft, ArrowBendUpRight, PencilSimple, Play, Stop, WarningOctagon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { EmptyState, Panel, Skeleton } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/segmented";
import { useBotActivity } from "@/lib/hooks";
import type { ActivityType } from "@/lib/types";
import { cn, formatClock, smartQuotes } from "@/lib/utils";

const KIND: Record<ActivityType, { label: string; icon: React.ReactNode; tone: string }> = {
  message_in: { label: "Message", icon: <ArrowBendDownLeft />, tone: "text-text-2" },
  message_out: { label: "Reply", icon: <ArrowBendUpRight />, tone: "text-accent-text" },
  started: { label: "Started", icon: <Play />, tone: "text-ok-text" },
  stopped: { label: "Stopped", icon: <Stop />, tone: "text-text-2" },
  config_updated: { label: "Updated", icon: <PencilSimple />, tone: "text-text-2" },
  error: { label: "Error", icon: <WarningOctagon />, tone: "text-danger-text" },
};

const FILTERS = [
  { value: "", label: "All" },
  { value: "message_in,message_out", label: "Messages" },
  { value: "started,stopped,config_updated", label: "Lifecycle" },
  { value: "error", label: "Errors" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

function when(iso: string) {
  const d = new Date(iso);
  const today = d.toDateString() === new Date().toDateString();
  return { time: formatClock(d), date: today ? null : d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) };
}

export function ActivityLog({ botId, live }: { botId: string; live: boolean }) {
  const [limit, setLimit] = useState(25);
  const [types, setTypes] = useState<Filter>("");
  const { data, isLoading, isValidating } = useBotActivity(botId, { types: types || undefined, limit, live });
  const items = data?.data ?? [];
  const total = data?.pagination.total ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Segmented<Filter>
            label="Filter events"
            value={types}
            onChange={(v) => {
              setTypes(v);
              setLimit(25);
            }}
            options={FILTERS.map((f) => ({ value: f.value, label: f.label }))}
          />
        </div>
        <p className="text-label text-text-2">
          <span>{total.toLocaleString()}</span> {total === 1 ? "event" : "events"} in the last 30 days
        </p>
      </div>

      <Panel className="overflow-hidden">
        {isLoading && !data ? (
          <div className="space-y-4 p-5" aria-busy="true" aria-label="Loading activity">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title={types ? "Nothing of this kind yet" : "No activity yet"}>
            {types ? "No events of this type in the last 30 days." : "Starting the bot records the first event. Messages and replies follow as people write to it."}
          </EmptyState>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sr-only sm:not-sr-only">
              <tr className="border-b border-line bg-bg-2 text-label text-text-2">
                <th scope="col" className="w-28 py-2.5 pr-3 pl-5 font-normal">Time</th>
                <th scope="col" className="w-32 px-3 py-2.5 font-normal">Event</th>
                <th scope="col" className="py-2.5 pr-5 pl-3 font-normal">Details</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => {
                const k = KIND[a.type];
                const w = when(a.createdAt);
                const text = a.meta?.text || a.meta?.error;
                return (
                  <tr
                    key={a._id}
                    className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-b border-line px-4 py-3 last:border-b-0 sm:table-row sm:px-0 sm:py-0"
                  >
                    <td className="order-2 text-label text-text-2 sm:order-none sm:py-3 sm:pr-3 sm:pl-5 sm:align-top sm:text-sm" title={new Date(a.createdAt).toLocaleString()}>
                      {w.time}
                      {w.date && <span className="ml-1 text-text-2 sm:ml-0 sm:block sm:text-label">{w.date}</span>}
                    </td>
                    <td className={cn("order-1 sm:order-none sm:px-3 sm:py-3 sm:align-top", k.tone)}>
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        {k.icon}
                        {k.label}
                      </span>
                    </td>
                    <td className="order-3 col-span-2 min-w-0 sm:py-3 sm:pr-5 sm:pl-3 sm:align-top">
                      {text ? (
                        <p className={cn("line-clamp-3 [overflow-wrap:anywhere]", a.type === "error" ? "text-danger-text" : "text-text")} title={text}>
                          {a.type === "message_in" && a.meta?.fromName && <span className="text-text-2">{a.meta.fromName}: </span>}
                          {text}
                        </p>
                      ) : (
                        <p className="text-text-2">{smartQuotes(a.description)}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {items.length < total && (
          <div className="flex items-center justify-between gap-3 border-t border-line bg-bg-2 px-5 py-3">
            <span className="text-label text-text-2">
              Showing {items.length} of {total.toLocaleString()}
            </span>
            <Button variant="secondary" size="sm" loading={isValidating && items.length < limit} onClick={() => setLimit((l) => Math.min(100, l + 25))} disabled={limit >= 100}>
              {limit >= 100 ? "Latest 100 shown" : "Show 25 more"}
            </Button>
          </div>
        )}
      </Panel>
    </div>
  );
}
