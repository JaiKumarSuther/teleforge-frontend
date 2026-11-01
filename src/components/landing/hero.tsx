"use client";

import { MotionConfig, motion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { CreateBotButton } from "./auth-cta";

// Plays once on load. With reduced motion the rise is dropped and only the fade remains.
const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
};

export function Hero() {
  return (
    <MotionConfig reducedMotion="user">
    <section aria-labelledby="hero-title" className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden py-8">
      <motion.div variants={container} initial="hidden" animate="show" className="mx-auto flex w-full max-w-[1100px] flex-col items-center px-5 text-center sm:px-8">
        <motion.div variants={item} className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-line-strong bg-panel px-5 py-2 text-sm font-medium text-ink-2 sm:text-md">
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-live" />
            Powered by Google Gemini 3.8 Flash
          </span>
          <span aria-hidden className="hidden text-ink-3 sm:inline">
            |
          </span>
          <span className="text-relay-link">Zero Server Setup</span>
        </motion.div>

        <motion.h1
          variants={item}
          id="hero-title"
          className="mt-[clamp(1rem,3.5vh,2rem)] max-w-5xl type-display text-[clamp(2.25rem,min(6vw,8.5vh),5.5rem)] leading-[1.05] tracking-tight text-ink"
        >
          Give <span className="font-mono text-relay-link">/newbot</span> a personality.
        </motion.h1>

        <motion.p variants={item} className="mt-[clamp(0.75rem,2.5vh,1.5rem)] max-w-3xl text-md leading-relaxed text-ink-2 sm:text-title sm:leading-9">
          Write how your Telegram bot should talk. TeleForge answers every message in that voice with Google Gemini, and keeps each chat synced live to your dashboard.
        </motion.p>

        <motion.div variants={item} className="mt-[clamp(1.25rem,4vh,2.5rem)] flex flex-wrap items-center justify-center gap-4">
          <CreateBotButton size="lg" className="h-14 px-8 text-title" />
          <a
            href="#how"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-md border border-line-strong bg-panel px-8 text-title font-medium text-ink transition hover:bg-hover"
          >
            <span>See how it works</span>
            <motion.span aria-hidden className="inline-flex" whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
              <ArrowRight size={20} />
            </motion.span>
          </a>
        </motion.div>

        <motion.ul variants={item} className="mt-[clamp(1.5rem,5vh,4rem)] grid w-full max-w-5xl grid-cols-1 divide-y divide-line overflow-hidden rounded-lg border border-line bg-panel text-left sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["Free Gemini 3.8 tier", "Start without a card."],
            ["No server or webhook needed", "We run the bot for you."],
            ["Connects Telegram in 60s", "Paste a BotFather token."],
          ].map(([title, body]) => (
            <li key={title} className="flex gap-3 p-5">
              <CheckCircle size={22} weight="fill" className="mt-0.5 shrink-0 text-live" />
              <div>
                <p className="text-md font-medium text-ink">{title}</p>
                <p className="mt-0.5 text-sm text-ink-2">{body}</p>
              </div>
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
    </MotionConfig>
  );
}
