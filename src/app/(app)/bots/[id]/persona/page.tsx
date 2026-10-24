"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useBotContext, useBotTitle } from "@/components/app/bot-context";
import { PersonaPlayground } from "@/components/app/persona-playground";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { api, ApiError } from "@/lib/api";

export default function BotPersonaPage() {
  const { bot, live, mutateBot } = useBotContext();
  useBotTitle("Persona");
  const [draft, setDraft] = useState(bot.personaPrompt);
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

  async function save(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form onSubmit={save} noValidate className="space-y-4">
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
        <div className="flex items-center justify-end gap-2">
          {dirty && (
            <Button variant="ghost" onClick={() => setDraft(bot.personaPrompt)}>
              Discard changes
            </Button>
          )}
          <Button type="submit" loading={saving} disabled={!dirty}>
            {saving ? "Saving…" : dirty ? "Save persona" : "Saved"}
          </Button>
        </div>
      </form>
      <PersonaPlayground personaPrompt={draft} botName={bot.name} suggestion="Hi, what can you help me with?" className="xl:sticky xl:top-36" />
    </div>
  );
}
