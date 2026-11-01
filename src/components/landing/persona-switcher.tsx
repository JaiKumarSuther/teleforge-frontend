"use client";

import { useId, useRef, useState } from "react";
import { Sparkle, Check, PaperPlaneTilt } from "@phosphor-icons/react";
import { PERSONA_TEMPLATES } from "@/lib/persona-templates";
import { cn } from "@/lib/utils";

const ICONS: Record<string, string> = {
  support: "🛍️",
  tutor: "📚",
  dev: "💻",
  concierge: "🍽️",
};

const BOT_NAMES: Record<string, { name: string; handle: string }> = {
  support: { name: "Threadline Support", handle: "@threadline_support_bot" },
  tutor: { name: "StudyBuddy AI", handle: "@studybuddy_ai_bot" },
  dev: { name: "DevHelper Bot", handle: "@devhelper_code_bot" },
  concierge: { name: "Bistro Concierge", handle: "@bistro_concierge_bot" },
};

const REPLIES: Record<string, string> = {
  support:
    "Hi! I can track an order, answer questions about sizes and delivery, or start a return. What's your order number?",
  tutor:
    "Hey! I can walk you through any topic from your course, one step at a time. What are you studying right now?",
  dev:
    "I answer JavaScript and TypeScript questions with short code examples. Paste the error, or describe what you're building.",
  concierge:
    "Welcome! I can share tonight's menu, our hours (12pm to 11pm, every day) or book you a table. For how many people?",
};

export function PersonaSwitcher() {
  const [index, setIndex] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();
  const t = PERSONA_TEMPLATES[index];
  const botInfo = BOT_NAMES[t.id] || { name: t.label, handle: `@${t.id}_bot` };

  function go(i: number) {
    const n = (i + PERSONA_TEMPLATES.length) % PERSONA_TEMPLATES.length;
    setIndex(n);
    refs.current[n]?.focus();
  }

  // Split prompt sentences for simulated line numbers
  const sentences = t.prompt
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  return (
    <div>
      {/* Persona Tab Switcher */}
      <div
        role="tablist"
        aria-label="Persona"
        className="no-scrollbar -mx-5 flex items-center gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0"
      >
        {PERSONA_TEMPLATES.map((p, i) => {
          const active = i === index;
          return (
            <button
              key={p.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`${base}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${base}-panel`}
              tabIndex={active ? 0 : -1}
              onClick={() => setIndex(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  go(i + 1);
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  go(i - 1);
                } else if (e.key === "Home") {
                  e.preventDefault();
                  go(0);
                } else if (e.key === "End") {
                  e.preventDefault();
                  go(PERSONA_TEMPLATES.length - 1);
                }
              }}
              className={cn(
                "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all duration-150 cursor-pointer",
                active
                  ? "bg-accent text-on-accent shadow-sm ring-2 ring-accent/30"
                  : "bg-surface text-text-2 border border-line hover:text-text hover:bg-bg-hover shadow-xs"
              )}
            >
              <span>{ICONS[p.id]}</span>
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio Frame */}
      <div
        id={`${base}-panel`}
        role="tabpanel"
        aria-labelledby={`${base}-tab-${index}`}
        className="mt-6 overflow-hidden rounded-2xl border border-line-2 bg-surface shadow-frame"
      >
        {/* Studio Window Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-bg-2 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-danger/80" />
            <span className="size-2.5 rounded-full bg-warn/80" />
            <span className="size-2.5 rounded-full bg-ok/80" />
            <span className="ml-2 font-mono text-xs text-text-3">system-prompt.txt</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-accent font-medium">
              <Sparkle size={13} weight="fill" />
              <span>Gemini 3.8 Flash</span>
            </span>
            <span className="text-text-3 font-mono">|</span>
            <span className="text-text-3 font-mono">{t.blurb}</span>
          </div>
        </div>

        {/* Studio Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Left: System Prompt Editor View */}
          <div className="flex flex-col border-b border-line p-5 sm:p-7 lg:border-r lg:border-b-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                1. System Instructions
              </span>
              <span className="text-xs text-text-3 font-mono">
                {t.prompt.length} / 2,000 chars
              </span>
            </div>

            {/* Simulated Code Editor with line numbers */}
            <div className="mt-3 flex-1 rounded-xl border border-line-2 bg-bg p-4 font-mono text-xs leading-relaxed text-text">
              <div className="space-y-1.5">
                {sentences.map((sentence, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className="w-5 shrink-0 select-none text-right text-text-3/60 font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-text">{sentence}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Character meter and live hot-reload indicator */}
            <div className="mt-4 flex items-center justify-between text-caption text-text-2">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-ok" />
                <span>Instant hot-reload on every new message</span>
              </div>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-bg-3">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${(t.prompt.length / 2000) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Live Telegram Chat Simulation */}
          <div className="flex flex-col bg-chat-bg">
            {/* Telegram Chat Header */}
            <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2.5 sm:px-6">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-full bg-[#229ed9] text-white text-xs font-bold shadow-xs">
                  <PaperPlaneTilt size={16} weight="fill" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-text">{botInfo.name}</span>
                    <span className="text-[10px] text-text-3 font-normal">bot</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-ok">
                    <span className="size-1.5 rounded-full bg-ok" />
                    <span>online • answers in &lt;1s</span>
                  </div>
                </div>
              </div>
              <span className="text-caption font-mono text-text-3">{botInfo.handle}</span>
            </div>

            {/* Messages Area */}
            <div className="flex flex-1 flex-col justify-end gap-3 p-4 sm:p-6 min-h-[220px]">
              <div className="flex justify-center">
                <span className="rounded-full bg-surface/80 px-2.5 py-0.5 text-[10px] font-medium text-text-3 shadow-xs">
                  Today
                </span>
              </div>

              {/* Customer message */}
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-bubble-out px-3.5 py-2 text-xs sm:text-sm text-text shadow-xs">
                  <p className="leading-relaxed">{t.sample}</p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-text-3">
                    <span>11:19 PM</span>
                    <Check size={11} weight="bold" />
                    <Check size={11} weight="bold" className="-ml-2" />
                  </div>
                </div>
              </div>

              {/* Bot response */}
              <div className="flex justify-start">
                <div className="max-w-[88%] rounded-2xl rounded-tl-xs bg-bubble-in px-3.5 py-2 text-xs sm:text-sm text-text shadow-xs ring-1 ring-line/40">
                  <p className="leading-relaxed">{REPLIES[t.id]}</p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-text-3">
                    <span>11:19 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Telegram Message Input Bar */}
            <div className="flex items-center gap-3 border-t border-line bg-surface px-4 py-2.5 text-xs text-text-3">
              <span className="flex-1 text-placeholder truncate">
                Message {botInfo.name}…
              </span>
              <button
                type="button"
                className="flex size-6 items-center justify-center rounded-full bg-accent text-on-accent transition-transform hover:scale-105 cursor-pointer"
                aria-label="Send test message"
              >
                <PaperPlaneTilt size={12} weight="fill" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-label text-text-2">
        Example replies written for this preview. Your actual bot replies are generated in real-time by Google Gemini.
      </p>
    </div>
  );
}
