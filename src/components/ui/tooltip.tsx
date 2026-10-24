"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Shared across tooltips: once one has been shown, neighbours open instantly for a moment.
const shared = { lastHiddenAt: 0 };

/**
 * Visual label for icon-only controls (which still carry their own aria-label).
 * Hover waits 500ms, or opens instantly right after another tooltip closed;
 * keyboard focus shows it immediately; Escape hides it.
 */
export function Tooltip({
  content,
  shortcut,
  side = "bottom",
  children,
  className,
}: {
  content: string;
  shortcut?: React.ReactNode;
  side?: "top" | "bottom";
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function show(immediate: boolean) {
    if (timer.current) clearTimeout(timer.current);
    if (immediate || performance.now() - shared.lastHiddenAt < 400) setOpen(true);
    else timer.current = setTimeout(() => setOpen(true), 500);
  }

  function hide() {
    if (timer.current) clearTimeout(timer.current);
    if (open) shared.lastHiddenAt = performance.now();
    setOpen(false);
  }

  return (
    <span
      className={cn("relative inline-flex", className)}
      onPointerEnter={(e) => e.pointerType === "mouse" && show(false)}
      onPointerLeave={hide}
      onFocus={(e) => (e.target as HTMLElement).matches(":focus-visible") && show(true)}
      onBlur={hide}
      onKeyDown={(e) => e.key === "Escape" && hide()}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            "anim-pop pointer-events-none absolute left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-md bg-text px-2 py-1 text-label whitespace-nowrap text-bg shadow-pop",
            side === "bottom" ? "top-full mt-2 origin-top" : "bottom-full mb-2 origin-bottom",
          )}
        >
          {content}
          {shortcut && <span className="text-text-3">{shortcut}</span>}
        </span>
      )}
    </span>
  );
}
