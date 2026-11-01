"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/**
 * Segmented control as an ARIA radio group: one tab stop, arrow keys move the selection.
 * Concentric radii: track 6px with 2px padding, so segments are 4px.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegmentOption<T>[];
  label: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, options.findIndex((o) => o.value === value));

  function move(to: number) {
    const i = (to + options.length) % options.length;
    onChange(options[i].value);
    refs.current[i]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex h-9 shrink-0 rounded-md border border-line bg-track p-0.5", className)}>
      {options.map((o, i) => {
        const active = i === index;
        return (
          <button
            key={o.value || "all"}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                move(i + 1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                move(i - 1);
              } else if (e.key === "Home") {
                e.preventDefault();
                move(0);
              } else if (e.key === "End") {
                e.preventDefault();
                move(options.length - 1);
              }
            }}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-xs px-3 text-label whitespace-nowrap transition-[background-color,color] duration-150 motion-reduce:transition-none",
              "focus-visible:-outline-offset-2",
              active ? "bg-panel font-medium text-ink shadow-1" : "text-ink-2 hover:text-ink",
            )}
          >
            {o.label}
            {o.count !== undefined && <span className="text-ink-2">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
