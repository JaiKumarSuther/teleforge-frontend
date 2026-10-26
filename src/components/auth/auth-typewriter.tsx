"use client";

import { useEffect, useRef, useState } from "react";
import { Lockup } from "@/components/brand/logo";
import { Sparkle, Lightning, Clock, ChatCenteredDots } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface PersonaDemo {
  id: string;
  name: string;
  role: string;
  badge: string;
  prompt: string;
  userMessage: string;
  botReply: string;
}

const PERSONAS: PersonaDemo[] = [
  {
    id: "support",
    name: "Threadline Support",
    role: "E-Commerce",
    badge: "🛍️ Customer Care",
    prompt:
      "You are Threadline Support. Be polite, friendly, and give clear answers on shipping, sizes, and returns.",
    userMessage: "Do you ship to Karachi?",
    botReply:
      "Yes! We deliver across Karachi in 2 to 3 business days, and shipping is free on orders over Rs 3,000. Ready to help! 📦",
  },
  {
    id: "coach",
    name: "Apex Coach",
    role: "Fitness",
    badge: "💪 Fitness Coach",
    prompt:
      "You are Apex Coach. Give high-energy, encouraging fitness tips and quick form corrections for beginners.",
    userMessage: "My lower back feels tight on deadlifts, what should I check?",
    botReply:
      "Engage your lats before pulling! Keep the bar against your shins, hinge through hips not spine, and lockout strong! 🔥",
  },
  {
    id: "mentor",
    name: "ByteMentor",
    role: "Education",
    badge: "💻 Coding Tutor",
    prompt:
      "You are ByteMentor. Break down tricky programming concepts into intuitive everyday metaphors.",
    userMessage: "What's the difference between SQL and NoSQL?",
    botReply:
      "Think of SQL like a tidy Excel sheet with strict tables. NoSQL is like a flexible binder of JSON notes. Fast & flexible! ⚡",
  },
  {
    id: "host",
    name: "Velvet Host",
    role: "Hospitality",
    badge: "🍽️ Dining Host",
    prompt:
      "You are the head host at Bistro Velvet. Greet guests warmly with European charm and suggest wine pairings.",
    userMessage: "Do you have tables for two tonight around 8 PM?",
    botReply:
      "Bonsoir! We have a romantic table by the terrace at 8:15 PM. Shall I reserve it and chill a bottle of Pinot Noir? 🍷",
  },
];

