import { Lockup } from "@/components/brand/logo";
import { Shot } from "@/components/brand/shot";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] min-h-dvh bg-bg lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="flex flex-col px-5 py-5 sm:px-10 sm:py-8">
        <Lockup size={26} />
        <main id="main" className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          {children}
        </main>
        <p className="text-label text-text-2">TeleForge isn&apos;t affiliated with Telegram or Google.</p>
      </div>

      <aside aria-label="Product preview" className="relative hidden overflow-hidden border-l border-line bg-bg-2 lg:block">
        <div className="absolute inset-y-0 left-12 flex w-[56rem] flex-col justify-center xl:left-16">
          <figure>
            <Shot
              name="conversations"
              alt="A TeleForge bot page: the bot is running, with today's stats and a Telegram conversation answered in its persona."
              className="rounded-xl shadow-frame"
              sizes="900px"
            />
            <figcaption className="mt-5 max-w-[46ch] text-sm text-text-2">
              <span className="font-medium text-text">Every chat, as it happens.</span> Each message your bot receives and every reply it sends shows up on its page within seconds.
            </figcaption>
          </figure>
        </div>
      </aside>
    </div>
  );
}
