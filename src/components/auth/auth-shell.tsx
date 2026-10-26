import { Lockup } from "@/components/brand/logo";
import { AuthTypewriter } from "@/components/auth/auth-typewriter";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 bg-bg lg:grid-cols-2">
      {/* Left side: Typewriting showcase (split screen left side) */}
      <aside aria-label="TeleForge Showcase" className="relative hidden border-r border-line bg-bg-2 lg:block">
        <AuthTypewriter />
      </aside>

      {/* Right side: Auth screens (login / signup) */}
      <div className="flex min-h-dvh flex-col justify-between px-6 py-6 sm:px-10 sm:py-8 lg:px-14 xl:px-20">
        {/* Mobile header: visible only on small screens when left panel is hidden */}
        <div className="flex items-center justify-between lg:hidden">
          <Lockup size={26} />
        </div>

        {/* Main auth form container — max-w-sm (384px) matches Google sign-in width precisely */}
        <main id="main" className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8">
          {children}
        </main>

        {/* Footer for mobile/desktop */}
        <p className="text-center text-label text-text-2 lg:text-left">
          TeleForge isn&apos;t affiliated with Telegram or Google.
        </p>
      </div>
    </div>
  );
}
