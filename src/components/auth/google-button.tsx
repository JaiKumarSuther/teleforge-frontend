"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { googleEnabled } from "@/components/providers";
import { cn } from "@/lib/utils";

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={cn("size-[18px] shrink-0", className)} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
  );
}

const LABEL = { signin_with: "Sign in with Google", signup_with: "Sign up with Google", continue_with: "Continue with Google" } as const;

export function GoogleSignIn({
  onDone,
  text = "continue_with",
}: {
  onDone: () => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}) {
  const { signIn } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Google draws its button at an exact pixel width, so give it the column's width (200 to 400 is what it allows).
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(384);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setWidth(Math.max(200, Math.min(400, Math.floor(el.clientWidth))));
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mounted]);

  if (!googleEnabled) return null;
  const dark = resolvedTheme === "dark";

  return (
    <div className="w-full">
      <div className="relative my-6 flex items-center justify-center">
        <span className="absolute inset-x-0 h-px bg-line" />
        <span className="relative bg-paper px-3 text-label text-ink-2">
          Or continue with
        </span>
      </div>

      <div ref={box} className="flex w-full items-center justify-center min-h-[44px]">
        {mounted ? (
          // In dark mode Google's own button (a white tile on a dark fill) is laid invisibly over a face we draw,
          // so the icon sits on the page's dark surface. The real iframe still receives every click and key press.
          <div
            className={cn(
              "relative flex justify-center overflow-hidden rounded-md border border-line-strong focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
              dark && "h-10 bg-panel hover:bg-hover",
            )}
            style={dark ? { width } : undefined}
          >
            {dark && (
              <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 text-sm font-medium text-ink">
                <GoogleMark />
                {LABEL[text]}
              </span>
            )}
            <div className={dark ? "absolute inset-0 opacity-[0.01]" : undefined}>
            <GoogleLogin
              text={text}
              theme={dark ? "filled_black" : "outline"}
              shape="rectangular"
              size="large"
              width={String(width)}
              logo_alignment="center"
              onSuccess={async (res) => {
                if (!res.credential) {
                  toast.error("Google didn't send back a sign-in credential. Try again.");
                  return;
                }
                try {
                  const result = await api.auth.google(res.credential);
                  await signIn(result);
                  onDone();
                } catch (err) {
                  toast.error(err instanceof ApiError ? err.display : "Google sign-in failed. Try again, or use your email.");
                }
              }}
              onError={() => toast.error("Google sign-in was cancelled. Try again, or use your email.")}
            />
            </div>
          </div>
        ) : (
          <div className="flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-line-strong bg-panel text-sm font-medium text-ink">
            <GoogleMark />
            <span>{LABEL[text]}</span>
          </div>
        )}
      </div>
    </div>
  );
}
