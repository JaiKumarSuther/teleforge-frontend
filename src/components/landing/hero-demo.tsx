"use client";

import { useState } from "react";
import { Sparkle, Check, PaperPlaneTilt } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SampleChat {
  id: string;
  label: string;
  botName: string;
  personaPrompt: string;
  userMessage: string;
  botReply: string;
  userTime: string;
  botTime: string;
}

const CHATS: SampleChat[] = [
  {
    id: "support",
    label: "🛍️ Customer Care",
    botName: "Threadline Support",
    personaPrompt: "Friendly store assistant. Answers shipping, sizing, and order queries.",
    userMessage: "Do you ship to Karachi? And do you have the black hoodie in medium?",
    botReply:
      "Yes, we deliver across Karachi in 2 to 3 business days! We have 4 left in medium right now. Orders over Rs 3,000 ship free. Would you like me to reserve one? 📦✨",
    userTime: "11:19 PM",
    botTime: "11:19 PM",
  },
  {
    id: "fitness",
    label: "💪 Fitness Coach",
    botName: "Apex Coach",
    personaPrompt: "High-energy personal trainer. Provides form cues and nutrition tips.",
    userMessage: "What's the ideal post-workout meal within 45 minutes?",
    botReply:
      "Aim for a 3:1 carb-to-protein ratio! A scoop of whey with oatmeal and a banana is pure gold for glycogen replenishment and muscle protein synthesis. Keep crushing it! 🔥",
    userTime: "10:42 AM",
    botTime: "10:42 AM",
  },
  {
    id: "mentor",
    label: "💻 Code Mentor",
    botName: "ByteMentor",
    personaPrompt: "Encouraging coding instructor. Explains complex topics in plain English.",
    userMessage: "Why should I use TypeScript instead of plain JavaScript?",
    botReply:
      "Think of JavaScript like driving without seatbelts. TypeScript catches typos and missing object fields right in your editor before you ship to production. Saves hours of debugging! ⚡",
    userTime: "3:15 PM",
    botTime: "3:15 PM",
  },
];

export function HeroDemo() {
  const [selectedId, setSelectedId] = useState<string>("support");
  const active = CHATS.find((c) => c.id === selectedId) || CHATS[0];

  return (
    <div className="relative mx-auto mt-8 w-full max-w-2xl sm:mt-10">
      {/* Ambient glow behind preview */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-r from-brand/20 via-accent/20 to-brand/20 blur-xl opacity-60"
      />

      <div className="overflow-hidden rounded-2xl border border-line-2 bg-surface/95 shadow-2xl backdrop-blur-md text-left transition-all duration-200">
        {/* Telegram Window Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg-2 px-4 py-2.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-[#229ed9] text-white font-bold text-xs shadow-xs">
              <PaperPlaneTilt size={16} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-text">{active.botName}</span>
                <span className="inline-flex items-center rounded-xs bg-ok-tint px-1.5 py-0.5 text-[10px] font-medium text-ok-text ring-1 ring-ok-line ring-inset">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-caption text-text-3">
                <span className="size-1.5 rounded-full bg-ok" />
                <span>answers with Google Gemini 2.5 Flash</span>
              </div>
            </div>
          </div>

          {/* Interactive Persona Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CHATS.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => setSelectedId(chat.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer",
                  selectedId === chat.id
                    ? "bg-accent text-on-accent shadow-xs"
                    : "bg-surface border border-line text-text-2 hover:bg-bg-hover hover:text-text"
                )}
              >
                {chat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Persona prompt instruction bar */}
        <div className="flex items-center gap-2 border-b border-line/60 bg-bg px-4 py-1.5 text-xs text-text-2">
          <Sparkle size={13} className="text-accent shrink-0" weight="fill" />
          <span className="font-semibold text-text-3 font-mono">Persona:</span>
          <span className="truncate">{active.personaPrompt}</span>
        </div>

        {/* Telegram Chat Simulation */}
        <div className="bg-chat-bg p-4 sm:p-5 space-y-3.5 min-h-[190px] flex flex-col justify-end">
          <div className="flex justify-center">
            <span className="rounded-full bg-surface/80 px-2.5 py-0.5 text-[10px] font-medium text-text-3 shadow-xs">
              Today
            </span>
          </div>

          {/* Customer Question */}
          <div className="flex justify-end">
            <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-bubble-out px-3.5 py-2 text-sm text-text shadow-xs">
              <p className="leading-relaxed">{active.userMessage}</p>
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-text-3">
                <span>{active.userTime}</span>
                <Check size={11} weight="bold" />
                <Check size={11} weight="bold" className="-ml-2" />
              </div>
            </div>
          </div>

          {/* Bot Reply */}
          <div className="flex justify-start">
            <div className="max-w-[88%] sm:max-w-[80%] rounded-2xl rounded-tl-xs bg-bubble-in px-3.5 py-2 text-sm text-text shadow-xs ring-1 ring-line/40">
              <p className="leading-relaxed">{active.botReply}</p>
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-text-3">
                <span>{active.botTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telegram-style message input mock */}
        <div className="flex items-center gap-3 border-t border-line bg-surface px-4 py-2 text-sm text-text-3">
          <div className="flex-1 text-placeholder truncate text-xs sm:text-sm">
            Message {active.botName}…
          </div>
          <button
            type="button"
            className="flex size-6 sm:size-7 items-center justify-center rounded-full bg-accent text-on-accent transition-transform hover:scale-105 cursor-pointer"
            aria-label="Send test message"
          >
            <PaperPlaneTilt size={13} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}
