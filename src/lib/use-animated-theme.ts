"use client";

import { flushSync } from "react-dom";
import { useTheme } from "next-themes";

// Where the user last pressed, so the new theme can grow out of the control they used.
let origin: { x: number; y: number } | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", (e) => (origin = { x: e.clientX, y: e.clientY }), { capture: true, passive: true });
  // Keyboard activation has no pointer position; forget the last click so we fall back to the focused control.
  window.addEventListener("keydown", () => (origin = null), { capture: true, passive: true });
}

function revealOrigin() {
  if (origin) return origin;
  const el = document.activeElement;
  if (el && el !== document.body) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return { x: window.innerWidth / 2, y: 0 };
}

/**
 * Drop-in for next-themes' useTheme whose setTheme plays a circular reveal: the new theme
 * expands from the pressed control until it covers the page (View Transitions API).
 * (The provider uses disableTransitionOnChange, so plain CSS transitions never run on a theme switch.)
 * Falls back to an instant switch where the API is missing or the user prefers reduced motion.
 */
export function useAnimatedTheme() {
  const { setTheme, ...rest } = useTheme();

  const setAnimatedTheme = (next: string) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof document.startViewTransition !== "function") return setTheme(next);

    const { x, y } = revealOrigin();
    // Radius that reaches the farthest corner from the origin
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    // The callback must have updated the DOM by the time it returns, hence flushSync.
    const transition = document.startViewTransition(() => flushSync(() => setTheme(next)));
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 750, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)", fill: "both" },
        );
        // The old theme recedes slightly under the expanding edge for depth
        document.documentElement.animate(
          { filter: ["brightness(1)", "brightness(0.82)"], transform: ["scale(1)", "scale(0.985)"] },
          { duration: 750, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-old(root)", fill: "both" },
        );
      })
      .catch(() => {});
  };

  return { ...rest, setTheme: setAnimatedTheme };
}
