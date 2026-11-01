"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretUpDown, Desktop, Gear, List, MagnifyingGlass, Moon, Plus, SignOut, SquaresFour, Sun, X } from "@phosphor-icons/react";
import { CommandMenu } from "@/components/app/command-menu";
import { Lockup, Mark } from "@/components/brand/logo";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { Menu, type MenuEntry } from "@/components/ui/menu";
import { BotAvatar, Kbd, statusLabel, UserAvatar } from "@/components/ui/misc";
import { Tooltip } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";
import { useBot, useBots } from "@/lib/hooks";
import type { Bot } from "@/lib/types";
import { useAnimatedTheme } from "@/lib/use-animated-theme";
import { openCommandMenu, useIsMac } from "@/lib/use-platform";
import { cn, compactNumber, shortAgo } from "@/lib/utils";

/** /bots/:id/... → id ; /bots/new → null */
export function botIdFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/bots\/([^/]+)/);
  return m && m[1] !== "new" ? m[1] : null;
}

/* ── Page actions slot ──────────────────────────────────────
   Pages render <PageActions>…</PageActions> and the buttons appear at the right of the top bar. */

const ActionsSlot = createContext<HTMLElement | null>(null);

export function PageActions({ children }: { children: React.ReactNode }) {
  const slot = useContext(ActionsSlot);
  return slot ? createPortal(children, slot) : null;
}

/* ── Rail ───────────────────────────────────────────────── */

// The dot sits on the avatar with a cut-out in the row's colour, so the ring has to follow hover and selection.
const RING_IDLE = "ring-rail group-hover/row:ring-rail-hover";
const RING_ACTIVE = "ring-rail-active";

function previewOf(bot: Bot): { text: string; error: boolean } {
  if (bot.status === "error" && bot.lastError) return { text: bot.lastError, error: true };
  const last = bot.stats?.lastMessage;
  if (last?.text) return { text: last.text, error: false };
  return { text: bot.status === "draft" ? "Draft, not started yet" : "No messages yet", error: false };
}

function BotRow({ bot, selected, onNavigate }: { bot: Bot; selected: boolean; onNavigate: () => void }) {
  const preview = previewOf(bot);
  const today = bot.stats?.messagesToday ?? 0;
  const at = bot.stats?.lastMessage?.at;
  return (
    <li>
      <Link
        href={`/bots/${bot._id}`}
        onClick={onNavigate}
        aria-current={selected ? "page" : undefined}
        className={cn(
          "group/row grid min-h-16 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 rounded-md px-3 py-2 -outline-offset-2",
          selected ? "bg-rail-active" : "hover:bg-rail-hover",
        )}
      >
        <BotAvatar name={bot.name} seed={bot._id} size={40} status={bot.status} ringClass={selected ? RING_ACTIVE : RING_IDLE} />
        <span className="grid min-w-0 gap-0.5">
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-rail-ink">{bot.name}</span>
            {at && <span className="shrink-0 font-mono text-caption text-rail-ink-2">{shortAgo(at)}</span>}
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <span className={cn("min-w-0 flex-1 truncate text-label", preview.error ? "text-rail-danger" : "text-rail-ink-2")}>
              <span className="sr-only">{statusLabel(bot.status)}. </span>
              {preview.text}
            </span>
            {today > 0 && (
              <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-relay px-1.5 text-caption font-medium text-on-relay">
                {compactNumber(today)}
                <span className="sr-only"> messages today</span>
              </span>
            )}
          </span>
        </span>
      </Link>
    </li>
  );
}

