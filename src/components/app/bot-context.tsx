"use client";

import { createContext, useContext, useEffect } from "react";
import type { KeyedMutator } from "swr";
import type { Bot, BotStats, BotStatus } from "@/lib/types";

export interface BotContextValue {
  bot: Bot;
  stats?: BotStats;
  status: BotStatus;
  live: boolean;
  mutateBot: KeyedMutator<Bot>;
  refreshAll: () => Promise<unknown>;
}

export const BotContext = createContext<BotContextValue | null>(null);

export function useBotContext() {
  const ctx = useContext(BotContext);
  if (!ctx) throw new Error("useBotContext must be used inside the bot layout");
  return ctx;
}

/** Keeps <title> accurate on client-rendered bot pages. */
export function useBotTitle(section: string) {
  const { bot } = useBotContext();
  useEffect(() => {
    document.title = `${bot.name}: ${section} | TeleForge`;
  }, [bot.name, section]);
}
