import Image from "next/image";
import { cn } from "@/lib/utils";

import manifest from "./shots.json";

export type ShotName = keyof typeof manifest;
const SIZES: Record<ShotName, { w: number; h: number }> = manifest;

/**
 * A real capture of the running app (public/shots, 2x WebP), in both themes.
 * The light file shows in light mode, the dark file in dark mode. Sizes come from shots.json.
 */
export function Shot({
  name,
  alt,
  className,
  imgClassName,
  priority,
  sizes = "(min-width: 1024px) 60vw, 100vw",
}: {
  name: ShotName;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const { w, h } = SIZES[name];
  const common = { width: w, height: h, sizes, priority, quality: 90 } as const;
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image src={`/shots/${name}-light.webp`} alt={alt} {...common} className={cn("block h-auto w-full dark:hidden", imgClassName)} />
      <Image src={`/shots/${name}-dark.webp`} alt={alt} {...common} className={cn("hidden h-auto w-full dark:block", imgClassName)} />
    </div>
  );
}
