import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** The TeleForge mark (paper plane with robot eyes). Keep it ≥ 24px so the eyes stay legible. */
export function Mark({ size = 32, className, priority }: { size?: number; className?: string; priority?: boolean }) {
  return (
    <Image src="/brand/mark.png" alt="" width={size} height={size} priority={priority} className={cn("shrink-0 select-none", className)} draggable={false} />
  );
}

/** Rounded-square app icon (white mark on Telegram blue). */
export function AppIcon({ size = 40, className, priority }: { size?: number; className?: string; priority?: boolean }) {
  return (
    <Image src="/brand/app-icon.png" alt="" width={size} height={size} priority={priority} className={cn("shrink-0 select-none", className)} draggable={false} />
  );
}

/** Mark + wordmark. `inverse` is for the dark rail. */
export function Lockup({
  href = "/",
  className,
  size = 28,
  label = true,
  inverse,
  ariaLabel = "TeleForge home",
}: {
  href?: string;
  className?: string;
  size?: number;
  label?: boolean;
  inverse?: boolean;
  ariaLabel?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 rounded-md", className)} aria-label={ariaLabel}>
      <Mark size={size} priority />
      {label && (
        <span className={cn("type-wordmark text-title", inverse ? "text-rail-ink" : "text-ink")}>TeleForge</span>
      )}
    </Link>
  );
}
