"use client";

import { ArrowSquareOut } from "@phosphor-icons/react";

export function TokenHelp({ id, open }: { id: string; open: boolean }) {
  return (
    <div id={id} hidden={!open} className="rounded-md bg-bg-2 px-4 py-3.5 ring-1 ring-line ring-inset">
      <ol className="list-decimal space-y-2 pl-5 text-sm text-text marker:text-text-2">
        <li>
          In Telegram, open a chat with <span className="font-medium">@BotFather</span>.
        </li>
        <li>
          Send <code className="rounded-xs bg-bg-3 px-1 py-px text-label">/newbot</code>, then choose a display name and a username ending in “bot”.
        </li>
        <li>
          BotFather replies with a token like <code className="rounded-xs bg-bg-3 px-1 py-px text-label">123456789:AAH4k…</code>. Copy all of it and paste it above.
        </li>
      </ol>
      <a
        href="https://t.me/BotFather"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-text underline-offset-2 hover:underline"
      >
        Open @BotFather
        <ArrowSquareOut size={14} />
      </a>
    </div>
  );
}
