import Link from "next/link";
import {
  EyeSlash,
  Key,
  PaperPlaneTilt,
  Sparkle,
  ClockCounterClockwise,
  CheckCircle,
  ChatCircleText,
  Lock,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { Lockup } from "@/components/brand/logo";
import { Shot } from "@/components/brand/shot";
import { ChatBubble } from "@/components/app/chat";
import { buttonClass } from "@/components/ui/button";
import { BotAvatar, StatusBadge } from "@/components/ui/misc";
import { PERSONA_TEMPLATES } from "@/lib/persona-templates";
import { cn } from "@/lib/utils";
import { CreateBotButton, FooterAuthLink, SignInLink } from "./auth-cta";
import { PersonaSwitcher } from "./persona-switcher";
import { FaqAccordion } from "./faq-accordion";

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

/* ── Personas: the product's idea, shown by switching ─────────────────── */

export function Personas() {
  return (
    <section id="personas" aria-labelledby="personas-title" className="scroll-mt-16 bg-bg-2 py-20 sm:py-28">
      <Container>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-accent mb-2">
              <Sparkle size={14} weight="fill" />
              <span>Prompt Engine</span>
            </div>
            <h2 id="personas-title" className="type-section text-text">
              Same question, <span className="text-brand">four different bots.</span>
            </h2>
          </div>
          <p className="max-w-[46ch] text-base text-text-2 lg:justify-self-end sm:text-lg">
            A persona is a few sentences you write. Change it, and the same bot immediately answers like a customer support agent, a tutor or a restaurant host.
          </p>
        </div>
        <div className="mt-10 sm:mt-14">
          <PersonaSwitcher />
        </div>
      </Container>
    </section>
  );
}

/* ── How it works: three steps, each drawn with the app's own parts ───── */

const DEMO_TOKEN = "7412583690:AAFq3k8L2xV9c";

function BotFatherChat() {
  return (
    <div role="img" aria-label="A Telegram chat with BotFather: send /newbot, choose a name, and get the token." className="flex h-full flex-col bg-chat-bg">
      <div aria-hidden className="flex items-center gap-2.5 border-b border-line bg-surface px-4 py-2.5">
        <BotAvatar name="BotFather" size={28} />
        <div>
          <div className="text-label font-medium text-text">BotFather</div>
          <div className="text-caption text-text-2">bot</div>
        </div>
      </div>
      <div aria-hidden className="flex flex-1 flex-col justify-end gap-1.5 p-4 text-xs">
        <ChatBubble compact side="out">
          /newbot
        </ChatBubble>
        <ChatBubble compact side="in">
          Alright, a new bot. How are we going to call it?
        </ChatBubble>
        <ChatBubble compact side="out">
          Threadline Support
        </ChatBubble>
        <ChatBubble compact side="in">
          Done! Use this token to access the HTTP API: {DEMO_TOKEN}…
        </ChatBubble>
      </div>
    </div>
  );
}

const fakeField = "rounded-md border border-line-input bg-surface text-label text-text";

function SetupForm() {
  const persona = PERSONA_TEMPLATES[0].prompt;
  return (
    <div role="img" aria-label="The New bot form with the BotFather token pasted in and a customer support persona written." className="flex h-full flex-col gap-4 p-4 text-xs">
      <div aria-hidden className="space-y-2">
        <div className="text-label font-medium text-text">BotFather token</div>
        <div className={cn(fakeField, "flex h-9 items-center gap-2 px-3 font-mono")}>
          <Key size={14} className="shrink-0 text-text-3" />
          <span className="min-w-0 flex-1 truncate">{DEMO_TOKEN}…</span>
          <EyeSlash size={14} className="shrink-0 text-text-2" />
        </div>
      </div>
      <div aria-hidden className="flex flex-1 flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-label font-medium text-text">Persona</span>
          <span className="text-label text-text-2">{persona.length} / 2,000</span>
        </div>
        <div className={cn(fakeField, "flex-1 px-3 py-2")}>
          <p className="line-clamp-4">{persona}</p>
        </div>
      </div>
    </div>
  );
}

function RunningBot() {
  return (
    <div role="img" aria-label="Threadline Support is running and has answered a customer who asked whether the shop ships to Lahore." className="flex h-full flex-col text-xs">
      <div aria-hidden className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <BotAvatar name="Threadline Support" seed="6adba520ef3c7ceee4715be7" size={32} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-text">Threadline Support</div>
          <StatusBadge status="active" />
        </div>
        <span className={buttonClass({ variant: "secondary", size: "sm" })}>Stop bot</span>
      </div>
      <div aria-hidden className="flex flex-1 flex-col justify-end gap-1.5 bg-chat-bg p-4">
        <ChatBubble compact side="in" name="Maya">
          Do you ship to Lahore?
        </ChatBubble>
        <ChatBubble compact side="out">
          We do. Orders reach Lahore in 3 to 4 business days, and shipping is free over Rs 3,000.
        </ChatBubble>
      </div>
    </div>
  );
}

const STEPS = [
  {
    step: "01",
    title: "Make the bot in Telegram",
    body: "Message @BotFather, send /newbot, pick a name, and copy the token it gives you.",
    visual: <BotFatherChat />,
  },
  {
    step: "02",
    title: "Paste the token, write the persona",
    body: "Start from a template or write your own, then chat with it until the replies sound right.",
    visual: <SetupForm />,
  },
  {
    step: "03",
    title: "Start it",
    body: "TeleForge starts polling Telegram right away. Message your bot and the chat appears on its page.",
    visual: <RunningBot />,
  },
];

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-accent mb-2">
            <span>Fast Setup</span>
          </div>
          <h2 id="how-title" className="type-section text-text">
            From BotFather to the first reply in a minute.
          </h2>
          <p className="mt-3 text-base text-text-2 sm:text-lg">
            No server code, webhook configurations, or cloud infrastructure needed. Just 3 simple steps.
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-8 sm:mt-16 lg:grid-cols-3">
          {STEPS.map((s) => (
            <li
              key={s.title}
              className="flex flex-col justify-between rounded-2xl border border-line-2 bg-surface p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-accent-tint font-mono text-sm font-bold text-accent ring-1 ring-accent-line ring-inset">
                    {s.step}
                  </span>
                  <span className="text-caption text-text-3 font-mono">Step {s.step}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-text">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-2">{s.body}</p>
              </div>
              <div className="mt-6 min-h-56 overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
                {s.visual}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ── Showcase: the real overview, big, then two details ───────────────── */

export function Showcase() {
  return (
    <section id="showcase" aria-labelledby="showcase-title" className="scroll-mt-16 pb-20 sm:pb-28">
      <Container>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-accent mb-2">
              <span>Management Hub</span>
            </div>
            <h2 id="showcase-title" className="type-section text-text">
              Every bot, every chat, <span className="text-brand">one page.</span>
            </h2>
          </div>
          <p className="max-w-[46ch] text-base text-text-2 lg:justify-self-end sm:text-lg">
            See which bots are running, what people asked today and what each bot answered. Errors, like a revoked token, show up before your users notice.
          </p>
        </div>

        {/* Browser Mockup Wrapper for Overview */}
        <div className="relative mt-12 sm:mt-16">
          {/* Ambient glow behind overview */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-r from-accent/20 via-brand/20 to-accent/20 blur-2xl opacity-50"
          />

          <figure className="overflow-hidden rounded-2xl border border-line-2 bg-surface shadow-2xl">
            {/* Browser Chrome Header */}
            <div className="flex items-center justify-between border-b border-line bg-bg-2 px-4 py-2.5 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-danger/80" />
                <span className="size-2.5 rounded-full bg-warn/80" />
                <span className="size-2.5 rounded-full bg-ok/80" />
              </div>
              <div className="flex items-center gap-2 rounded-md border border-line bg-surface/90 px-3 py-1 text-xs text-text-2 shadow-xs">
                <Lock size={12} className="text-ok" />
                <span className="font-mono text-text-3">https://teleforge.dev/dashboard/overview</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-ok font-medium">
                <span className="size-1.5 rounded-full bg-ok animate-pulse" />
                <span className="hidden sm:inline">Live Stream Active</span>
              </div>
            </div>

            {/* Screenshots */}
            <Shot
              name="overview-phone"
              alt="The TeleForge overview on a phone: a notice that one bot stopped with an error, then today's messages, replies and people."
              className="mx-auto max-w-[22rem] sm:hidden"
              sizes="(max-width: 639px) 352px, 0px"
            />
            <Shot
              name="overview"
              alt="The TeleForge overview: messages today with a seven-day chart, replies, people and monthly totals above a table of bots with their status and last message."
              className="hidden sm:block"
              sizes="(min-width: 1200px) 1136px, (min-width: 640px) 100vw, 0px"
            />
          </figure>
        </div>

        {/* 2-Card details below */}
        <div className="mt-8 hidden grid-cols-[minmax(0,1fr)] gap-6 sm:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <figure className="flex flex-col rounded-2xl border border-line-2 bg-surface p-4 shadow-sm">
            <Shot
              name="activity"
              alt="A bot's activity log: messages, replies and a restart, each with its time."
              className="flex-1 rounded-xl shadow-xs overflow-hidden [&_img]:h-full [&_img]:object-cover [&_img]:object-left-top"
              sizes="(min-width: 1024px) 760px, 100vw"
            />
            <figcaption className="mt-3.5 flex items-center justify-between text-xs text-text-2">
              <span>The activity log stores 30 days of messages, replies, starts, stops and errors.</span>
              <span className="font-mono text-accent font-semibold">30-Day Audit</span>
            </figcaption>
          </figure>

          <figure className="hidden flex-col rounded-2xl border border-line-2 bg-surface p-4 shadow-sm lg:flex">
            <Shot
              name="phone-chat"
              alt="A conversation on a phone-sized screen."
              className="w-full rounded-xl shadow-xs overflow-hidden"
              sizes="(min-width: 1024px) 370px, 0px"
            />
            <figcaption className="mt-3.5 flex items-center justify-between text-xs text-text-2">
              <span>Inspect conversations on your mobile phone.</span>
              <span className="font-mono text-ok font-semibold">Mobile Ready</span>
            </figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}

/* ── Runtime: the five events every message goes through ──────────────── */

const EVENTS = [
  {
    step: "1",
    where: "Telegram API",
    id: "getUpdates",
    icon: <PaperPlaneTilt size={16} weight="fill" className="text-[#229ed9]" />,
    title: "Telegram hands over the message",
    body: "Each bot keeps a long poll open to Telegram, so new messages arrive immediately without configuring a webhook or exposing a public URL.",
  },
  {
    step: "2",
    where: "Activity log",
    id: "message_in",
    icon: <ClockCounterClockwise size={16} weight="bold" className="text-accent" />,
    title: "It's saved with its sender",
    body: "The incoming message is securely stored with the sender's username and paired with that chat's last 10 exchanges for conversational context.",
  },
  {
    step: "3",
    where: "Gemini API",
    id: "generateContent",
    icon: <Sparkle size={16} weight="fill" className="text-amber-500" />,
    title: "Gemini writes the reply",
    body: "Your bot persona prompt, the recent conversation history, and the new message are sent to Google Gemini 3.8 Flash with safety filters active.",
  },
  {
    step: "4",
    where: "Telegram API",
    id: "sendMessage",
    icon: <PaperPlaneTilt size={16} weight="bold" className="text-[#229ed9]" />,
    title: "The reply goes back to the chat",
    body: "Sent back to Telegram usually within 1 to 2 seconds. If Gemini is ever rate-limited, the bot sends a courteous apology instead of going silent.",
  },
  {
    step: "5",
    where: "Live Dashboard",
    id: "message_out",
    icon: <CheckCircle size={16} weight="fill" className="text-ok" />,
    title: "Both sides stream to your dashboard",
    body: "The reply is logged in real-time, allowing you to monitor active chats, message volume, and bot health directly from your control panel.",
  },
];

export function Runtime() {
  return (
    <section id="runtime" aria-labelledby="runtime-title" className="scroll-mt-16 border-t border-line bg-bg-2 py-20 sm:py-28">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-accent mb-2">
            <span>Pipeline Architecture</span>
          </div>
          <h2 id="runtime-title" className="type-section text-text">
            What happens to a message.
          </h2>
          <p className="mt-4 max-w-[40ch] text-base text-text-2 leading-relaxed sm:text-lg">
            Every incoming Telegram message flows through five deterministic steps. Zero webhooks, zero server maintenance.
          </p>
        </div>

        {/* Pipeline Process Flow */}
        <ol className="space-y-4">
          {EVENTS.map((e) => (
            <li
              key={e.id}
              className="group relative rounded-xl border border-line bg-surface p-5 shadow-xs transition-all duration-200 hover:border-line-2 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-bg-2 ring-1 ring-line">
                  {e.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-text">{e.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-caption font-medium text-text-2">{e.where}</span>
                      <code className="rounded-xs bg-bg-2 px-1.5 py-0.5 font-mono text-[11px] text-text-3">
                        {e.id}
                      </code>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-text-2">{e.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ── FAQ: Interactive Accordion ───────────────────────────────────────── */

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-16 py-20 sm:py-28">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-accent mb-2">
            <span>Knowledge Base</span>
          </div>
          <h2 id="faq-title" className="type-section text-text">
            Questions people ask.
          </h2>
          <p className="mt-4 text-base text-text-2 leading-relaxed">
            Everything you need to know about Telegram bots, Google Gemini API quotas, and privacy.
          </p>

          {/* Quick Help Card */}
          <div className="mt-8 rounded-2xl border border-line-2 bg-surface p-5 shadow-xs">
            <div className="flex items-center gap-2 text-text font-semibold text-sm">
              <ChatCircleText size={18} className="text-accent" />
              <span>Ready to test your first bot?</span>
            </div>
            <p className="mt-2 text-xs text-text-2 leading-relaxed">
              Sign up in 30 seconds. No credit card or server setup needed to run on Gemini&apos;s free tier.
            </p>
            <div className="mt-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
              >
                <span>Create an account now</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* The interactive FAQ Accordion */}
        <FaqAccordion />
      </Container>
    </section>
  );
}

/* ── Closing CTA Banner ───────────────────────────────────────────────── */

export function Closing() {
  return (
    <section aria-labelledby="close-title" className="border-t border-line bg-bg-2 py-16 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-line-2 bg-gradient-to-br from-surface via-bg-2 to-surface p-8 shadow-2xl sm:p-12 lg:p-16">
          {/* Ambient lighting effect */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-accent/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-brand/15 blur-3xl"
          />

          <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface/80 px-3.5 py-1 text-xs font-medium text-text-2 shadow-xs backdrop-blur-sm">
                <span className="size-2 rounded-full bg-ok animate-pulse" />
                <span>60-Second Setup</span>
                <span className="text-text-3">•</span>
                <span className="font-semibold text-accent">Free Gemini Tier</span>
              </div>
              <h2 id="close-title" className="mt-4 type-section text-text tracking-tight sm:text-4xl">
                Have a token ready? <br />
                <span className="text-brand">You&apos;re a minute away.</span>
              </h2>
              <p className="mt-3 max-w-xl text-base text-text-2 leading-relaxed sm:text-lg">
                Create an account, paste the token from @BotFather, describe how your bot should talk, and watch it reply live on Telegram.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <CreateBotButton size="lg" />
              <SignInLink className="h-11 px-5 border border-line-2 bg-surface hover:bg-bg-hover hover:border-line shadow-xs font-medium" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────────────────── */

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bg py-12">
      <Container className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Lockup size={26} />
          <p className="max-w-[42ch] text-xs text-text-2 leading-relaxed">
            Craft intelligent Telegram bots with custom personalities powered by Google Gemini.
          </p>
          <div className="flex items-center gap-2 text-xs text-text-3">
            <span className="size-2 rounded-full bg-ok" />
            <span>All systems operational</span>
          </div>
        </div>

        <nav aria-label="Footer Navigation">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <li>
              <a href="#personas" className="text-text-2 transition hover:text-text">
                Personas
              </a>
            </li>
            <li>
              <a href="#how" className="text-text-2 transition hover:text-text">
                How it works
              </a>
            </li>
            <li>
              <a href="#showcase" className="text-text-2 transition hover:text-text">
                Overview
              </a>
            </li>
            <li>
              <a href="#runtime" className="text-text-2 transition hover:text-text">
                Runtime
              </a>
            </li>
            <li>
              <a href="#faq" className="text-text-2 transition hover:text-text">
                FAQ
              </a>
            </li>
            <li>
              <FooterAuthLink />
            </li>
          </ul>
        </nav>
      </Container>
      <div className="mx-auto mt-8 max-w-[1200px] border-t border-line px-5 pt-6 text-center text-caption text-text-3 sm:px-8">
        TeleForge isn&apos;t affiliated with Telegram or Google. Built for creators and developers.
      </div>
    </footer>
  );
}
