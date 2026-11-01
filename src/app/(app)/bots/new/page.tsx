"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Check, Key, LockSimple } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/field";
import { BotAvatar, PageHeader } from "@/components/ui/misc";
import { PersonaPlayground } from "@/components/app/persona-playground";
import { TokenHelp } from "@/components/app/token-help";
import { api, ApiError } from "@/lib/api";
import { PERSONA_TEMPLATES } from "@/lib/persona-templates";
import type { Bot } from "@/lib/types";
import { cn, TOKEN_PATTERN } from "@/lib/utils";

type Errors = Partial<Record<"name" | "token" | "persona" | "form", string>>;

function mapServerError(err: ApiError): Errors {
  const msg = err.display;
  const lower = msg.toLowerCase();
  if (lower.includes("token")) return { token: msg };
  if (lower.includes("persona")) return { persona: msg };
  if (lower.includes("name")) return { name: msg };
  return { form: msg };
}

/** One numbered step. The badge turns into a check once the step is filled in; a rail links it to the next step. */
function Step({
  n,
  title,
  description,
  done,
  last,
  children,
}: {
  n: number;
  title: string;
  description: React.ReactNode;
  done: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`step-${n}`} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4">
      <div className="flex flex-col items-center">
        <span
          aria-hidden
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors duration-150",
            done ? "bg-ok-tint text-ok-text ring-1 ring-ok-line ring-inset" : "bg-text text-bg",
          )}
        >
          {done ? <Check weight="bold" size={16} /> : n}
        </span>
        {!last && <span aria-hidden className="mt-2 w-px flex-1 bg-line-2" />}
      </div>
      <div className={cn("min-w-0 space-y-5", !last && "pb-10")}>
        <div className="pt-1">
          <h2 id={`step-${n}`} className="type-title text-text">
            <span className="sr-only">Step {n}: </span>
            {title}
            {done && <span className="sr-only"> (done)</span>}
          </h2>
          <p className="mt-1 max-w-[60ch] text-sm text-text-2">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

