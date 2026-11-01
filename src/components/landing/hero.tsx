import { ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { CreateBotButton } from "./auth-cta";
import { HeroDemo } from "./hero-demo";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-24">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-20 -z-10 flex justify-center overflow-hidden blur-3xl opacity-35 dark:opacity-20"
      >
        <div className="h-[26rem] w-[50rem] rounded-full bg-gradient-to-tr from-accent via-[#229ed9] to-accent" />
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-5 text-center sm:px-8">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface/80 px-3.5 py-1 text-xs font-medium text-text-2 shadow-xs backdrop-blur-md">
          <span className="size-2 rounded-full bg-ok animate-pulse" />
          <span>Powered by Google Gemini 3.8 Flash</span>
          <span className="text-text-3 font-normal">|</span>
          <span className="font-semibold text-accent">Zero Server Setup</span>
        </div>

        {/* Display title */}
        <h1
          id="hero-title"
          className="mt-5 max-w-4xl type-display text-text tracking-tight lg:text-[min(4.4rem,calc(1.3rem+4.2vw))]"
        >
          Give <span className="font-mono text-brand">/newbot</span> a personality.
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-2xl text-base text-text-2 leading-relaxed sm:text-lg">
          Write how your Telegram bot should talk. TeleForge answers every message in that voice with Google Gemini, and keeps each chat synced live to your dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
          <CreateBotButton size="lg" />
          <a
            href="#how"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-line-2 bg-surface px-5 text-md font-medium text-text shadow-xs transition hover:bg-bg-hover hover:border-line"
          >
            <span>See how it works</span>
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Feature highlights */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-xs text-text-2 sm:text-sm">
          <div className="flex items-center gap-1.5">
            <CheckCircle size={15} weight="fill" className="text-ok" />
            <span>Free Gemini 2.5 tier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle size={15} weight="fill" className="text-ok" />
            <span>No server or webhook needed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle size={15} weight="fill" className="text-ok" />
            <span>Connects Telegram in 60s</span>
          </div>
        </div>

        {/* Interactive Telegram bot demonstration */}
        <HeroDemo />
      </div>
    </section>
  );
}
