"use client";

import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { googleEnabled } from "@/components/providers";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!googleEnabled) return null;

  return (
    <div className="w-full">
      <div className="relative my-6 flex items-center justify-center">
        <span className="absolute inset-x-0 h-px bg-line" />
        <span className="relative bg-bg px-3 text-xs uppercase tracking-wider text-text-3 font-medium">
          Or continue with
        </span>
      </div>

      <div className="flex w-full items-center justify-center min-h-[44px]">
        {mounted ? (
          <div className="w-full flex justify-center [&>div]:w-full [&_iframe]:!w-full [&_iframe]:!rounded-lg transition-opacity hover:opacity-95">
            <GoogleLogin
              text={text}
              theme={resolvedTheme === "dark" ? "filled_black" : "outline"}
              shape="rectangular"
              size="large"
              width="384"
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
        ) : (
          <div className="flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-line bg-surface text-xs font-medium text-text-2 shadow-xs">
            <svg className="size-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{text === "signup_with" ? "Sign up with Google" : "Sign in with Google"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
