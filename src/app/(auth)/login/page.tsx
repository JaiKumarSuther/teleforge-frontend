"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { GoogleSignIn } from "@/components/auth/google-button";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { nextPath, useRedirectIfAuthed } from "@/lib/use-redirect-if-authed";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  useRedirectIfAuthed();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Sign in | TeleForge";
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Enter your email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (next.email) return emailRef.current?.focus();
    if (next.password) return passwordRef.current?.focus();
    setLoading(true);
    try {
      const result = await api.auth.login({ email: email.trim(), password });
      await signIn(result);
      router.replace(nextPath());
    } catch (err) {
      setErrors({ form: err instanceof ApiError ? err.display : "Couldn't sign you in. Check your connection and try again." });
      passwordRef.current?.select();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="type-page text-text">Sign in to TeleForge</h1>
      <p className="mt-2 text-sm text-text-2">
        New here?{" "}
        <Link href="/signup" className="font-medium text-accent-text underline-offset-2 hover:underline">
          Create an account
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <Input
          ref={emailRef}
          label="Email"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoFocus
        />
        <Input
          ref={passwordRef}
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        {errors.form && (
          <p role="alert" className="rounded-md bg-danger-tint px-3.5 py-3 text-sm text-danger-text ring-1 ring-danger-line ring-inset">
            {errors.form}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <GoogleSignIn text="signin_with" onDone={() => router.replace(nextPath())} />
    </div>
  );
}
