"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useBotContext, useBotTitle } from "@/components/app/bot-context";
import { PersonaPlayground } from "@/components/app/persona-playground";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { api, ApiError } from "@/lib/api";
import { PERSONA_TEMPLATES } from "@/lib/persona-templates";
import { cn } from "@/lib/utils";

const DEFAULT_SAMPLE = "Hi, what can you help me with?";

export default function BotPersonaPage() {
  const { bot, live, mutateBot } = useBotContext();
  useBotTitle("Persona");
  const [draft, setDraft] = useState(bot.personaPrompt);
  const [sample, setSample] = useState(DEFAULT_SAMPLE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = draft.trim() !== bot.personaPrompt.trim();

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  async function save(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!draft.trim()) return setError("Write at least one sentence about how the bot should behave.");
    if (draft.length > 2000) return setError("Shorten the persona to 2,000 characters or fewer.");
    setSaving(true);
    try {
      const updated = await api.bots.update(bot._id, { personaPrompt: draft.trim() });
      await mutateBot(updated, { revalidate: false });
      toast.success(live ? "Persona saved. The next message uses it." : "Persona saved");
    } catch (err) {
      setError(err instanceof ApiError ? err.display : "Couldn't save the persona. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  function applyTemplate(id: string) {
    const t = PERSONA_TEMPLATES.find((x) => x.id === id);
    if (!t || t.prompt === draft) return;
    if (dirty && !window.confirm("Replace your unsaved changes with this template?")) return;
    setDraft(t.prompt);
    setSample(t.sample);
    setError(null);
  }

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div>
            <p className="text-label font-medium text-text" id="templates-label">
              Start from a template
            </p>
            <ul className="mt-2 flex flex-wrap gap-2" aria-labelledby="templates-label">
              {PERSONA_TEMPLATES.map((t) => {
                const selected = draft === t.prompt;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => applyTemplate(t.id)}
                      aria-pressed={selected}
                      title={t.blurb}
                      className={cn(
                        "h-8 rounded-full border px-3 text-label transition-colors duration-150",
                        selected ? "border-accent-line bg-accent-tint font-medium text-accent-text" : "border-line-2 bg-surface text-text-2 hover:bg-bg-hover hover:text-text",
                      )}
                    >
                      {t.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <form onSubmit={save} noValidate>
            <Textarea
              label="Persona"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              max={2000}
              rows={14}
              className="min-h-80"
              error={error}
              hint={live ? "The running bot uses saved changes from its next message. No restart needed." : "Saved changes apply the next time the bot runs."}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") e.currentTarget.form?.requestSubmit();
              }}
            />
          </form>
        </div>
        <PersonaPlayground personaPrompt={draft} botName={bot.name} suggestion={sample} className="xl:sticky xl:top-36" />
      </div>

      {dirty && (
        <div
          role="region"
          aria-label="Unsaved changes"
          className="sticky bottom-0 z-30 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-line bg-bg px-4 py-3 shadow-pop sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          <p className="text-label text-text-2">
            <span aria-hidden className="mr-2 inline-block size-2 rounded-full bg-warn align-middle" />
            Unsaved changes
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setDraft(bot.personaPrompt)} disabled={saving}>
              Discard
            </Button>
            <Button onClick={() => save()} loading={saving}>
              {saving ? "Saving…" : "Save persona"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
