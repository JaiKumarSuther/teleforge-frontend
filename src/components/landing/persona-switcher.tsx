"use client";

import { useId, useRef, useState } from "react";
import { ChatBubble } from "@/components/app/chat";
import { PERSONA_TEMPLATES } from "@/lib/persona-templates";
import { cn } from "@/lib/utils";

const QUESTION = "Hi! What can you help me with?";

// Example replies written for this page, one per template persona. Real replies come from Gemini and vary.
const REPLIES: Record<string, string> = {
  support: "Hi! I can track an order, answer questions about sizes and delivery, or start a return. What's your order number?",
  tutor: "Hey! I can walk you through any topic from your course, one step at a time. What are you studying right now?",
  dev: "I answer JavaScript and TypeScript questions with short code examples. Paste the error, or describe what you're building.",
  concierge: "Welcome! I can share tonight's menu, our hours (12pm to 11pm, every day) or book you a table. For how many people?",
};

/** WAI-ARIA tabs: arrow keys move between personas, one tab stop. */
export function PersonaSwitcher() {
  const [index, setIndex] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();
  const t = PERSONA_TEMPLATES[index];

  function go(i: number) {
    const n = (i + PERSONA_TEMPLATES.length) % PERSONA_TEMPLATES.length;
    setIndex(n);
    refs.current[n]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Persona" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
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
                "flex h-10 shrink-0 items-center rounded-full px-4 text-sm whitespace-nowrap transition-[background-color,color,box-shadow] duration-150",
                active ? "bg-text font-medium text-bg" : "bg-surface text-text-2 shadow-1 hover:text-text hover:shadow-2",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div
        id={`${base}-panel`}
        role="tabpanel"
        aria-labelledby={`${base}-tab-${index}`}
        className="mt-6 grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-xl bg-surface shadow-frame lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
      >
        <div className="flex flex-col border-b border-line p-6 sm:p-8 lg:border-r lg:border-b-0">
          <p className="text-label font-medium text-text-2">Persona</p>
          <blockquote className="mt-3 flex-1 text-md text-text">{t.prompt}</blockquote>
          <p className="mt-6 text-label text-text-2">{t.prompt.length.toLocaleString()} of 2,000 characters</p>
        </div>
        <div className="flex min-h-64 flex-col lg:min-h-80 justify-end gap-2 bg-chat-bg p-5 sm:p-8">
          <ChatBubble side="in" name="Maya">
            {QUESTION}
          </ChatBubble>
          <ChatBubble side="out">{REPLIES[t.id]}</ChatBubble>
        </div>
      </div>
      <p className="mt-4 text-label text-text-2">Example replies written for this page. Your bot&apos;s replies come from Gemini and will vary.</p>
    </div>
  );
}