export function AuthTypewriter() {
  const [personaIndex, setPersonaIndex] = useState(0);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [typedReply, setTypedReply] = useState("");
  const [isTypingReply, setIsTypingReply] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);

  const active = PERSONAS[personaIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTypedPrompt("");
    setTypedReply("");
    setIsTypingReply(false);
    setIsBotThinking(false);

    let promptChar = 0;
    let replyChar = 0;
    let cancelled = false;

    // Phase 1: Type prompt
    function typePrompt() {
      if (cancelled) return;
      if (promptChar < active.prompt.length) {
        promptChar += 1;
        setTypedPrompt(active.prompt.slice(0, promptChar));
        timerRef.current = setTimeout(typePrompt, 18 + Math.random() * 10);
      } else {
        // Prompt finished, brief pause for Gemini response
        setIsBotThinking(true);
        timerRef.current = setTimeout(() => {
          if (cancelled) return;
          setIsBotThinking(false);
          setIsTypingReply(true);
          typeReply();
        }, 400);
      }
    }

    // Phase 2: Type reply
    function typeReply() {
      if (cancelled) return;
      if (replyChar < active.botReply.length) {
        replyChar += 1;
        setTypedReply(active.botReply.slice(0, replyChar));
        timerRef.current = setTimeout(typeReply, 16 + Math.random() * 8);
      } else {
        // Reply finished, hold before cycling
        timerRef.current = setTimeout(() => {
          if (cancelled) return;
          setPersonaIndex((prev) => (prev + 1) % PERSONAS.length);
        }, 4000);
      }
    }

    timerRef.current = setTimeout(typePrompt, 250);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [personaIndex, active]);

  return (
    <div className="relative flex h-full min-h-dvh flex-col justify-between overflow-hidden p-6 lg:p-8 xl:p-12">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 size-80 rounded-full bg-accent/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 size-80 rounded-full bg-brand/10 blur-3xl"
      />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        <Lockup size={28} />
        <div className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-surface/80 px-3 py-1 text-caption font-medium text-text-2 shadow-xs backdrop-blur-sm">
          <span className="size-2 rounded-full bg-ok animate-pulse" />
          <span>Gemini 2.5 Engine</span>
        </div>
      </div>

      {/* Center Showcase */}
      <div className="relative z-10 my-auto py-4">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-accent">
            <Sparkle size={14} weight="fill" />
            <span>Interactive Persona Engine</span>
          </div>
          <h2 className="mt-1.5 type-section text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Give your Telegram bot <span className="text-brand">a voice.</span>
          </h2>
          <p className="mt-1.5 text-sm text-text-2 leading-relaxed">
            Write how your bot should talk in plain English. TeleForge connects it to Google Gemini and streams every chat live.
          </p>
        </div>

        {/* Persona quick switch buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {PERSONAS.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                setPersonaIndex(idx);
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 cursor-pointer",
                personaIndex === idx
                  ? "bg-accent text-on-accent shadow-xs ring-2 ring-accent/30"
                  : "bg-surface border border-line-2 text-text-2 hover:bg-bg-hover hover:text-text"
              )}
            >
              {p.badge}
            </button>
          ))}
        </div>

        {/* The Typewriter Card */}
        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface/90 shadow-frame backdrop-blur-md">
          {/* Card window bar */}
          <div className="flex items-center justify-between border-b border-line bg-bg-2 px-3.5 py-2">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-danger/80" />
              <span className="size-2.5 rounded-full bg-warn/80" />
              <span className="size-2.5 rounded-full bg-ok/80" />
              <span className="ml-2 font-mono text-[11px] text-text-3">persona-prompt.txt</span>
            </div>
            <span className="text-[10px] font-medium text-text-3 uppercase tracking-wider">
              {active.role}
            </span>
          </div>

          {/* Prompt typing area */}
          <div className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-accent">
                1. Bot Persona Prompt
              </span>
              <span className="text-[10px] text-text-3 font-mono">
                {typedPrompt.length} / {active.prompt.length} chars
              </span>
            </div>
            <div className="mt-1.5 min-h-[3rem] rounded-lg border border-line-2 bg-bg p-2.5 font-mono text-xs leading-relaxed text-text">
              <span>{typedPrompt}</span>
              {typedPrompt.length < active.prompt.length && (
                <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-accent animate-pulse align-middle" />
              )}
            </div>

            {/* Telegram Live Response Simulation */}
            <div className="mt-3 pt-3 border-t border-line">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-5 items-center justify-center rounded-full bg-[#229ed9] text-white text-[9px] font-bold">
                    TG
                  </div>
                  <div className="text-xs font-semibold text-text flex items-center gap-1">
                    <span>{active.name}</span>
                    <span className="text-[10px] font-normal text-text-3">bot</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-text-3">
                  {isBotThinking ? (
                    <span className="flex items-center gap-1 text-accent animate-pulse">
                      <Sparkle size={11} weight="fill" />
                      Gemini writing reply…
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-ok">
                      <span className="size-1.5 rounded-full bg-ok" />
                      online
                    </span>
                  )}
                </div>
              </div>

              {/* Chat bubbles */}
              <div className="space-y-2 rounded-lg bg-chat-bg p-2.5 text-xs">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-xl rounded-tr-xs bg-bubble-out px-3 py-1.5 text-text shadow-xs">
                    <p>{active.userMessage}</p>
                    <span className="mt-0.5 block text-right text-[9px] text-text-3">11:19 PM ✓✓</span>
                  </div>
                </div>

                {/* Bot reply with typewriter */}
                <div className="flex justify-start">
                  <div className="max-w-[88%] rounded-xl rounded-tl-xs bg-bubble-in px-3 py-1.5 text-text shadow-xs ring-1 ring-line/40">
                    {isBotThinking ? (
                      <div className="flex items-center gap-1 py-1 text-text-3">
                        <span className="size-1.5 rounded-full bg-text-3 animate-bounce" />
                        <span className="size-1.5 rounded-full bg-text-3 animate-bounce [animation-delay:0.2s]" />
                        <span className="size-1.5 rounded-full bg-text-3 animate-bounce [animation-delay:0.4s]" />
                      </div>
                    ) : (
                      <>
                        <p className="leading-relaxed">
                          {typedReply}
                          {isTypingReply && typedReply.length < active.botReply.length && (
                            <span className="inline-block w-1.5 h-3 ml-0.5 bg-brand animate-pulse align-middle" />
                          )}
                        </p>
                        <span className="mt-0.5 block text-right text-[9px] text-text-3">11:19 PM</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Features & Footnote */}
      <div className="relative z-10 pt-3 border-t border-line/70">
        <div className="grid grid-cols-3 gap-2 text-xs text-text-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Lightning size={15} className="text-accent shrink-0" weight="bold" />
            <span className="truncate">Free Gemini tier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={15} className="text-accent shrink-0" weight="bold" />
            <span className="truncate">60s setup</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ChatCenteredDots size={15} className="text-accent shrink-0" weight="bold" />
            <span className="truncate">Live dashboard</span>
          </div>
        </div>
        <p className="text-caption text-text-3">
          TeleForge isn&apos;t affiliated with Telegram or Google.
        </p>
      </div>
    </div>
  );
}
