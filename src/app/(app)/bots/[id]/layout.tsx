"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowSquareOut, Copy, DotsThree, Gear } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { BotContext } from "@/components/app/bot-context";
import { useToggleBot } from "@/components/app/bot-list";
import { Button, ButtonLink } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";
import { BotAvatar, Callout, Skeleton, StatStrip, StatusBadge } from "@/components/ui/misc";
import { ApiError } from "@/lib/api";
import { useBot, useBotStats } from "@/lib/hooks";
import type { BotStatus } from "@/lib/types";
import { formatDuration, formatNumber, timeAgo } from "@/lib/utils";

/** Ticks every second from the server-reported uptime; remounted (via key) when new stats arrive. */
function LiveUptime({ uptimeMs, running }: { uptimeMs: number; running: boolean }) {
  const [base] = useState(() => Date.now() - uptimeMs);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);
  return <>{running && uptimeMs > 0 ? formatDuration(now - base) : "Not running"}</>;
}

function HeaderSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading bot">
      <div className="flex items-center gap-4">
        <Skeleton className="size-11 rounded-[10px]" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3.5 w-36" />
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-lg" />
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}

export default function BotLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const { mutate: globalMutate } = useSWRConfig();
  const { data: bot, error, mutate: mutateBot } = useBot(id);
  const [optimistic, setOptimistic] = useState<BotStatus | null>(null);
  const status = optimistic ?? bot?.status ?? "draft";
  const live = status === "active";
  const { data: stats, mutate: mutateStats } = useBotStats(id, live);
  const toggleBot = useToggleBot();
  const [toggling, setToggling] = useState(false);

  async function toggle() {
    if (!bot) return;
    setToggling(true);
    setOptimistic(status === "active" ? "stopped" : "active");
    await toggleBot({ ...bot, status });
    await Promise.all([mutateBot(), mutateStats()]);
    setOptimistic(null);
    setToggling(false);
  }

  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="max-w-xl py-8">
        <h1 className="type-page text-text">{notFound ? "This bot doesn't exist" : "Couldn't load this bot"}</h1>
        <p className="mt-2 text-sm text-text-2">
          {notFound ? "It may have been deleted, possibly from another device." : `${(error as Error).message} Check your connection and try again.`}
        </p>
        <div className="mt-6 flex gap-2">
          {!notFound && <Button onClick={() => mutateBot()}>Try again</Button>}
          <ButtonLink href="/dashboard" variant="secondary">
            Back to overview
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (!bot) return <HeaderSkeleton />;

  const username = bot.telegramBotInfo.username;
  const verb = live ? "Stop bot" : status === "error" ? "Retry" : "Start bot";

  return (
    <BotContext.Provider
      value={{
        bot,
        stats,
        status,
        live,
        mutateBot,
        refreshAll: () =>
          Promise.all([mutateBot(), mutateStats(), globalMutate((k) => Array.isArray(k) && k[0] === "bots"), globalMutate("dashboard/stats")]),
      }}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <BotAvatar name={bot.name} seed={bot._id} size={44} />
            <div className="min-w-0">
              <h1 className="type-page truncate text-text">{bot.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-label">
                <StatusBadge status={status} />
                <span aria-hidden className="h-3 w-px bg-line-2" />
                {username ? (
                  <a href={`https://t.me/${username}`} target="_blank" rel="noreferrer" className="text-text-2 underline-offset-2 hover:text-text hover:underline">
                    @{username}
                  </a>
                ) : (
                  <span className="text-text-2">No username</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {username && (
              <ButtonLink href={`https://t.me/${username}`} variant="secondary" className="hidden lg:inline-flex">
                <ArrowSquareOut />
                Open in Telegram
              </ButtonLink>
            )}
            <Button onClick={toggle} loading={toggling} variant={live ? "secondary" : "primary"} className="flex-1 sm:flex-none">
              {verb}
            </Button>
            <Menu
              label={`More actions for ${bot.name}`}
              items={[
                ...(username
                  ? [
                      {
                        label: `Copy @${username}`,
                        icon: <Copy />,
                        onSelect: () => navigator.clipboard?.writeText(`@${username}`).then(() => toast.success("Username copied")),
                      },
                      { label: "Open in Telegram", icon: <ArrowSquareOut />, href: `https://t.me/${username}`, external: true },
                    ]
                  : []),
                { label: "Bot settings", icon: <Gear />, href: `/bots/${bot._id}/settings` },
              ]}
              trigger={(props) => (
                <Button {...props} variant="secondary" icon aria-label="More actions">
                  <DotsThree weight="bold" size={18} />
                </Button>
              )}
            />
          </div>
        </div>

        {status === "error" && (
          <Callout
            tone="danger"
            role="status"
            title="This bot stopped because of an error"
            action={
              <Link href={`/bots/${bot._id}/settings`} className="text-sm font-medium text-text underline underline-offset-2">
                Bot settings
              </Link>
            }
          >
            {bot.lastError || "Telegram returned an error."} If the token was revoked, delete this bot in Settings and create it again with a new token. Otherwise choose Retry.
          </Callout>
        )}
        {status === "draft" && (
          <Callout
            tone="info"
            role="status"
            title="This bot is a draft"
            action={
              <Button size="sm" onClick={toggle} loading={toggling}>
                Start bot
              </Button>
            }
          >
            It won&apos;t reply on Telegram until you start it. Try the persona first in the Persona tab.
          </Callout>
        )}

        <StatStrip
          items={[
            { label: "Messages today", value: stats ? formatNumber(stats.messagesToday) : "–", detail: stats ? `${formatNumber(stats.messages30d)} in 30 days` : " " },
            {
              label: "Replies today",
              value: stats ? formatNumber(stats.repliesToday) : "–",
              detail: stats ? (stats.errorsToday ? `${formatNumber(stats.errorsToday)} errors today` : "No errors today") : " ",
            },
            { label: "People, 24h", value: stats ? formatNumber(stats.activeUsers) : "–", detail: stats?.lastMessageAt ? `Last message ${timeAgo(stats.lastMessageAt)}` : "No messages yet" },
            {
              label: "Uptime",
              value: <LiveUptime key={stats?.uptimeMs ?? 0} uptimeMs={stats?.uptimeMs ?? 0} running={live} />,
              detail: live ? "Since it last started" : status === "draft" ? "Never started" : "Start the bot to run it",
            },
          ]}
        />

        <div>{children}</div>
      </div>
    </BotContext.Provider>
  );
}
