"use client";

import useSWR from "swr";
import { api } from "./api";
import type { BotStatus } from "./types";

/** Dashboard KPIs — refreshed every 15s while the tab is visible. */
export function useDashboardStats() {
  return useSWR("dashboard/stats", () => api.dashboard.stats(), { refreshInterval: 15_000 });
}

export function useBots(params: { status?: BotStatus | ""; q?: string } = {}) {
  const key = ["bots", params.status || "", params.q || ""];
  return useSWR(key, () => api.bots.list({ limit: 50, status: params.status, q: params.q }), {
    refreshInterval: 15_000,
    keepPreviousData: true,
  });
}

export function useBot(id: string | undefined) {
  return useSWR(id ? ["bot", id] : null, () => api.bots.get(id!), { refreshInterval: 15_000 });
}

export function useBotStats(id: string | undefined, live: boolean) {
  return useSWR(id ? ["bot-stats", id] : null, () => api.bots.stats(id!), {
    refreshInterval: live ? 10_000 : 0,
  });
}

export function useBotActivity(id: string | undefined, opts: { types?: string; limit?: number; live: boolean }) {
  return useSWR(
    id ? ["bot-activity", id, opts.types || "", opts.limit || 20] : null,
    () => api.bots.activity(id!, { limit: opts.limit || 20, types: opts.types }),
    { refreshInterval: opts.live ? 8_000 : 0, keepPreviousData: true },
  );
}

export function useHealth() {
  return useSWR("health", () => api.health(), { refreshInterval: 30_000 });
}
