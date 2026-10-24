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

/** Mark + wordmark. The wordmark uses Mona Sans at its widest setting. */
export function Lockup({ href = "/", className, size = 28, label = true }: { href?: string; className?: string; size?: number; label?: boolean }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 rounded-md", className)} aria-label="TeleForge home">
      <Mark size={size} priority />
      {label && (
        <span className="type-wordmark text-lg text-text">
          TeleForge
        </span>
      )}
    </Link>
  );
}
