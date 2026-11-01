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
import { BotAvatar, Callout, Skeleton, StatusBadge } from "@/components/ui/misc";
import { ApiError } from "@/lib/api";
import { useBot, useBotStats } from "@/lib/hooks";
import type { BotStatus } from "@/lib/types";
import { cn, formatDuration, formatNumber } from "@/lib/utils";

/** Ticks every second from the server-reported uptime; remounted (via key) when new stats arrive. */
function LiveUptime({ uptimeMs, running }: { uptimeMs: number; running: boolean }) {
  const [base] = useState(() => Date.now() - uptimeMs);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);
  if (!running) return null;
  return <>{uptimeMs > 0 ? `Running for ${formatDuration(now - base)}` : "Just started"}</>;
}

/** Compact figures under the name. A value with `href` links to where its detail lives. */
function InlineStats({ items }: { items: { label: string; value: string; href?: string; danger?: boolean }[] }) {
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map((s) => {
        const body = (
          <>
            <dd className={cn("text-md font-medium tabular-nums", s.danger ? "text-danger-text" : "text-text")}>{s.value}</dd>
            <dt className={cn("text-label", s.href ? "text-text-2 underline decoration-line-2 underline-offset-2 group-hover:text-text" : "text-text-2")}>{s.label}</dt>
          </>
        );
        return s.href ? (
          <Link key={s.label} href={s.href} className="group flex items-baseline gap-1.5 rounded-xs">
            {body}
          </Link>
        ) : (
          <div key={s.label} className="flex items-baseline gap-1.5">
            {body}
          </div>
        );
      })}
    </dl>
  );
}

function HeaderSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading bot">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-[10px]" />
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <BotAvatar name={bot.name} seed={bot._id} size={56} />
            <div className="min-w-0">
              <h1 className="type-page truncate text-text">{bot.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-label">
                <StatusBadge status={status} />
                {live && (
                  <>
                    <span aria-hidden className="h-3 w-px bg-line-2" />
                    <span className="text-text-2">
                      <LiveUptime key={stats?.uptimeMs ?? 0} uptimeMs={stats?.uptimeMs ?? 0} running={live} />
                    </span>
                  </>
                )}
                <span aria-hidden className="h-3 w-px bg-line-2" />
                {username ? (
                  <span className="inline-flex items-center gap-0.5">
                    <a href={`https://t.me/${username}`} target="_blank" rel="noreferrer" className="text-text-2 underline-offset-2 hover:text-text hover:underline">
                      @{username}
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard
                          ?.writeText(`@${username}`)
                          .then(() => toast.success("Username copied"))
                          .catch(() => toast.error("Couldn't copy. Select the username and copy it."))
                      }
                      aria-label={`Copy @${username}`}
                      className="flex size-6 items-center justify-center rounded-sm text-text-2 hover:bg-bg-hover hover:text-text"
                    >
                      <Copy size={14} />
                    </button>
                  </span>
                ) : (
                  <span className="text-text-2">No username</span>
                )}
              </div>
              <div className="mt-3">
                <InlineStats
                  items={[
                    { label: "messages today", value: stats ? formatNumber(stats.messagesToday) : "–" },
                    { label: "replies today", value: stats ? formatNumber(stats.repliesToday) : "–" },
                    { label: "people, 24h", value: stats ? formatNumber(stats.activeUsers) : "–" },
                    {
                      label: "failed replies",
                      value: stats ? formatNumber(stats.errorsToday) : "–",
                      href: `/bots/${bot._id}/activity?type=errors`,
                      danger: Boolean(stats?.errorsToday),
                    },
                  ]}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:shrink-0">
            {username && (
              <ButtonLink href={`https://t.me/${username}`} variant="secondary" className="hidden sm:inline-flex">
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

        <div>{children}</div>
      </div>
    </BotContext.Provider>
  );
}