export default function NewBotPage() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const helpId = useId();
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [persona, setPersona] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Bot | null>(null);
  const [starting, setStarting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    document.title = "New bot | TeleForge";
  }, []);

  const template = PERSONA_TEMPLATES.find((t) => t.id === templateId);
  const connectDone = name.trim().length > 0 && TOKEN_PATTERN.test(token.trim());
  const personaDone = persona.trim().length > 0 && persona.length <= 2000;
  const tokenLooksOff = token.trim().length > 8 && !TOKEN_PATTERN.test(token.trim());

  function applyTemplate(id: string) {
    const t = PERSONA_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    const previous = persona;
    const wasCustom = previous.trim() !== "" && !PERSONA_TEMPLATES.some((x) => x.prompt === previous);
    setTemplateId(id);
    setPersona(t.prompt);
    setErrors((e) => ({ ...e, persona: undefined }));
    if (wasCustom) {
      toast(`Replaced your persona with “${t.label}”`, {
        action: {
          label: "Undo",
          onClick: () => {
            setPersona(previous);
            setTemplateId(null);
          },
        },
      });
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter a name for the bot.";
    else if (name.trim().length > 60) next.name = "Use 60 characters or fewer.";
    if (!token.trim()) next.token = "Paste the token BotFather sent you.";
    else if (!TOKEN_PATTERN.test(token.trim())) next.token = "Paste the whole token. It looks like 123456789:AA followed by about 35 letters and numbers.";
    if (!persona.trim()) next.persona = "Write at least one sentence about how the bot should behave.";
    else if (persona.length > 2000) next.persona = "Shorten the persona to 2,000 characters or fewer.";
    setErrors(next);
    if (Object.keys(next).length) {
      // Focus the first field with a problem
      const order = ["name", "token", "persona"] as const;
      const first = order.find((k) => next[k]);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const bot = await api.bots.create({ name: name.trim(), telegramToken: token.trim(), personaPrompt: persona.trim() });
      await Promise.all([mutate((k) => Array.isArray(k) && k[0] === "bots"), mutate("dashboard/stats")]);
      setCreated(bot);
    } catch (err) {
      setErrors(err instanceof ApiError ? mapServerError(err) : { form: "Couldn't create the bot. Check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  async function startNow() {
    if (!created) return;
    setStarting(true);
    try {
      await api.bots.start(created._id);
      await Promise.all([mutate((k) => Array.isArray(k) && k[0] === "bots"), mutate("dashboard/stats")]);
      toast.success(`${created.name} is running`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.display : "Couldn't start the bot. Open it and choose Start bot to try again.");
    } finally {
      setStarting(false);
      router.push(`/bots/${created._id}`);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="New bot" description="Two steps: connect a bot you made with BotFather, then describe how it should talk. You can test the persona before saving." />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
        <form ref={formRef} onSubmit={onSubmit} noValidate>
          <Step n={1} title="Connect Telegram" done={connectDone} description="The token lets TeleForge read and send messages as your bot. It's checked with Telegram when you save.">
            <Input
              name="name"
              label="Name"
              placeholder="Threadline Support"
              value={name}
              maxLength={60}
              autoComplete="off"
              onChange={(e) => {
                setName(e.target.value);
                setErrors((x) => ({ ...x, name: undefined }));
              }}
              error={errors.name}
              hint="Only shown in TeleForge."
            />
            <div className="space-y-3">
              <Input
                name="token"
                label="BotFather token"
                type="password"
                code
                leading={<Key />}
                autoComplete="off"
                spellCheck={false}
                placeholder="123456789:AAH4k…"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setErrors((x) => ({ ...x, token: undefined }));
                }}
                error={errors.token || (tokenLooksOff ? "That doesn't look like a full token yet. It's digits, a colon, then letters and numbers." : null)}
                aside={
                  <button
                    type="button"
                    onClick={() => setShowHelp((s) => !s)}
                    aria-expanded={showHelp}
                    aria-controls={helpId}
                    className="text-label font-medium text-accent-text underline-offset-2 hover:underline"
                  >
                    {showHelp ? "Hide steps" : "Where do I get this?"}
                  </button>
                }
                hint={
                  <span className="inline-flex items-center gap-1.5">
                    <LockSimple size={14} />
                    Encrypted with AES&#8209;256&#8209;GCM. You won&apos;t see it again after saving.
                  </span>
                }
              />
              <TokenHelp id={helpId} open={showHelp} />
            </div>
          </Step>

          <Step n={2} last title="Write the persona" done={personaDone} description="Tone, what the bot helps with, and what it must never do. Plain sentences work best. Test it on the right as you write.">
            <fieldset>
              <legend className="mb-2 text-label font-medium text-text">Start from a template</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PERSONA_TEMPLATES.map((t) => (
                  <label
                    key={t.id}
                    className={cn(
                      "relative flex cursor-pointer flex-col rounded-lg bg-surface px-4 py-3.5 pr-10 shadow-1 transition-[box-shadow,background-color] duration-150 hover:shadow-2",
                      "has-[:checked]:bg-accent-tint has-[:checked]:shadow-none has-[:checked]:ring-2 has-[:checked]:ring-accent",
                      "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                    )}
                  >
                    <input type="radio" name="template" value={t.id} checked={templateId === t.id} onChange={() => applyTemplate(t.id)} className="sr-only" />
                    <span className="text-sm font-medium text-text">{t.label}</span>
                    <span className="mt-0.5 text-label text-text-2">{t.blurb}</span>
                    {templateId === t.id && <CheckCircle aria-hidden weight="fill" size={20} className="absolute top-3.5 right-3.5 text-accent-text" />}
                  </label>
                ))}
              </div>
            </fieldset>
            <Textarea
              name="persona"
              label="Persona"
              placeholder="You answer questions for Threadline, a small clothing shop. Keep replies under three sentences. Never promise refunds."
              value={persona}
              max={2000}
              rows={9}
              onChange={(e) => {
                setPersona(e.target.value);
                setTemplateId(null);
                setErrors((x) => ({ ...x, persona: undefined }));
              }}
              error={errors.persona}
            />
          </Step>

          {errors.form && (
            <p role="alert" className="mt-6 rounded-md bg-danger-tint px-4 py-3 text-sm text-danger-text ring-1 ring-danger-line ring-inset">
              {errors.form}
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-label text-text-2">The bot is saved as a draft. Nothing replies on Telegram until you start it.</p>
            <div className="flex gap-2">
              <ButtonLink href="/dashboard" variant="ghost" className="hidden sm:inline-flex">
                Cancel
              </ButtonLink>
              <Button type="submit" loading={submitting} className="w-full sm:w-auto">
                {submitting ? "Checking token…" : "Create bot"}
              </Button>
            </div>
          </div>
        </form>

        <aside aria-label="Test the persona" className="lg:sticky lg:top-36 lg:pt-1">
          <PersonaPlayground personaPrompt={persona} botName={name} suggestion={template?.sample ?? "Hi, what can you help me with?"} />
          <p className="mt-3 text-label text-text-2">Test messages count toward your Gemini quota, the same as real ones.</p>
        </aside>
      </div>

      <Dialog
        open={!!created}
        onClose={() => created && router.push(`/bots/${created._id}`)}
        title={created ? `${created.name} is ready` : "Bot created"}
        description="Telegram accepted the token. The bot is a draft until you start it."
        footer={
          <>
            <Button variant="secondary" onClick={() => created && router.push(`/bots/${created._id}`)}>
              Not now
            </Button>
            <Button onClick={startNow} loading={starting} data-autofocus>
              Start bot
            </Button>
          </>
        }
      >
        {created && (
          <div className="flex items-center gap-3 rounded-md bg-bg-2 p-3 ring-1 ring-line ring-inset">
            <BotAvatar name={created.name} seed={created._id} size={36} />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-text">{created.name}</div>
              <div className="truncate text-label text-text-2">@{created.telegramBotInfo.username}</div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
