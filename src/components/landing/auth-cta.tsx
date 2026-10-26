"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, SquaresFour } from "@phosphor-icons/react";
import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

/** Primary action on landing hero/closing that creates a bot or directs to signup. */
export function CreateBotButton({ size = "lg", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const { status } = useAuth();
  const authed = status === "authenticated";
  return (
    <ButtonLink href={authed ? "/bots/new" : "/signup"} size={size} className={className}>
      Create a bot
    </ButtonLink>
  );
}

/** Header action buttons: If user is logged in, show Dashboard button. Otherwise show Sign in and Create a bot. */
export function HeaderNavAuth() {
  const { status } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-16 animate-pulse rounded-md bg-bg-2" />
        <div className="h-9 w-24 animate-pulse rounded-md bg-bg-2" />
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-2">
        <ButtonLink href="/dashboard" size="sm" className="gap-1.5 font-medium shadow-xs">
          <SquaresFour size={16} weight="bold" />
          <span>Dashboard</span>
        </ButtonLink>
        <ButtonLink href="/bots/new" variant="secondary" size="sm" className="hidden sm:inline-flex gap-1 font-medium">
          <Plus size={14} weight="bold" />
          <span>New bot</span>
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ButtonLink href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex font-medium">
        Sign in
      </ButtonLink>
      <ButtonLink href="/signup" size="sm" className="hidden sm:inline-flex font-medium shadow-xs">
        Create a bot
      </ButtonLink>
    </div>
  );
}

/** Mobile menu auth buttons: shows Dashboard when logged in, or Sign in & Create a bot when anonymous. */
export function MobileMenuAuth({ onAction }: { onAction?: () => void }) {
  const { status } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    return <div className="h-10 w-full animate-pulse rounded-md bg-bg-2" />;
  }

  if (status === "authenticated") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <ButtonLink href="/dashboard" size="md" className="h-10 justify-center gap-1.5 font-medium shadow-xs" onClick={onAction}>
          <SquaresFour size={16} weight="bold" />
          <span>Dashboard</span>
        </ButtonLink>
        <ButtonLink href="/bots/new" variant="secondary" size="md" className="h-10 justify-center gap-1 font-medium" onClick={onAction}>
          <Plus size={14} weight="bold" />
          <span>New bot</span>
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <ButtonLink href="/login" variant="ghost" size="md" className="h-10 justify-center text-sm font-medium" onClick={onAction}>
        Sign in
      </ButtonLink>
      <ButtonLink href="/signup" size="md" className="h-10 justify-center font-medium shadow-xs" onClick={onAction}>
        Create a bot
      </ButtonLink>
    </div>
  );
}

/** Dynamic footer link that points to Dashboard when logged in, or Sign in when logged out. */
export function FooterAuthLink() {
  const { status } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const authed = mounted && status === "authenticated";
  return (
    <Link href={authed ? "/dashboard" : "/login"} className="text-text-2 transition hover:text-text">
      {authed ? "Dashboard" : "Sign in"}
    </Link>
  );
}

/** Legacy export: renders Dashboard button when authenticated, Sign in when not. */
export function SignInLink({ className }: { className?: string }) {
  const { status } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const authed = mounted && status === "authenticated";
  return (
    <ButtonLink href={authed ? "/dashboard" : "/login"} variant="ghost" size="sm" className={className}>
      {authed ? "Dashboard" : "Sign in"}
    </ButtonLink>
  );
}
