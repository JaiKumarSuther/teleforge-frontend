"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowSquareOut, CaretLeft } from "@phosphor-icons/react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Panel, Skeleton } from "@/components/ui/misc";
import { ChatBubble, DayDivider, dayKey, dayLabel } from "@/components/app/chat";
import { useBotActivity } from "@/lib/hooks";
import type { Activity, BotStatus } from "@/lib/types";
import { cn, formatClock, formatNumber, timeAgo } from "@/lib/utils";

interface Thread {
  chatId: number;
  name: string;
  last: Activity;
  items: Activity[];
}

function buildThreads(activities: Activity[]): Thread[] {
  const map = new Map<number, Thread>();
  // activities arrive newest first
  for (const a of activities) {
    const chatId = a.meta?.telegramChatId;
    if (chatId === undefined || chatId === null) continue;
    let t = map.get(chatId);
    if (!t) {
      t = { chatId, name: "", last: a, items: [] };
      map.set(chatId, t);
    }
    t.items.push(a);
    if (!t.name && a.type === "message_in" && a.meta?.fromName) t.name = a.meta.fromName;
  }
  return [...map.values()].map((t) => ({ ...t, name: t.name || `Chat ${t.chatId}`, items: [...t.items].reverse() }));
}

export function Conversations({ botId, live, status, username }: { botId: string; live: boolean; status: BotStatus; username: string | null }) {
  const { data, isLoading } = useBotActivity(botId, { types: "message_in,message_out", limit: 80, live });
  const threads = useMemo(() => buildThreads(data?.data ?? []), [data]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showThread, setShowThread] = useState(false);
  const active = threads.find((t) => t.chatId === selected) ?? threads[0];
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.chatId, active?.items.length, showThread]);

  if (isLoading && !data) {
    return (
      <Panel className="grid grid-cols-[minmax(0,1fr)] h-[480px] overflow-hidden md:grid-cols-[20rem_minmax(0,1fr)]" aria-busy="true" aria-label="Loading conversations">
        <div className="space-y-4 border-line p-4 md:border-r">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden bg-chat-bg md:block" />
      </Panel>
    );
  }

  if (threads.length === 0) {
    return (
      <Panel>
        <EmptyState
          title="No chats yet"
          action={
            username ? (
              <ButtonLink href={`https://t.me/${username}`} variant="secondary" className="max-w-full">
                <ArrowSquareOut className="shrink-0" />
                <span className="truncate">Open in Telegram</span>
              </ButtonLink>
            ) : undefined
          }
        >
          {live
            ? "The bot is listening. Send it a message on Telegram and the chat appears here within about ten seconds."
            : status === "error"
              ? "This bot stopped because of the error above, so it isn't receiving messages. Once it runs again, its chats appear here."
              : "Start the bot, then send it a message on Telegram. Chats from the last 30 days appear here."}
        </EmptyState>
      </Panel>
    );
  }

  return (
    <Panel ref={panelRef} className="grid grid-cols-[minmax(0,1fr)] h-[min(70dvh,600px)] min-h-[440px] overflow-hidden md:grid-cols-[20rem_minmax(0,1fr)]">
      {/* Chat list */}
      <div className={cn("flex min-h-0 flex-col border-line md:flex md:border-r", showThread && "hidden")}>
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
          <h2 className="text-sm font-medium text-text">Chats</h2>
          <span className="text-label text-text-2">{threads.length}</span>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5">
          {threads.map((t) => {
            const isActive = active?.chatId === t.chatId;
            return (
              <li key={t.chatId}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(t.chatId);
                    setShowThread(true);
                    // Phones show one pane at a time: bring the whole thread on screen
                    if (!window.matchMedia("(min-width: 768px)").matches) requestAnimationFrame(() => panelRef.current?.scrollIntoView({ block: "start" }));
                  }}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left transition-colors duration-150",
                    isActive ? "md:bg-bg-active" : "hover:bg-bg-hover",
                  )}
                >
                  <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-3 text-sm font-medium text-text-2">
                    {t.name.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-text">{t.name}</span>
                      <span className="shrink-0 text-caption text-text-2">{timeAgo(t.last.createdAt)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-label text-text-2">
                        {t.last.type === "message_out" && "Bot: "}
                        {t.last.meta?.text}
                      </span>
                      <span className="shrink-0 rounded-full bg-bg-3 px-1.5 text-caption text-text-2" aria-label={`${t.items.length} messages`}>
                        {formatNumber(t.items.length)}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Thread */}
      <div className={cn("min-h-0 flex-col md:flex", showThread ? "flex" : "hidden")}>
        {active && (
          <>
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-2 md:px-4">
              <button
                type="button"
                onClick={() => setShowThread(false)}
                aria-label="Back to chats"
                className="flex size-9 items-center justify-center rounded-md text-text-2 hover:bg-bg-hover hover:text-text md:hidden"
              >
                <CaretLeft size={18} />
              </button>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-medium text-text">{active.name}</h2>
              </div>
              <span className="ml-auto shrink-0 text-label text-text-2">
                {active.items.length} {active.items.length === 1 ? "message" : "messages"}
              </span>
            </div>
            <div
              ref={scrollRef}
              tabIndex={0}
              role="log"
              className="group/thread min-h-0 flex-1 overflow-y-auto overscroll-contain bg-chat-bg px-3 py-3 sm:px-5"
              aria-live="polite"
              aria-label={`Conversation with ${active.name}. Focus to show message times.`}
            >
              <div className="flex min-h-full flex-col justify-end gap-1.5">
                {active.items.map((m, i) => (
                  <div key={m._id}>
                    {(i === 0 || dayKey(active.items[i - 1].createdAt) !== dayKey(m.createdAt)) && <DayDivider>{dayLabel(m.createdAt)}</DayDivider>}
                    <ChatBubble side={m.type === "message_in" ? "in" : "out"} time={formatClock(m.createdAt)} revealTime>
                      {m.meta?.text}
                    </ChatBubble>
                  </div>
                ))}
              </div>
            </div>
            <p className="flex h-10 shrink-0 items-center gap-2 border-t border-line px-4 text-label text-text-2">
              {live ? (
                <>
                  <span aria-hidden className="size-2 shrink-0 rounded-full bg-ok" />
                  Bot is running, new messages appear automatically
                </>
              ) : (
                <>
                  <span aria-hidden className="size-2 shrink-0 rounded-full bg-text-3" />
                  Bot isn&apos;t running, so no new messages arrive
                </>
              )}
            </p>
          </>
        )}
      </div>
    </Panel>
  );
}
