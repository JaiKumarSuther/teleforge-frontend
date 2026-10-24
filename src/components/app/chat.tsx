import { cn } from "@/lib/utils";

/** One chat message. "in" = written by a Telegram user, "out" = the bot's reply. */
export function ChatBubble({
  side,
  children,
  name,
  time,
  compact,
  className,
}: {
  side: "in" | "out";
  children: React.ReactNode;
  name?: string | null;
  time?: string;
  /** Smaller type and padding, for illustrations */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex", side === "out" ? "justify-end" : "justify-start", className)}>
      <div
        className={cn(
          "max-w-[min(85%,34rem)] rounded-xl text-text shadow-[0_1px_0_oklch(0.25_0.02_250/0.08)]",
          compact ? "px-3 py-1.5 text-label" : "px-3.5 py-2 text-sm",
          side === "out" ? "rounded-br-xs bg-bubble-out" : "rounded-bl-xs bg-bubble-in",
        )}
      >
        {name && <div className="mb-0.5 text-label font-medium text-accent-text">{name}</div>}
        <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
          {children}
          {time && (
            <time className="float-right mt-1.5 ml-3 text-caption text-text-2" aria-label={`sent at ${time}`}>
              {time}
            </time>
          )}
        </p>
      </div>
    </div>
  );
}

export function DayDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-3 flex justify-center" role="separator" aria-label={typeof children === "string" ? children : undefined}>
      <span className="rounded-full bg-surface px-2.5 py-0.5 text-caption font-medium text-text-2 shadow-1">{children}</span>
    </div>
  );
}

/** "Typing…" placeholder bubble while a reply is generated. */
export function TypingBubble() {
  return (
    <div className="flex justify-end" role="status" aria-label="Generating a reply">
      <div className="flex items-center gap-1 rounded-xl rounded-br-xs bg-bubble-out px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <span key={i} className="typing-dot size-1.5 rounded-full bg-text-2" style={{ animationDelay: `${i * 160}ms` }} />
        ))}
      </div>
    </div>
  );
}
