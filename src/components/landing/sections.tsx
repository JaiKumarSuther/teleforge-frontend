import Link from "next/link";
import { EyeSlash, Key } from "@phosphor-icons/react/dist/ssr";
import { Lockup } from "@/components/brand/logo";
import { Shot } from "@/components/brand/shot";
import { ChatBubble } from "@/components/app/chat";
import { buttonClass } from "@/components/ui/button";
import { BotAvatar, StatusBadge } from "@/components/ui/misc";
import { PERSONA_TEMPLATES } from "@/lib/persona-templates";
import { cn } from "@/lib/utils";
import { CreateBotButton } from "./auth-cta";
import { PersonaSwitcher } from "./persona-switcher";

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

/* ── Personas: the product's idea, shown by switching ─────────────────── */

export function Personas() {
  return (
    <section id="personas" aria-labelledby="personas-title" className="scroll-mt-16 bg-bg-2 py-24 sm:py-32">
      <Container>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <h2 id="personas-title" className="type-section max-w-[14ch] text-text">
            Same question, four different bots.
          </h2>
          <p className="max-w-[46ch] text-lg text-text-2 lg:justify-self-end">
            A persona is a few sentences you write. Change it, and the same bot answers like a support agent, a tutor or a restaurant host.
          </p>
        </div>
        <div className="mt-12 sm:mt-16">
          <PersonaSwitcher />
        </div>
      </Container>
    </section>
  );
}

/* ── How it works: three steps, each drawn with the app's own parts ───── */

// Built from the same components as the app, at real size, so they stay sharp and readable in
// both themes. Each one is a picture (role="img" with a description), not a working control.

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
      <div aria-hidden className="flex flex-1 flex-col justify-end gap-1.5 p-4">
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
    <div role="img" aria-label="The New bot form with the BotFather token pasted in and a customer support persona written." className="flex h-full flex-col gap-4 p-4">
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
    <div role="img" aria-label="Threadline Support is running and has answered a customer who asked whether the shop ships to Lahore." className="flex h-full flex-col">
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
    title: "Make the bot in Telegram",
    body: "Message @BotFather, send /newbot, pick a name, and copy the token it gives you.",
    visual: <BotFatherChat />,
  },
  {
    title: "Paste the token, write the persona",
    body: "Start from a template or write your own, then chat with it until the replies sound right.",
    visual: <SetupForm />,
  },
  {
    title: "Start it",
    body: "TeleForge starts polling Telegram right away. Message your bot and the chat appears on its page.",
    visual: <RunningBot />,
  },
];

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-16 py-24 sm:py-32">
      <Container>
        <h2 id="how-title" className="type-section max-w-[18ch] text-text">
          From BotFather to the first reply in a minute.
        </h2>
        <ol className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-12 sm:mt-16 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid grid-rows-[auto_auto_1fr] lg:row-span-3 lg:grid-rows-subgrid">
              <div className="flex items-baseline gap-3">
                <span aria-hidden className="text-sm font-medium text-text-2">
                  {i + 1}
                </span>
                <h3 className="type-title text-text">{s.title}</h3>
              </div>
              <p className="mt-2 max-w-[38ch] pl-6 text-md text-text-2">{s.body}</p>
              <div className="mt-6 min-h-56 overflow-hidden rounded-lg bg-surface shadow-frame">{s.visual}</div>
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
    <section aria-labelledby="showcase-title" className="pb-24 sm:pb-32">
      <Container>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <h2 id="showcase-title" className="type-section max-w-[14ch] text-text">
            Every bot, every chat, one page.
          </h2>
          <p className="max-w-[46ch] text-lg text-text-2 lg:justify-self-end">
            See which bots are running, what people asked today and what each bot answered. Errors, like a revoked token, show up before your users notice.
          </p>
        </div>
        {/* Phones get the phone capture: the desktop one would be too small to read. */}
        <figure className="mt-12 sm:mt-16">
          <Shot
            name="overview-phone"
            alt="The TeleForge overview on a phone: a notice that one bot stopped with an error, then today's messages, replies and people."
            className="mx-auto max-w-[22rem] rounded-xl shadow-frame sm:hidden"
            sizes="(max-width: 639px) 352px, 0px"
          />
          <Shot
            name="overview"
            alt="The TeleForge overview: messages today with a seven-day chart, replies, people and monthly totals above a table of bots with their status and last message."
            className="hidden rounded-xl shadow-frame sm:block"
            sizes="(min-width: 1200px) 1136px, (min-width: 640px) 100vw, 0px"
          />
        </figure>
        <div className="mt-6 hidden grid-cols-[minmax(0,1fr)] gap-6 sm:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <figure className="flex flex-col">
            <Shot
              name="activity"
              alt="A bot's activity log: messages, replies and a restart, each with its time."
              className="flex-1 rounded-xl shadow-frame [&_img]:h-full [&_img]:object-cover [&_img]:object-left-top"
              sizes="(min-width: 1024px) 760px, 100vw"
            />
            <figcaption className="mt-3 text-sm text-text-2">The activity log keeps 30 days of messages, replies, starts, stops and errors.</figcaption>
          </figure>
          {/* Below lg the hero already shows this capture. */}
          <figure className="hidden flex-col lg:flex">
            <Shot
              name="phone-chat"
              alt="A conversation on a phone-sized screen."
              className="w-full rounded-xl shadow-frame"
              sizes="(min-width: 1024px) 370px, 0px"
            />
            <figcaption className="mt-3 text-sm text-text-2">Works the same on your phone.</figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}