function RailSkeleton() {
  return (
    <ul aria-hidden className="space-y-1">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="grid min-h-16 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 px-3 py-2">
          <div className="size-10 rounded-full bg-rail-hover" />
          <div className="space-y-2">
            <div className="h-3.5 w-2/3 rounded-xs bg-rail-hover" />
            <div className="h-3 w-full rounded-xs bg-rail-hover" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function AccountMenu() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useAnimatedTheme();
  const items: MenuEntry[] = [
    {
      type: "label",
      label: (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-ink">{user?.name}</span>
          <span className="truncate">{user?.email}</span>
        </span>
      ),
    },
    { type: "separator" },
    { type: "label", label: "Theme" },
    { type: "radio", label: "Light", icon: <Sun />, checked: theme === "light", onSelect: () => setTheme("light") },
    { type: "radio", label: "Dark", icon: <Moon />, checked: theme === "dark", onSelect: () => setTheme("dark") },
    { type: "radio", label: "System", icon: <Desktop />, checked: theme === "system" || !theme, onSelect: () => setTheme("system") },
    { type: "separator" },
    { label: "Settings", icon: <Gear />, href: "/settings" },
    { label: "Log out", icon: <SignOut />, onSelect: () => signOut() },
  ];
  return (
    <Menu
      items={items}
      label="Account"
      side="top"
      align="start"
      wrapperClassName="w-full"
      className="w-full"
      trigger={(props) => (
        <button
          {...props}
          type="button"
          className="flex h-12 w-full min-w-0 items-center gap-3 rounded-md px-3 text-left hover:bg-rail-hover aria-expanded:bg-rail-hover"
        >
          <UserAvatar name={user?.name || "?"} size={32} className="bg-rail-ink text-rail" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-rail-ink">
            <span className="sr-only">Account menu for </span>
            {user?.name}
          </span>
          <CaretUpDown aria-hidden className="shrink-0 text-rail-ink-2" />
        </button>
      )}
    />
  );
}

/** The chat list. Rendered once in the fixed rail and again inside the drawer on small screens. */
function Rail({ onNavigate, headerAction }: { onNavigate: () => void; headerAction?: React.ReactNode }) {
  const pathname = usePathname();
  const currentBotId = botIdFromPath(pathname);
  const { data, isLoading } = useBots();
  const [query, setQuery] = useState("");

  const bots = useMemo(() => {
    const list = [...(data?.data ?? [])];
    const stamp = (b: Bot) => new Date(b.stats?.lastMessage?.at ?? b.createdAt).getTime();
    return list.sort((a, b) => stamp(b) - stamp(a));
  }, [data]);

  const q = query.trim().replace(/^@/, "").toLowerCase();
  const shown = q ? bots.filter((b) => b.name.toLowerCase().includes(q) || (b.telegramBotInfo.username ?? "").toLowerCase().includes(q)) : bots;
  const onDashboard = pathname === "/dashboard";

  return (
    <div className="flex h-full min-h-0 flex-col bg-rail text-rail-ink">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 px-4">
        <Lockup href="/dashboard" inverse ariaLabel="TeleForge, all bots" size={28} className="-ml-1 px-1 py-1" />
        {headerAction}
      </div>

      <div className="shrink-0 space-y-2 px-3 pb-2">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          aria-current={onDashboard ? "page" : undefined}
          className={cn(
            "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium -outline-offset-2",
            onDashboard ? "bg-rail-active text-rail-ink" : "text-rail-ink hover:bg-rail-hover",
          )}
        >
          <SquaresFour size={18} aria-hidden className="shrink-0 text-rail-ink-2" />
          <span className="min-w-0 flex-1 truncate">All bots</span>
          {bots.length > 0 && <span className="shrink-0 font-mono text-caption text-rail-ink-2">{bots.length}</span>}
        </Link>

        <div className="relative">
          <label htmlFor="rail-search" className="sr-only">
            Search bots by name or @username
          </label>
          <MagnifyingGlass aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-rail-ink-2" />
          <input
            id="rail-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bots"
            autoComplete="off"
            spellCheck={false}
            className="block h-9 w-full rounded-md border border-rail-line bg-rail-field pr-3 pl-9 text-md text-rail-ink placeholder:text-rail-ink-2 hover:border-rail-ink-3 focus-visible:-outline-offset-1 sm:text-sm [&::-webkit-search-cancel-button]:appearance-none"
          />
        </div>
      </div>

      <nav aria-label="Bots" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-2">
        {isLoading && !data ? (
          <RailSkeleton />
        ) : shown.length > 0 ? (
          <ul className="space-y-0.5">
            {shown.map((b) => (
              <BotRow key={b._id} bot={b} selected={b._id === currentBotId} onNavigate={onNavigate} />
            ))}
          </ul>
        ) : (
          <p className="px-3 py-6 text-label text-rail-ink-2">
            {q ? (
              <>No bot matches &ldquo;{query.trim()}&rdquo;.</>
            ) : (
              <>No bots yet. Create one to see its conversations here.</>
            )}
          </p>
        )}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-rail-line p-3">
        <ButtonLink href="/bots/new" onClick={onNavigate} className="w-full">
          <Plus weight="bold" size={14} />
          New bot
        </ButtonLink>
        <AccountMenu />
      </div>
    </div>
  );
}

/* ── Drawer (below 1024px) ──────────────────────────────── */

/**
 * Slide-over built on the native <dialog> + showModal(): the page behind is inert, focus is trapped inside,
 * Escape closes. Clicking the scrim closes it, and focus goes back to the menu button.
 */
function Drawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // Land on the close button, not the search field: that would open the keyboard on phones.
      d.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="tf-dialog lg:hidden"
      aria-label="Navigation"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        // Native modals let Tab reach the browser's own UI; wrap at the ends so focus stays in the drawer.
        if (e.key !== "Tab") return;
        const els = Array.from(
          ref.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? [],
        ).filter((el) => el.offsetParent !== null);
        const first = els[0];
        const last = els[els.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }}
    >
      {open && (
        <div className="fixed inset-0">
          <div className="anim-scrim absolute inset-0 bg-scrim" onClick={onClose} aria-hidden />
          <div className="anim-drawer relative h-full w-72 max-w-[calc(100vw-3rem)] shadow-pop">{children}</div>
        </div>
      )}
    </dialog>
  );
}

/* ── Top bar ────────────────────────────────────────────── */

type Tab = { href: string; label: string; exact?: boolean };

function NavTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Section" className="no-scrollbar -mb-px flex overflow-x-auto">
      <ul className="flex gap-1">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <li key={t.href} className="relative shrink-0">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "my-1 flex h-8 items-center rounded-md px-3 text-sm whitespace-nowrap transition-colors duration-150 motion-reduce:transition-none",
                  active ? "font-medium text-ink" : "text-ink-2 hover:bg-hover hover:text-ink",
                )}
              >
                {t.label}
              </Link>
              {active && <span aria-hidden className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-relay" />}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function usePageTitle(): { title: string; handle?: string | null } {
  const pathname = usePathname();
  const botId = botIdFromPath(pathname);
  const { data: bot } = useBot(botId ?? undefined);
  if (botId) return { title: bot?.name ?? "Loading…", handle: bot?.telegramBotInfo.username };
  if (pathname === "/bots/new") return { title: "New bot" };
  if (pathname.startsWith("/settings")) return { title: "Settings" };
  return { title: "All bots" };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMac = useIsMac();
  const botId = botIdFromPath(pathname);
  const { title, handle } = usePageTitle();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Any navigation (including the Settings link in the account menu) puts the drawer away.
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setDrawerOpen(false);
  }

  const closeDrawer = useCallback((returnFocus = true) => {
    setDrawerOpen(false);
    if (returnFocus) menuButton.current?.focus();
  }, []);

  // The drawer only exists below 1024px; if the window grows past that, put it away.
  useEffect(() => {
    if (!drawerOpen) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setDrawerOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [drawerOpen]);

  const tabs: Tab[] | null = botId
    ? [
        { href: `/bots/${botId}`, label: "Conversations", exact: true },
        { href: `/bots/${botId}/activity`, label: "Activity" },
        { href: `/bots/${botId}/persona`, label: "Persona" },
        { href: `/bots/${botId}/settings`, label: "Settings" },
      ]
    : null;

  const shortcut = isMac === false ? "Ctrl K" : "⌘K";

  return (
    <ActionsSlot.Provider value={slot}>
      <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
        <a
          href="#main"
          className="sr-only z-[60] rounded-md border border-line bg-panel px-3 py-2 text-sm font-medium text-ink shadow-pop focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>

        <aside aria-label="Bots" className="sticky top-0 hidden h-dvh border-r border-rail-line lg:block">
          <Rail onNavigate={() => {}} />
        </aside>

        <Drawer open={drawerOpen} onClose={() => closeDrawer()}>
          <Rail
            onNavigate={() => closeDrawer()}
            headerAction={
              <button
                type="button"
                data-autofocus
                onClick={() => closeDrawer()}
                aria-label="Close navigation"
                className="flex size-9 items-center justify-center rounded-md text-rail-ink-2 hover:bg-rail-hover hover:text-rail-ink"
              >
                <X size={18} />
              </button>
            }
          />
        </Drawer>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-40 border-b border-line bg-paper">
            <div className="flex h-14 items-center gap-2 px-3 sm:px-6">
              <button
                ref={menuButton}
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation"
                aria-haspopup="dialog"
                aria-expanded={drawerOpen}
                className={cn(buttonClass({ variant: "ghost", size: "md", icon: true }), "-ml-1 size-9 lg:hidden")}
              >
                <List size={20} />
              </button>
              <Link href="/dashboard" aria-label="TeleForge, all bots" className="flex size-9 shrink-0 items-center justify-center rounded-md lg:hidden">
                <Mark size={24} priority />
              </Link>

              <div className="flex min-w-0 flex-1 items-baseline gap-2">
                <p className="min-w-0 truncate text-md font-semibold text-ink">{title}</p>
                {handle && <span className="hidden shrink-0 font-mono text-label text-ink-2 sm:inline">@{handle}</span>}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={openCommandMenu}
                  className="hidden h-9 w-56 items-center gap-2 rounded-md border border-line-strong bg-panel pr-1.5 pl-3 text-sm text-ink-2 transition-colors duration-150 hover:bg-hover hover:text-ink motion-reduce:transition-none md:flex"
                >
                  <MagnifyingGlass aria-hidden />
                  <span className="flex-1 text-left">Search or jump to…</span>
                  <Kbd>{shortcut}</Kbd>
                </button>
                <Tooltip content="Search" shortcut={shortcut} className="md:hidden">
                  <button type="button" onClick={openCommandMenu} aria-label="Search" className={cn(buttonClass({ variant: "ghost", size: "md", icon: true }), "size-9")}>
                    <MagnifyingGlass size={18} />
                  </button>
                </Tooltip>
                <div ref={setSlot} className="flex items-center gap-2 empty:hidden" />
              </div>
            </div>
            {tabs && (
              <div className="px-1 sm:px-4">
                <NavTabs tabs={tabs} />
              </div>
            )}
          </header>

          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1200px] min-w-0 flex-1 px-4 pt-6 pb-24 outline-none sm:px-6 lg:px-8 lg:pt-8">
            {children}
          </main>
        </div>

        <CommandMenu />
      </div>
    </ActionsSlot.Provider>
  );
}

export function FullScreenLoader({ label = "Loading your bots…" }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-paper" role="status">
      <Mark size={32} priority />
      <p className="text-sm text-ink-2">{label}</p>
    </div>
  );
}
