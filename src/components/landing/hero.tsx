import { Shot } from "@/components/brand/shot";
import { CreateBotButton } from "./auth-cta";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-x-clip">
      <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[1200px] items-center gap-12 px-5 pt-12 pb-16 sm:px-8 sm:pt-16 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14 lg:py-16">
        <div className="max-w-xl">
          {/* Sized on wide screens so "Give /newbot" stays on one line instead of leaving "Give" alone */}
          <h1 id="hero-title" className="type-display text-text lg:text-[min(4.6rem,calc(1rem+4.4vw))]">
            Give /newbot a personality.
          </h1>
          <p className="mt-6 max-w-[36ch] text-lg text-text-2">
            Write how your Telegram bot should talk. TeleForge answers every message in that voice with Google Gemini, and keeps each chat on your dashboard.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <CreateBotButton />
            <a href="#how" className="text-md font-medium text-text underline decoration-line-2 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-text">
              See how it works
            </a>
          </div>
          <p className="mt-8 text-sm text-text-2">Runs on Gemini&apos;s free tier. No server, webhook or code to set up.</p>
        </div>

        {/* Desktop: the real bot page, bleeding off the right edge. Phones: the real phone view. */}
        <figure className="relative lg:-mr-[max(2rem,calc((100vw-1200px)/2+2rem))]">
          <Shot
            name="conversations"
            priority
            alt="A TeleForge bot page. ShopHelper is running; today's stats sit above a Telegram conversation it answered in its support persona."
            className="hidden rounded-xl shadow-frame lg:block lg:rounded-r-none"
            sizes="(min-width: 1024px) 760px, 0px"
          />
          <Shot
            name="phone-chat"
            priority
            alt="The same conversation on a phone: a customer's question and the bot's reply."
            className="mx-auto max-w-[22rem] rounded-xl shadow-frame lg:hidden"
            sizes="(max-width: 1023px) 352px, 0px"
          />
        </figure>
      </div>
    </section>
  );
}
