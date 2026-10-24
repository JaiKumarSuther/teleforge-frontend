"use client";

import { SWRConfig } from "swr";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { IconContext } from "@phosphor-icons/react";
import { AuthProvider } from "@/lib/auth";
import { ApiError } from "@/lib/api";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-right"
      gap={8}
      toastOptions={{
        classNames: {
          toast:
            "!bg-surface !text-text !border-transparent !shadow-pop !rounded-lg !font-sans !text-sm !gap-2.5 !px-4 !py-3",
          description: "!text-text-2",
          error: "[&_[data-icon]]:!text-danger",
          success: "[&_[data-icon]]:!text-ok",
        },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const tree = (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <IconContext.Provider value={{ size: 16, weight: "regular" }}>
        <SWRConfig
          value={{
            revalidateOnFocus: true,
            shouldRetryOnError: (err) => !(err instanceof ApiError && [401, 403, 404].includes(err.status)),
            errorRetryCount: 2,
          }}
        >
          <AuthProvider>{children}</AuthProvider>
          <ThemedToaster />
        </SWRConfig>
      </IconContext.Provider>
    </ThemeProvider>
  );

  return GOOGLE_CLIENT_ID ? <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{tree}</GoogleOAuthProvider> : tree;
}

export const googleEnabled = Boolean(GOOGLE_CLIENT_ID);
