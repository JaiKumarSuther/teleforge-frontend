"use client";

import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

/** Primary action that knows whether the visitor is signed in. */
export function CreateBotButton({ size = "lg", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const { status } = useAuth();
  return (
    <ButtonLink href={status === "authenticated" ? "/bots/new" : "/signup"} size={size} className={className}>
      Create a bot
    </ButtonLink>
  );
}

export function SignInLink({ className }: { className?: string }) {
  const { status } = useAuth();
  const authed = status === "authenticated";
  return (
    <ButtonLink href={authed ? "/dashboard" : "/login"} variant="ghost" size="sm" className={className}>
      {authed ? "Your bots" : "Sign in"}
    </ButtonLink>
  );
}
