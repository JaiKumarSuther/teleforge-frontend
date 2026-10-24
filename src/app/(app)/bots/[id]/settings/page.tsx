"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useBotContext, useBotTitle } from "@/components/app/bot-context";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/field";
import { SettingsCard } from "@/components/ui/settings-card";
import { api, ApiError } from "@/lib/api";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-sm text-text-2">{label}</dt>
      <dd className="min-w-0 text-sm text-text">{children}</dd>
    </div>
  );
}

export default function BotSettingsPage() {
  const { bot, refreshAll, mutateBot } = useBotContext();
  useBotTitle("Settings");
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [name, setName] = useState(bot.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function rename(e: React.FormEvent) {
    e.preventDefault();
    const next = name.trim();
    setNameError(null);
    if (!next) return setNameError("Enter a name for the bot.");
    if (next.length > 60) return setNameError("Use 60 characters or fewer.");
    if (next === bot.name) return;
    setSaving(true);
    try {
      const updated = await api.bots.update(bot._id, { name: next });
      await mutateBot(updated, { revalidate: false });
      await refreshAll();
      toast.success("Name saved");
    } catch (err) {
      setNameError(err instanceof ApiError ? err.display : "Couldn't save the name. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await api.bots.remove(bot._id);
      await Promise.all([mutate((k) => Array.isArray(k) && k[0] === "bots"), mutate("dashboard/stats")]);
      toast.success(`${bot.name} deleted`);
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.display : "Couldn't delete the bot. Check your connection and try again.");
      setDeleting(false);
    }
  }

  const username = bot.telegramBotInfo.username;

  return (
    <div className="space-y-6">
      <SettingsCard
        as="form"
        onSubmit={rename}
        noValidate
        title="Name"
        description="Only used inside TeleForge. People on Telegram see the display name you set in BotFather."
        note="Up to 60 characters."
        action={
          <Button type="submit" size="sm" loading={saving}>
            Save name
          </Button>
        }
      >
        <Input label="Bot name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} error={nameError} autoComplete="off" />
      </SettingsCard>

      <SettingsCard
        title="Telegram"
        description="The account this bot answers as. TeleForge checked the token with Telegram when you created the bot."
        note="To use a different token, create a new bot and delete this one."
      >
        <dl className="divide-y divide-line border-y border-line">
          <Row label="Username">
            {username ? (
              <a className="text-accent-text underline-offset-2 hover:underline" href={`https://t.me/${username}`} target="_blank" rel="noreferrer">
                @{username}
              </a>
            ) : (
              "Not set"
            )}
          </Row>
          <Row label="Bot ID">
            <span className="font-mono text-label">{bot.telegramBotInfo.id ?? "Unknown"}</span>
          </Row>
          <Row label="Token">Stored encrypted with AES&#8209;256&#8209;GCM and never shown again.</Row>
          <Row label="Created">
            {new Date(bot.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </Row>
        </dl>
      </SettingsCard>

      <SettingsCard
        danger
        title="Delete bot"
        description="Stops the bot, then permanently deletes its persona, settings and 30 days of activity. Your bot stays in BotFather, so you can connect it again later."
        note="This can't be undone."
        action={
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete bot…
          </Button>
        }
      />

      <Dialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setConfirmText("");
        }}
        title={`Delete ${bot.name}?`}
        description="The bot stops right away. Its persona, settings and activity history are deleted for good."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={remove} loading={deleting} disabled={confirmText.trim() !== bot.name}>
              Delete bot
            </Button>
          </>
        }
      >
        <Input
          label={
            <>
              Type <span className="font-mono">{bot.name}</span> to confirm
            </>
          }
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          data-autofocus
        />
      </Dialog>
    </div>
  );
}
