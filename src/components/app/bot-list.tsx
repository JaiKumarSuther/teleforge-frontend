"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import { BotAvatar, Skeleton, StatusBadge } from "@/components/ui/misc";
import { api, ApiError } from "@/lib/api";
import type { Bot } from "@/lib/types";
import { formatNumber, timeAgo } from "@/lib/utils";

/** Start or stop a bot, then refresh every list and stat that depends on it. */
export function useToggleBot() {
  const { mutate } = useSWRConfig();
  return async (bot: Pick<Bot, "_id" | "name" | "status">) => {
    const running = bot.status === "active";
    try {
      if (running) {
        await api.bots.stop(bot._id);
        toast.success(`${bot.name} stopped`);
      } else {
        await api.bots.start(bot._id);
        toast.success(`${bot.name} is running`);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.display : "Couldn't change the bot's status. Check your connection and try again.");
    } finally {
      await Promise.all([
        mutate((k) => Array.isArray(k) && (k[0] === "bots" || (["bot", "bot-stats", "bot-activity"].includes(k[0]) && k[1] === bot._id))),
        mutate("dashboard/stats"),
      ]);
    }
  };
}

function ToggleButton({ bot }: { bot: Bot }) {
  const toggle = useToggleBot();
  const [busy, setBusy] = useState(false);
  const verb = bot.status === "active" ? "Stop" : bot.status === "error" ? "Retry" : "Start";
  return (
    <Button
      size="sm"
      variant="secondary"
      loading={busy}
      className="relative z-10 min-w-[4.5rem]"
      aria-label={`${verb} ${bot.name}`}
      onClick={async () => {
        setBusy(true);
        await toggle(bot);
        setBusy(false);
      }}
    >
      {verb}
    </Button>
  );
}

function LastMessage({ bot }: { bot: Bot }) {
  const s = bot.stats;
  if (bot.status === "error" && bot.lastError) return <span className="line-clamp-1 text-danger-text" title={bot.lastError}>{bot.lastError}</span>;
  if (!s?.lastMessage) return <span className="text-text-2">No messages yet</span>;
  return (
    <span className="flex min-w-0 items-baseline gap-2" title={`${s.lastMessage.from || "Someone"}: ${s.lastMessage.text}`}>
      <span className="min-w-0 truncate text-text">
        <span className="text-text-2">{s.lastMessage.from || "Someone"}:</span> {s.lastMessage.text}
      </span>
      <span className="shrink-0 text-label text-text-2">{timeAgo(s.lastMessage.at)}</span>
    </span>
  );
}

/** The bot's name is a real link stretched over the whole row; the action button sits above it. */
function NameLink({ bot }: { bot: Bot }) {
  return (
    <Link href={`/bots/${bot._id}`} className="font-medium text-text after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus">
      {bot.name}
    </Link>
  );
}

export function BotList({ bots }: { bots: Bot[] }) {
  return (
    <div className="overflow-hidden rounded-lg bg-surface shadow-1">
      {/* Desktop: a real table */}
      <table className="hidden w-full table-fixed border-collapse text-left text-sm md:table">
        <thead>
          <tr className="border-b border-line bg-bg-2 text-label text-text-2">
            <th scope="col" className="w-[30%] py-2.5 pr-3 pl-5 font-normal">Bot</th>
            <th scope="col" className="w-[13%] px-3 py-2.5 font-normal">Status</th>
            <th scope="col" className="w-[9%] px-3 py-2.5 text-right font-normal">Today</th>
            <th scope="col" className="w-[10%] px-3 py-2.5 text-right font-normal">30 days</th>
            <th scope="col" className="px-3 py-2.5 font-normal">Last message</th>
            <th scope="col" className="w-28 py-2.5 pr-5 pl-3 font-normal">
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {bots.map((b) => (
            <tr key={b._id} className="relative border-b border-line transition-colors duration-150 last:border-b-0 hover:bg-bg-2">
              <td className="py-3.5 pr-3 pl-5">
                <div className="flex min-w-0 items-center gap-3">
                  <BotAvatar name={b.name} seed={b._id} size={32} />
                  <div className="min-w-0">
                    <div className="truncate">
                      <NameLink bot={b} />
                    </div>
                    <div className="truncate text-label text-text-2">{b.telegramBotInfo?.username ? `@${b.telegramBotInfo.username}` : "No username"}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3.5">
                <StatusBadge status={b.status} />
              </td>
              <td className="px-3 py-3.5 text-right text-text">{formatNumber(b.stats?.messagesToday ?? 0)}</td>
              <td className="px-3 py-3.5 text-right text-text-2">{formatNumber(b.stats?.messages30d ?? 0)}</td>
              <td className="px-3 py-3.5">
                <LastMessage bot={b} />
              </td>
              <td className="py-3.5 pr-5 pl-3 text-right">
                <ToggleButton bot={b} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phones and small tablets: one block per bot */}
      <ul className="divide-y divide-line md:hidden">
        {bots.map((b) => (
          <li key={b._id} className="relative px-4 py-4 transition-colors duration-150 hover:bg-bg-2">
            <div className="flex items-start gap-3">
              <BotAvatar name={b.name} seed={b._id} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate">
                      <NameLink bot={b} />
                    </div>
                    <div className="truncate text-label text-text-2">{b.telegramBotInfo?.username ? `@${b.telegramBotInfo.username}` : "No username"}</div>
                  </div>
                  <StatusBadge status={b.status} className="mt-0.5" />
                </div>
                <div className="mt-2 text-sm">
                  <LastMessage bot={b} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-label text-text-2">
                    {formatNumber(b.stats?.messagesToday ?? 0)} today, {formatNumber(b.stats?.messages30d ?? 0)} in 30 days
                  </span>
                  <ToggleButton bot={b} />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BotListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg bg-surface shadow-1" aria-busy="true" aria-label="Loading bots">
      <div className="hidden h-10 border-b border-line bg-bg-2 md:block" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-line px-4 py-4 last:border-b-0 md:px-5">
          <Skeleton className="size-8 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="hidden h-3.5 w-56 md:block" />
          <Skeleton className="h-8 w-[4.5rem] rounded-md" />
        </div>
      ))}
    </div>
  );
}
