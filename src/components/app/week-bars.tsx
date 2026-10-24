"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Labels for the last n local days, oldest first. Counted from local noon so DST never skips a date. */
function days(n: number) {
  const now = new Date();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 12);
    out.push(i === 0 ? "Today" : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }));
  }
  return out;
}

const describe = (label: string, v: number) => `${label}: ${v.toLocaleString()} ${v === 1 ? "message" : "messages"}`;

/**
 * Seven-day message counts as a compact bar strip beside the headline number.
 * Zero days keep a 2px stub so a sparse week still reads as a week.
 *
 * The strip is one tab stop: hover a bar, or focus the strip and use the arrow keys, to see
 * that day's count. (Seven separate buttons would be seven extra tab stops and targets too
 * small to tap.) Screen readers also get the series as a table.
 */
export function WeekBars({ values, className }: { values: number[]; className?: string }) {
  const [active, setActive] = useState<number | null>(null);
  const labels = days(values.length);
  const max = Math.max(1, ...values);
  const last = values.length - 1;

  function onKeyDown(e: React.KeyboardEvent) {
    const from = active ?? last;
    const to =
      e.key === "ArrowLeft" ? Math.max(0, from - 1) : e.key === "ArrowRight" ? Math.min(last, from + 1) : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (to !== null) {
      e.preventDefault();
      setActive(to);
    } else if (e.key === "Escape") {
      setActive(null);
    }
  }

  return (
    <figure className={cn("relative", className)}>
      <div
        role="group"
        tabIndex={0}
        aria-label="Messages per day, last 7 days. Use the left and right arrow keys to read each day."
        onKeyDown={onKeyDown}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && setActive(last)}
        onBlur={() => setActive(null)}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setActive(Math.min(last, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * values.length))));
        }}
        onPointerLeave={() => setActive(null)}
        className="flex h-11 items-end gap-[3px] rounded-xs focus-visible:outline-offset-4"
      >
        {values.map((v, i) => {
          const isToday = i === last;
          const h = v === 0 ? 2 : Math.max(4, Math.round((v / max) * 44));
          return (
            <div key={i} className="relative flex h-full w-3.5 items-end">
              <span
                aria-hidden
                className={cn(
                  "block w-full rounded-t-xs transition-colors duration-150",
                  v === 0 ? "bg-line-2" : isToday ? "bg-accent" : "bg-accent-line",
                  active === i && v > 0 && !isToday && "bg-accent-hover",
                )}
                style={{ height: h }}
              />
              {active === i && (
                <span
                  aria-hidden
                  className="anim-pop pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 origin-bottom -translate-x-1/2 rounded-md bg-text px-2 py-1 text-caption whitespace-nowrap text-bg shadow-pop"
                >
                  <span className="font-medium">{v.toLocaleString()}</span> {labels[i]}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {/* Announces the day the arrow keys land on */}
      <p className="sr-only" aria-live="polite">
        {active !== null ? describe(labels[active], values[active]) : ""}
      </p>
      <table className="sr-only">
        <caption>Messages received per day, last 7 days</caption>
        <tbody>
          {values.map((v, i) => (
            <tr key={i}>
              <th scope="row">{labels[i]}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
