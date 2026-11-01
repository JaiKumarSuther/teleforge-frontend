"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAnimatedTheme } from "@/lib/use-animated-theme";
import { CaretUpDown, Desktop, Gear, MagnifyingGlass, Moon, Plus, SignOut, SquaresFour, Sun } from "@phosphor-icons/react";
import { Mark } from "@/components/brand/logo";
import { Menu, type MenuEntry } from "@/components/ui/menu";
import { BotAvatar, Kbd, UserAvatar } from "@/components/ui/misc";
import { Tooltip } from "@/components/ui/tooltip";
import { buttonClass } from "@/components/ui/button";
import { CommandMenu } from "@/components/app/command-menu";
import { useAuth } from "@/lib/auth";
import { useBot, useBots } from "@/lib/hooks";
import type { BotStatus } from "@/lib/types";
import { openCommandMenu, useIsMac } from "@/lib/use-platform";
import { cn } from "@/lib/utils";

const DOT: Record<BotStatus, string> = {
  active: "bg-ok",
  stopped: "bg-text-3",
  draft: "border-[1.5px] border-text-3",
  error: "bg-danger",
};

/** /bots/:id/... → id ; /bots/new → null */
export function botIdFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/bots\/([^/]+)/);
  return m && m[1] !== "new" ? m[1] : null;
}

function ScopeSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const botId = botIdFromPath(pathname);
  const { data: bot } = useBot(botId ?? undefined);
  const { data } = useBots();
  const bots = data?.data ?? [];

  const items: MenuEntry[] = [
    { label: "All bots", icon: <SquaresFour />, href: "/dashboard" },
    ...(bots.length ? [{ type: "separator" } as const, { type: "label", label: "Your bots" } as const] : []),
    ...bots.map((b) => ({
      label: b.name,
      icon: <span aria-hidden className={cn("mx-[3px] size-2 rounded-full", DOT[b.status])} />,
      onSelect: () => router.push(`/bots/${b._id}`),
      hint: b._id === botId ? "Current" : undefined,
    })),
    { type: "separator" },
    { label: "New bot", icon: <Plus />, href: "/bots/new" },
  ];

  const current = botId ? bot?.name ?? "Loading…" : pathname === "/bots/new" ? "New bot" : "All bots";

  return (
    <Menu
      align="start"
      label="Switch bot"
      wrapperClassName="min-w-0"
      items={items}
      trigger={(props) => (
        <button
          {...props}
          type="button"
          className="flex h-9 min-w-0 items-center gap-2 rounded-md px-2 text-sm font-medium text-text hover:bg-bg-hover"
        >
          {botId && bot ? <BotAvatar name={bot.name} seed={bot._id} size={22} /> : <SquaresFour className="text-text-2" size={18} />}
          <span className="min-w-0 truncate sm:max-w-64">{current}</span>
          <CaretUpDown className="shrink-0 text-text-3" />
        </button>
      )}
    />
  );
}

function AccountMenu() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useAnimatedTheme();
  const items: MenuEntry[] = [
    {
      type: "label",
      label: (
        <span className="flex flex-col">
          <span className="text-sm font-medium text-text">{user?.name}</span>
          <span className="truncate">{user?.email}</span>
        </span>
      ),
    },
    { type: "separator" },
    { label: "Account settings", icon: <Gear />, href: "/settings" },
    { type: "separator" },
    { type: "label", label: "Theme" },
    { type: "radio", label: "System", icon: <Desktop />, checked: theme === "system" || !theme, onSelect: () => setTheme("system") },
    { type: "radio", label: "Light", icon: <Sun />, checked: theme === "light", onSelect: () => setTheme("light") },
    { type: "radio", label: "Dark", icon: <Moon />, checked: theme === "dark", onSelect: () => setTheme("dark") },
    { type: "separator" },
    { label: "Log out", icon: <SignOut />, onSelect: () => signOut() },
  ];
  return (
    <Menu
      items={items}
      label="Account"
      trigger={(props) => (
        <button {...props} type="button" className="flex size-9 items-center justify-center rounded-full hover:bg-bg-hover">
          <span className="sr-only">Account menu for </span>
          <UserAvatar name={user?.name || "?"} size={28} />
        </button>
      )}
    />
  );
}

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
                  "my-1.5 flex h-8 items-center rounded-md px-3 text-sm whitespace-nowrap transition-colors duration-150",
                  active ? "font-medium text-text" : "text-text-2 hover:bg-bg-hover hover:text-text",
                )}
              >
                {t.label}
              </Link>
              {active && <span aria-hidden className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-text" />}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMac = useIsMac();
  const botId = botIdFromPath(pathname);

  const tabs: Tab[] = botId
    ? [
        { href: `/bots/${botId}`, label: "Conversations", exact: true },
        { href: `/bots/${botId}/activity`, label: "Activity" },
        { href: `/bots/${botId}/persona`, label: "Persona" },
        { href: `/bots/${botId}/settings`, label: "Settings" },
      ]
    : [
        { href: "/dashboard", label: "Overview" },
        { href: "/settings", label: "Settings" },
      ];

  return (
    <div className="min-h-dvh bg-bg">
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-surface px-3 py-2 text-sm font-medium text-text shadow-pop focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-bg">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-1 px-3 sm:px-6 lg:px-8">
          <Link href="/dashboard" aria-label="TeleForge overview" className="flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-bg-hover">
            <Mark size={26} priority />
          </Link>
          <span aria-hidden className="mx-0.5 text-lg text-line-2 select-none">
            /
          </span>
          <ScopeSwitcher />

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={openCommandMenu}
              className="hidden h-9 w-56 items-center gap-2 rounded-md bg-bg-3 pr-1.5 pl-3 text-sm text-text-2 transition-colors duration-150 hover:bg-bg-hover hover:text-text md:flex"
            >
              <MagnifyingGlass />
              <span className="flex-1 text-left">Search or jump to…</span>
              <Kbd>{isMac === false ? "Ctrl K" : "⌘K"}</Kbd>
            </button>
            <Tooltip content="Search" shortcut={isMac === false ? "Ctrl K" : "⌘K"} className="md:hidden">
              <button type="button" onClick={openCommandMenu} aria-label="Search" className={cn(buttonClass({ variant: "ghost", size: "md", icon: true }), "size-9")}>
                <MagnifyingGlass size={18} />
              </button>
            </Tooltip>
            <Link href="/bots/new" className={cn(buttonClass({ variant: "secondary", size: "sm" }), "hidden sm:inline-flex")}>
              <Plus weight="bold" size={14} />
              New bot
            </Link>
            <Tooltip content="New bot" className="sm:hidden">
              <Link href="/bots/new" aria-label="New bot" className={cn(buttonClass({ variant: "ghost", size: "md", icon: true }), "size-9")}>
                <Plus size={18} />
              </Link>
            </Tooltip>
            <AccountMenu />
          </div>
        </div>
        <div className="mx-auto max-w-[1200px] px-1 sm:px-4 lg:px-6">
          <NavTabs tabs={tabs} />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1200px] px-4 pt-6 pb-24 outline-none sm:px-6 lg:px-8 lg:pt-8">
        {children}
      </main>

      <CommandMenu />
    </div>
  );
}

export function FullScreenLoader({ label = "Loading your bots…" }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg" role="status">
      <Mark size={32} priority />
      <p className="text-sm text-text-2">{label}</p>
    </div>
  );
}
