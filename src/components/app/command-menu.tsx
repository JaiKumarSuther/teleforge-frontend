"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  ArrowSquareOut,
  ChatsCircle,
  Copy,
  Desktop,
  Gear,
  MagnifyingGlass,
  Moon,
  Play,
  Plus,
  Pulse,
  SignOut,
  SquaresFour,
  Stop,
  Sun,
  UserCircle,
  Notepad,
} from "@phosphor-icons/react";
import { BotAvatar } from "@/components/ui/misc";
import { useToggleBot } from "@/components/app/bot-list";
import { useAuth } from "@/lib/auth";
import { useBot, useBots } from "@/lib/hooks";
import { OPEN_COMMAND_EVENT } from "@/lib/use-platform";

function botIdFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/bots\/([^/]+)/);
  return m && m[1] !== "new" ? m[1] : null;
}

/**
 * ⌘K / Ctrl+K command menu. Opens instantly with no animation: it's used many times a day,
 * and motion would only slow it down.
 */
export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { signOut } = useAuth();
  const { data } = useBots();
  const bots = data?.data ?? [];
  const botId = botIdFromPath(pathname);
  const { data: bot } = useBot(botId ?? undefined);
  const toggleBot = useToggleBot();

  const show = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      const t = e.target as HTMLElement | null;
      const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_EVENT, show);
    };
  }, [show]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      returnTo.current = document.activeElement as HTMLElement | null;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
      setQuery("");
      returnTo.current?.focus?.();
    }
  }, [open]);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  const item =
    "flex h-10 cursor-pointer items-center gap-3 rounded-md px-3 text-sm text-text select-none data-[selected=true]:bg-bg-hover [&_svg]:shrink-0 [&_svg]:text-text-2";
  const group = "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-label [&_[cmdk-group-heading]]:text-text-2";

  return (
    <dialog
      ref={ref}
      className="tf-dialog"
      aria-label="Command menu"
      onCancel={(e) => {
        e.preventDefault();
        setOpen(false);
      }}
    >
      {open && (
        <div className="fixed inset-0 flex items-start justify-center px-3 pt-[12vh] sm:px-6">
          <div className="absolute inset-0 bg-scrim" onClick={() => setOpen(false)} aria-hidden />
          <Command label="Command menu" loop className="relative w-full max-w-xl overflow-hidden rounded-xl bg-surface shadow-pop outline-none">
            <div className="flex items-center gap-3 border-b border-line px-4">
              <MagnifyingGlass size={18} className="shrink-0 text-text-2" />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search bots, pages and actions…"
                className="h-13 w-full bg-transparent text-md text-text outline-none placeholder:text-placeholder sm:text-sm"
              />
            </div>
            <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain p-1.5">
              <Command.Empty className="px-3 py-8 text-center text-sm text-text-2">Nothing matches “{query}”.</Command.Empty>

              {bot && (
                <Command.Group heading={bot.name} className={group}>
                  {bot.status === "active" ? (
                    <Command.Item className={item} onSelect={() => run(() => toggleBot(bot))} keywords={["stop", "pause"]}>
                      <Stop /> Stop {bot.name}
                    </Command.Item>
                  ) : (
                    <Command.Item className={item} onSelect={() => run(() => toggleBot(bot))} keywords={["start", "run", "retry"]}>
                      <Play /> {bot.status === "error" ? "Retry" : "Start"} {bot.name}
                    </Command.Item>
                  )}
                  <Command.Item className={item} onSelect={() => run(() => router.push(`/bots/${bot._id}`))}>
                    <ChatsCircle /> Conversations
                  </Command.Item>
                  <Command.Item className={item} onSelect={() => run(() => router.push(`/bots/${bot._id}/activity`))}>
                    <Pulse /> Activity log
                  </Command.Item>
                  <Command.Item className={item} onSelect={() => run(() => router.push(`/bots/${bot._id}/persona`))}>
                    <Notepad /> Edit persona
                  </Command.Item>
                  {bot.telegramBotInfo.username && (
                    <>
                      <Command.Item
                        className={item}
                        onSelect={() =>
                          run(() => navigator.clipboard?.writeText(`@${bot.telegramBotInfo.username}`).then(() => toast.success("Username copied")))
                        }
                      >
                        <Copy /> Copy @{bot.telegramBotInfo.username}
                      </Command.Item>
                      <Command.Item className={item} onSelect={() => run(() => window.open(`https://t.me/${bot.telegramBotInfo.username}`, "_blank", "noopener"))}>
                        <ArrowSquareOut /> Open in Telegram
                      </Command.Item>
                    </>
                  )}
                </Command.Group>
              )}

              {bots.length > 0 && (
                <Command.Group heading="Bots" className={group}>
                  {bots.map((b) => (
                    <Command.Item key={b._id} value={`bot ${b.name} ${b.telegramBotInfo.username ?? ""}`} className={item} onSelect={() => run(() => router.push(`/bots/${b._id}`))}>
                      <BotAvatar name={b.name} seed={b._id} size={20} />
                      <span className="flex-1 truncate">{b.name}</span>
                      {b.telegramBotInfo.username && <span className="truncate text-label text-text-2">@{b.telegramBotInfo.username}</span>}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              <Command.Group heading="Go to" className={group}>
                <Command.Item className={item} onSelect={() => run(() => router.push("/dashboard"))}>
                  <SquaresFour /> Overview
                </Command.Item>
                <Command.Item className={item} onSelect={() => run(() => router.push("/bots/new"))} keywords={["create", "add"]}>
                  <Plus /> New bot
                </Command.Item>
                <Command.Item className={item} onSelect={() => run(() => router.push("/settings"))} keywords={["profile", "password", "account"]}>
                  <Gear /> Account settings
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Theme" className={group}>
                <Command.Item className={item} onSelect={() => run(() => setTheme("system"))} keywords={["appearance", "auto"]}>
                  <Desktop /> Use system theme
                </Command.Item>
                <Command.Item className={item} onSelect={() => run(() => setTheme("light"))} keywords={["appearance"]}>
                  <Sun /> Light theme
                </Command.Item>
                <Command.Item className={item} onSelect={() => run(() => setTheme("dark"))} keywords={["appearance"]}>
                  <Moon /> Dark theme
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Account" className={group}>
                <Command.Item className={item} onSelect={() => run(() => router.push("/settings"))} keywords={["name"]}>
                  <UserCircle /> Profile
                </Command.Item>
                <Command.Item className={item} onSelect={() => run(() => signOut())} keywords={["logout", "sign out"]}>
                  <SignOut /> Log out
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      )}
    </dialog>
  );
}
