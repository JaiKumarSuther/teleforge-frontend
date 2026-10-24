"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { BotList, BotListSkeleton } from "@/components/app/bot-list";
import { WeekBars } from "@/components/app/week-bars";
import { Button, ButtonLink } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Callout, EmptyState, PageHeader, Panel, Skeleton, StatStrip } from "@/components/ui/misc";
import { useBots, useDashboardStats } from "@/lib/hooks";
import type { BotStatus, DashboardStats } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

function deltaText(trend: number[]) {
  const today = trend[trend.length - 1] ?? 0;
  const yesterday = trend[trend.length - 2] ?? 0;
  if (today === yesterday) return yesterday === 0 ? "None yesterday either" : "Same as yesterday";
  if (yesterday === 0) return "None yesterday";
  const diff = today - yesterday;
  return `${formatNumber(Math.abs(diff))} ${diff > 0 ? "more" : "fewer"} than yesterday`;
}

function Stats({ stats }: { stats: DashboardStats }) {
  return (
    <StatStrip
      columns="grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]"
      items={[
        {
          label: "Messages today",
          value: formatNumber(stats.messagesToday),
          detail: deltaText(stats.messagesTrend),
          chart: <WeekBars values={stats.messagesTrend} />,
        },
        {
          label: "Replies sent today",
          value: formatNumber(stats.repliesToday),
          detail: stats.errorsToday > 0 ? `${formatNumber(stats.errorsToday)} errors today` : "No errors today",
        },
        { label: "People, 24h", value: formatNumber(stats.activeUsers24h), detail: "Unique Telegram users" },
        { label: "Messages, 30 days", value: formatNumber(stats.messages30d), detail: `Across ${stats.totalBots} ${stats.totalBots === 1 ? "bot" : "bots"}` },
      ]}
    />
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-line shadow-1 lg:grid-cols-4" aria-busy="true" aria-label="Loading stats">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-3 bg-surface px-5 py-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

function FirstRun() {
  const steps = [
    {
      title: "Create the bot in Telegram",
      body: (
        <>
          Open <a className="font-medium text-accent-text underline-offset-2 hover:underline" href="https://t.me/BotFather" target="_blank" rel="noreferrer">@BotFather</a>, send{" "}
          <code className="rounded-xs bg-bg-3 px-1 py-px text-label">/newbot</code> and copy the token it replies with.
        </>
      ),
    },
    { title: "Describe how it should talk", body: "A few sentences on tone, what it helps with and what it should never do. Start from a template if you like." },
    { title: "Start it and say hi", body: "Replies come from Gemini within a second or two, and both sides of every chat show up here." },
  ];
  return (
    <Panel className="grid grid-cols-[minmax(0,1fr)] overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="flex flex-col justify-between gap-8 p-6 sm:p-8">
        <div>
          <h2 className="type-page text-text">Create your first bot</h2>
          <p className="mt-2 max-w-[44ch] text-sm text-text-2">Have your BotFather token ready. Setup takes about a minute, and the bot stays a draft until you start it.</p>
        </div>
        <ButtonLink href="/bots/new" className="self-start">
          Create a bot
        </ButtonLink>
      </div>
      <ol className="divide-y divide-line border-t border-line bg-bg-2 lg:border-t-0 lg:border-l">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4 px-6 py-5 sm:px-8">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface text-label font-medium text-text shadow-1">{i + 1}</span>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-text">{s.title}</h3>
              <p className="mt-1 text-sm text-text-2">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export default function DashboardPage() {
  const [filter, setFilter] = useState<BotStatus | "">("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    document.title = "Overview | TeleForge";
  }, []);

  const { data: stats, error: statsError, mutate: retryStats } = useDashboardStats();
  const { data: botsPage, isLoading: botsLoading, error: botsError, mutate: retryBots } = useBots({ status: filter, q });
  const bots = botsPage?.data ?? [];
  const noBots = stats && stats.totalBots === 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description={
          stats
            ? stats.totalBots === 0
              ? "Your bots and their messages will show up here."
              : `${stats.activeBots} of ${stats.totalBots} ${stats.totalBots === 1 ? "bot is" : "bots are"} running.`
            : " "
        }
      />

      {statsError && !stats ? (
        <Callout tone="danger" role="alert" title="Couldn't load your overview" action={<Button size="sm" variant="secondary" onClick={() => retryStats()}>Try again</Button>}>
          {(statsError as Error).message}
        </Callout>
      ) : !stats ? (
        <StatsSkeleton />
      ) : noBots ? (
        <FirstRun />
      ) : (
        <>
          {stats.errorBots > 0 && filter !== "error" && (
            <Callout
              tone="danger"
              role="status"
              title={`${stats.errorBots} ${stats.errorBots === 1 ? "bot has" : "bots have"} stopped with an error`}
              action={
                <Button size="sm" variant="secondary" onClick={() => setFilter("error")}>
                  Show {stats.errorBots === 1 ? "it" : "them"}
                </Button>
              }
            >
              This usually means the token was revoked in BotFather. Open the bot to see the exact error.
            </Callout>
          )}

          <Stats stats={stats} />

          <section aria-labelledby="bots-heading" className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h2 id="bots-heading" className="type-title text-text">
                Bots
              </h2>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                  <Segmented<BotStatus | "">
                    label="Filter bots by status"
                    value={filter}
                    onChange={setFilter}
                    options={[
                      { value: "", label: "All", count: stats.totalBots },
                      { value: "active", label: "Running", count: stats.activeBots },
                      { value: "stopped", label: "Stopped", count: stats.stoppedBots },
                      { value: "draft", label: "Draft", count: stats.draftBots },
                      { value: "error", label: "Error", count: stats.errorBots },
                    ]}
                  />
                </div>
                <div className="relative sm:w-60">
                  <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-3" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search bots…"
                    aria-label="Search bots by name or username"
                    autoComplete="off"
                    spellCheck={false}
                    className={cn(fieldClass, "h-9 pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden")}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute top-1/2 right-1 flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-text-2 hover:bg-bg-hover hover:text-text"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {botsError ? (
              <Callout tone="danger" role="alert" title="Couldn't load your bots" action={<Button size="sm" variant="secondary" onClick={() => retryBots()}>Try again</Button>}>
                {(botsError as Error).message}
              </Callout>
            ) : botsLoading && !botsPage ? (
              <BotListSkeleton />
            ) : bots.length === 0 ? (
              <Panel>
                <EmptyState
                  title={q ? `No bots match “${q}”` : "No bots with this status"}
                  action={
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setFilter("");
                        setSearch("");
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                >
                  {q ? "Search looks at bot names and Telegram usernames." : "Try another status, or show all bots."}
                </EmptyState>
              </Panel>
            ) : (
              <BotList bots={bots} />
            )}
          </section>
        </>
      )}
    </div>
  );
}
