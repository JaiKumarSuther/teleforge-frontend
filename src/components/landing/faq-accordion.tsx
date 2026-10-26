"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "Do I need to write any code?",
    a: "No. You only need a Telegram account to create the bot with @BotFather, and a few sentences describing how it should behave in plain English.",
  },
  {
    q: "What does it cost?",
    a: "TeleForge runs on Google Gemini's free tier, which covers personal and small community bots. Each account can run up to 10 bots with zero hosting fees.",
  },
  {
    q: "Who can see my bot token?",
    a: "No one, including you. It's verified with Telegram once, encrypted with AES-256-GCM, and never returned by the API. To change it, create the bot again.",
  },
  {
    q: "Can I change the persona later?",
    a: "Yes, at any time. A running bot automatically uses the new persona from its very next message, with no restart or downtime required.",
  },
  {
    q: "Does the bot remember the conversation history?",
    a: "Yes. It keeps the last 10 exchanges of each chat as context so conversations flow naturally. The activity log stores a full 30-day history.",
  },
  {
    q: "What if Gemini doesn't answer or is rate-limited?",
    a: "Blocked content receives a polite refusal. If Gemini is momentarily rate-limited or times out, the bot sends a short apology rather than staying silent.",
  },
  {
    q: "What happens if the server restarts?",
    a: "All bots that were running resume automatically and immediately pick up any messages that arrived while the server was restarting.",
  },
  {
    q: "Is TeleForge affiliated with Telegram or Google?",
    a: "No. TeleForge is an independent platform built on Telegram's public Bot API and Google's official Gemini API.",
  },
];

export function FaqAccordion() {
  // Open the first question by default
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  function toggle(idx: number) {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }

  return (
    <div className="space-y-3">
      {FAQS.map((faq, idx) => {
        const isOpen = openIndices.includes(idx);
        return (
          <div
            key={faq.q}
            className={cn(
              "overflow-hidden rounded-xl border transition-all duration-200",
              isOpen
                ? "border-line-2 bg-surface shadow-xs"
                : "border-line bg-surface/50 hover:border-line-2 hover:bg-surface"
            )}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-text transition cursor-pointer"
            >
              <span className="text-base font-semibold">{faq.q}</span>
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full bg-bg-2 text-text-2 transition-transform duration-200",
                  isOpen && "rotate-180 bg-accent-tint text-accent"
                )}
              >
                <CaretDown size={14} weight="bold" />
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-line/60 px-5 pt-3 pb-5 text-sm leading-relaxed text-text-2">
                <p>{faq.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
