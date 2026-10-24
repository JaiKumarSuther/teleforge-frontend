import { Lockup } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="mx-auto flex h-16 w-full max-w-[1200px] items-center px-5 sm:px-8">
        <Lockup />
      </header>
      <main id="main" className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-5 pb-24 sm:px-8">
        <p className="text-sm font-medium text-text-2">Error 404</p>
        <h1 className="type-section mt-3 max-w-[16ch] text-text">There&apos;s no page at this address.</h1>
        <p className="mt-5 max-w-[48ch] text-md text-text-2">The link may be mistyped, or the page moved. If you followed a link to a bot, it may have been deleted.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/dashboard">Go to your bots</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            TeleForge home
          </ButtonLink>
        </div>
      </main>
    </div>
  );
}
