"use client";

import { useEffect, useId, useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { Lockup } from "@/components/brand/logo";
import { CreateBotButton, SignInLink } from "./auth-cta";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#personas", label: "Personas" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={cn("sticky top-0 z-40 border-b bg-bg transition-[border-color] duration-150", scrolled || open ? "border-line" : "border-transparent")}>
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-surface px-3 py-2 text-sm font-medium text-text shadow-pop focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-8 px-5 sm:px-8">
        <Lockup />
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="flex h-9 items-center rounded-md px-3 text-sm text-text-2 transition-colors duration-150 hover:bg-bg-hover hover:text-text">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SignInLink className="hidden sm:inline-flex" />
          <CreateBotButton size="sm" className="hidden sm:inline-flex" />
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-md text-text hover:bg-bg-hover md:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>
      <div id={panelId} hidden={!open} className="border-t border-line md:hidden">
        <nav aria-label="Main" className="mx-auto max-w-[1200px] px-3 py-3">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="flex h-11 items-center rounded-md px-3 text-md text-text hover:bg-bg-hover">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line px-1 pt-4">
            <SignInLink className="h-10 justify-center text-sm" />
            <CreateBotButton size="md" />
          </div>
        </nav>
      </div>
    </header>
  );
}
