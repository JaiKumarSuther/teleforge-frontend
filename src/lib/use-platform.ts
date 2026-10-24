"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True on macOS/iOS, false elsewhere, null during SSR (so markup matches on hydration). */
export function useIsMac(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent),
    () => null,
  );
}

export const OPEN_COMMAND_EVENT = "tf:open-command";
export const openCommandMenu = () => window.dispatchEvent(new Event(OPEN_COMMAND_EVENT));
