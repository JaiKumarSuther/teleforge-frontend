"use client";

import { useEffect, useId, useState } from "react";
import { List, X, Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { Lockup } from "@/components/brand/logo";
import { HeaderNavAuth, MobileMenuAuth } from "./auth-cta";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#personas", label: "Personas" },
  { href: "#how", label: "How it works" },
  { href: "#showcase", label: "Overview" },
  { href: "#runtime", label: "Runtime" },
  { href: "#faq", label: "FAQ" },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="size-9 rounded-md" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex size-9 items-center justify-center rounded-md text-text-2 transition hover:bg-bg-hover hover:text-text cursor-pointer"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
    </button>
  );
}

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
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-bg/90 backdrop-blur-md transition-all duration-150",
        scrolled || open ? "border-line shadow-xs" : "border-transparent"
      )}
    >
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
                <a
                  href={l.href}
                  className="flex h-9 items-center rounded-md px-3 text-sm text-text-2 transition-colors duration-150 hover:bg-bg-hover hover:text-text"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <HeaderNavAuth />
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-md text-text hover:bg-bg-hover md:hidden cursor-pointer"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>
      <div id={panelId} hidden={!open} className="border-t border-line bg-bg px-5 py-4 md:hidden">
        <nav aria-label="Main" className="mx-auto max-w-[1200px]">
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center rounded-md px-3 text-md text-text hover:bg-bg-hover"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-line pt-4">
            <MobileMenuAuth onAction={() => setOpen(false)} />
          </div>
        </nav>
      </div>
    </header>
  );
}
