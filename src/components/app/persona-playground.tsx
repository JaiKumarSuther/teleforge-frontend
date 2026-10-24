"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowCounterClockwise } from "@phosphor-icons/react";
import { toast } from "sonner";
import { ChatBubble, TypingBubble } from "@/components/app/chat";
import { Panel } from "@/components/ui/misc";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type Turn = { role: "user" | "assistant"; content: string };

/** Chat with the persona currently in the editor, through /api/bots/preview. Nothing is posted to Telegram. */
export function PersonaPlayground({
  personaPrompt,
  botName,
  suggestion,
  className,
}: {
  personaPrompt: string;
  botName?: string;
  suggestion?: string;
  className?: string;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ready = personaPrompt.trim().length > 0 && personaPrompt.length <= 2000;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, pending]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || pending || !ready) return;
    const history = turns.slice(-10);
    setTurns((t) => [...t, { role: "user", content: message }]);
    setInput("");
    setPending(true);
    try {
      const { reply } = await api.bots.preview({ personaPrompt, message, history });
      setTurns((t) => [...t, { role: "assistant", content: reply }]);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.display : "The test reply failed. Check your connection and send it again.");
      setTurns((t) => t.slice(0, -1));
      setInput(message);
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  const name = botName?.trim() || "your bot";

  return (
    <Panel className={cn("flex flex-col overflow-hidden", className)}>
      <div className="flex min-h-14 items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-text">Test {name}</h2>
          <p className="text-label text-text-2">Uses the live model and safety settings. Nothing is sent to Telegram.</p>
        </div>
        {turns.length > 0 && (
          <button
            type="button"
            onClick={() => setTurns([])}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-label text-text-2 hover:bg-bg-hover hover:text-text"
          >
            <ArrowCounterClockwise size={14} />
            Restart
          </button>
        )}
      </div>

      <div ref={scrollRef} className="min-h-[18rem] flex-1 overflow-y-auto overscroll-contain bg-chat-bg px-3 py-4 sm:px-4" aria-live="polite">
        {turns.length === 0 && !pending ? (
          <div className="flex h-full min-h-[16rem] flex-col items-start justify-end gap-3">
            <p className="max-w-[38ch] text-sm text-text-2">
              {ready ? "Write the way your users would. Each reply follows the persona exactly as the live bot will." : "Write a persona first. As soon as it has text, you can chat with it here."}
            </p>
            {ready && suggestion && (
              <button
                type="button"
                onClick={() => send(suggestion)}
                className="rounded-lg bg-surface px-3 py-2 text-left text-sm text-text shadow-1 transition-[box-shadow,background-color] duration-150 hover:bg-bg-2 hover:shadow-2"
              >
                <span className="text-text-2">Try </span>“{suggestion}”
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {turns.map((t, i) => (
              <ChatBubble key={i} side={t.role === "user" ? "in" : "out"}>
                {t.content}
              </ChatBubble>
            ))}
            {pending && <TypingBubble />}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-line p-2"
      >
        <label htmlFor="playground-input" className="sr-only">
          Test message
        </label>
        <input
          ref={inputRef}
          id="playground-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={ready ? "Write a test message…" : "Add a persona first"}
          disabled={!ready}
          maxLength={1000}
          autoComplete="off"
          className="h-10 min-w-0 flex-1 rounded-md bg-transparent px-2.5 text-md text-text placeholder:text-placeholder focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-focus disabled:cursor-not-allowed sm:text-sm"
        />
        <button
          type="submit"
          disabled={!ready || pending || !input.trim()}
          aria-label="Send test message"
          className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-on-accent transition-[background-color,scale] duration-150 enabled:hover:bg-accent-hover enabled:active:scale-[0.97] disabled:bg-bg-3 disabled:text-text-3"
        >
          <ArrowUp weight="bold" />
        </button>
      </form>
    </Panel>
  );
}