/* ── Runtime: the five events every message goes through ──────────────── */

const EVENTS = [
  { where: "Telegram API", id: "getUpdates", title: "Telegram hands over the message", body: "Each bot keeps a long poll open to Telegram, so new messages arrive without a webhook or a public URL." },
  { where: "Activity log", id: "message_in", title: "It's saved with its sender", body: "The message is stored with the sender's name and paired with that chat's last 10 exchanges." },
  { where: "Gemini API", id: "generateContent", title: "Gemini writes the reply", body: "Your persona, the recent history and the new message go to Gemini (2.5 Flash by default) with safety filters on." },
  { where: "Telegram API", id: "sendMessage", title: "The reply goes back to the chat", body: "Usually a second or two after the message arrived. If Gemini is busy, the bot sends a short apology instead of going quiet." },
  { where: "Activity log", id: "message_out", title: "Both sides are on your dashboard", body: "The reply is saved too, so the whole conversation shows up on the bot's page." },
];

export function Runtime() {
  return (
    <section aria-labelledby="runtime-title" className="border-t border-line bg-bg-2 py-24 sm:py-32">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="runtime-title" className="type-section max-w-[12ch] text-text">
            What happens to a message.
          </h2>
          <p className="mt-5 max-w-[40ch] text-lg text-text-2">Every message takes the same five steps. The two marked Activity log are saved, so you can read them on the bot&apos;s page.</p>
        </div>
        <ol className="divide-y divide-line border-y border-line">
          {EVENTS.map((e, i) => (
            <li key={e.id} className="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-2 py-7 sm:grid-cols-[2.5rem_minmax(0,1fr)]">
              <span aria-hidden className="text-sm font-medium text-text-2 sm:pt-1">
                {i + 1}
              </span>
              <div>
                <h3 className="type-title text-text">{e.title}</h3>
                <p className="mt-1.5 max-w-[56ch] text-md text-text-2">{e.body}</p>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-label text-text-2">
                  <span className={e.where === "Activity log" ? "font-medium text-accent-text" : undefined}>{e.where}</span>
                  <code className="rounded-xs bg-bg-3 px-1.5 py-0.5 text-label text-text">{e.id}</code>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ── FAQ: plain rows, no accordions ───────────────────────────────────── */

const FAQS = [
  { q: "Do I need to write any code?", a: "No. You need a Telegram account to create the bot with @BotFather, and a few sentences describing how it should behave." },
  { q: "What does it cost?", a: "TeleForge runs on Google Gemini's free tier, which covers personal and small community bots. Each account can run up to 10 bots." },
  { q: "Who can see my bot token?", a: "No one, including you. It's checked with Telegram once, encrypted with AES\u2011256\u2011GCM and never returned by the API. To change it, create the bot again." },
  { q: "Can I change the persona later?", a: "Yes, any time. A running bot uses the new persona from its next message, with no restart." },
  { q: "Does the bot remember the conversation?", a: "It keeps the last 10 exchanges of each chat as context. That memory clears if the server restarts; the activity log keeps 30 days." },
  { q: "What if Gemini doesn't answer?", a: "Blocked content gets a polite refusal. If Gemini is rate-limited or times out, the bot sends a short apology rather than staying silent." },
  { q: "What happens if the server restarts?", a: "Bots that were running start again automatically, and pick up messages that arrived while they were down." },
  { q: "Is TeleForge made by Telegram?", a: "No. TeleForge is an independent project that uses Telegram's public Bot API and Google's Gemini API." },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-16 py-24 sm:py-32">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <h2 id="faq-title" className="type-section max-w-[10ch] text-text">
          Questions people ask.
        </h2>
        <dl className="divide-y divide-line border-y border-line">
          {FAQS.map((f) => (
            <div key={f.q} className="py-6">
              <dt className="text-md font-medium text-text">{f.q}</dt>
              <dd className="mt-2 max-w-[60ch] text-md text-text-2">{f.a}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

/* ── Close ────────────────────────────────────────────────────────────── */

export function Closing() {
  return (
    <section aria-labelledby="close-title" className="border-t border-line bg-bg-2">
      <Container className="flex flex-col gap-8 py-20 sm:py-24 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 id="close-title" className="type-section max-w-[16ch] text-text">
            Have a token ready? You&apos;re a minute away.
          </h2>
          <p className="mt-5 max-w-[44ch] text-lg text-text-2">Create an account, paste the token, pick a persona and start the bot.</p>
        </div>
        <CreateBotButton className="self-start lg:self-auto" />
      </Container>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col gap-8 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Lockup size={24} />
          <p className="max-w-[40ch] text-sm text-text-2">TeleForge isn&apos;t affiliated with Telegram or Google.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <li>
              <a href="#personas" className="text-text-2 hover:text-text">
                Personas
              </a>
            </li>
            <li>
              <a href="#how" className="text-text-2 hover:text-text">
                How it works
              </a>
            </li>
            <li>
              <a href="#faq" className="text-text-2 hover:text-text">
                FAQ
              </a>
            </li>
            <li>
              <Link href="/login" className="text-text-2 hover:text-text">
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
