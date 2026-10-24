"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { googleEnabled } from "@/components/providers";

/** Google's own button when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set; nothing otherwise. */
export function GoogleSignIn({ onDone, text = "continue_with" }: { onDone: () => void; text?: "signin_with" | "signup_with" | "continue_with" }) {
  const { signIn } = useAuth();
  const { resolvedTheme } = useTheme();
  if (!googleEnabled) return null;

  return (
    <>
      <div className="my-6 flex items-center gap-3 text-label text-text-2" role="separator" aria-label="or">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="[&>div]:w-full">
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
    </>
  );
}
