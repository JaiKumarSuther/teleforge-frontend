"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type MenuEntry =
  | { type?: "item"; label: string; icon?: React.ReactNode; onSelect?: () => void; href?: string; external?: boolean; danger?: boolean; hint?: React.ReactNode }
  | { type: "radio"; label: string; icon?: React.ReactNode; checked: boolean; onSelect: () => void }
  | { type: "separator" }
  | { type: "label"; label: React.ReactNode };

type TriggerProps = {
  ref: React.Ref<HTMLButtonElement>;
  id: string;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

/**
 * Menu button following the WAI-ARIA APG pattern:
 * Enter/Space/↓ open and focus the first item, ↑ the last; ↑/↓/Home/End move;
 * Esc closes and returns focus to the trigger; Tab closes.
 */
export function Menu({
  trigger,
  items,
  align = "end",
  side = "bottom",
  className,
  wrapperClassName,
  label,
}: {
  trigger: (props: TriggerProps, state: { open: boolean }) => React.ReactNode;
  items: MenuEntry[];
  align?: "start" | "end";
  side?: "bottom" | "top";
  className?: string;
  /** Classes for the element wrapping the trigger, e.g. min-w-0 so it can shrink in a flex row */
  wrapperClassName?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<"first" | "last" | null>(null);
  const triggerId = useId();
  const menuId = useId();

  const itemEls = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? []);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const els = itemEls();
    if (pendingFocus.current === "last") els[els.length - 1]?.focus();
    else if (pendingFocus.current === "first") els[0]?.focus();
    else menuRef.current?.focus();
    pendingFocus.current = null;

    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function onTriggerKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pendingFocus.current = "first";
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      pendingFocus.current = "last";
      setOpen(true);
    }
  }

  function onMenuKey(e: React.KeyboardEvent) {
    const els = itemEls();
    const i = els.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      els[(i + 1) % els.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      els[(i - 1 + els.length) % els.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      els[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      els[els.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close(false);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      // type-ahead: jump to the next item starting with the typed letter
      const k = e.key.toLowerCase();
      const order = [...els.slice(i + 1), ...els.slice(0, i + 1)];
      order.find((el) => el.textContent?.trim().toLowerCase().startsWith(k))?.focus();
    }
  }

  const itemClass = (danger?: boolean) =>
    cn(
      "flex h-9 w-full items-center gap-2.5 rounded-sm px-2.5 text-left text-sm outline-none select-none",
      "focus-visible:outline-none focus:bg-hover",
      danger ? "text-danger-text focus:bg-danger-tint" : "text-ink",
      "[&_svg]:shrink-0",
      danger ? "[&_svg]:text-danger-text" : "[&_svg]:text-ink-2",
    );

  return (
    <div ref={wrapRef} className={cn("relative inline-flex", wrapperClassName)}>
      {trigger(
        {
          ref: triggerRef,
          id: triggerId,
          "aria-haspopup": "menu",
          "aria-expanded": open,
          "aria-controls": menuId,
          onClick: () => {
            pendingFocus.current = null;
            setOpen((o) => !o);
          },
          onKeyDown: onTriggerKey,
        },
        { open },
      )}
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          tabIndex={-1}
          aria-labelledby={label ? undefined : triggerId}
          aria-label={label}
          onKeyDown={onMenuKey}
          className={cn(
            "anim-pop absolute z-50 min-w-56 rounded-lg border border-line bg-panel p-1 shadow-pop outline-none",
            side === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5",
            align === "end" ? "right-0" : "left-0",
            side === "bottom" ? (align === "end" ? "origin-top-right" : "origin-top-left") : align === "end" ? "origin-bottom-right" : "origin-bottom-left",
            className,
          )}
        >
          {items.map((it, i) => {
            if (it.type === "separator") return <div key={`s${i}`} role="separator" className="-mx-1 my-1 h-px bg-line" />;
            if (it.type === "label")
              return (
                <div key={`l${i}`} role="presentation" className="px-2.5 pt-2 pb-1 text-label text-ink-2">
                  {it.label}
                </div>
              );
            if (it.type === "radio")
              return (
                <button
                  key={it.label}
                  type="button"
                  role="menuitemradio"
                  aria-checked={it.checked}
                  tabIndex={-1}
                  className={itemClass()}
                  onClick={() => {
                    it.onSelect();
                    close();
                  }}
                >
                  {it.icon}
                  <span className="flex-1">{it.label}</span>
                  {it.checked && <Check weight="bold" className="text-relay-link!" />}
                </button>
              );
            const content = (
              <>
                {it.icon}
                <span className="flex-1 truncate">{it.label}</span>
                {it.hint && <span className="text-label text-ink-2">{it.hint}</span>}
              </>
            );
            if (it.href) {
              return it.external ? (
                <a key={it.label} role="menuitem" tabIndex={-1} href={it.href} target="_blank" rel="noreferrer" className={itemClass(it.danger)} onClick={() => close(false)}>
                  {content}
                </a>
              ) : (
                <Link key={it.label} role="menuitem" tabIndex={-1} href={it.href} className={itemClass(it.danger)} onClick={() => close(false)}>
                  {content}
                </Link>
              );
            }
            return (
              <button
                key={it.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={itemClass(it.danger)}
                onClick={() => {
                  close();
                  it.onSelect?.();
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
