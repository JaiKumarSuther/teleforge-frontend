"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { GoogleSignIn } from "@/components/auth/google-button";
import { api, ApiError } from "@/lib/api";
import { useRedirectIfAuthed } from "@/lib/use-redirect-if-authed";
import { cn } from "@/lib/utils";

function passwordHint(pw: string): { text: string; tone: "plain" | "warn" | "ok" } {
  if (!pw) return { text: "At least 8 characters.", tone: "plain" };
  if (pw.length < 8) return { text: `${8 - pw.length} more ${8 - pw.length === 1 ? "character" : "characters"} to go.`, tone: "warn" };
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (pw.length >= 12 || variety >= 3) return { text: "Strong password.", tone: "ok" };
  return { text: "Long enough. Adding numbers or symbols makes it stronger.", tone: "plain" };
}

export default function SignupPage() {
  const router = useRouter();
  useRedirectIfAuthed();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const hint = passwordHint(password);

  useEffect(() => {
    document.title = "Create an account | TeleForge";
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Enter your name, at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter an email address like you@example.com.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    const first = (["name", "email", "password"] as const).find((k) => next[k]);
    if (first) {
      document.querySelector<HTMLInputElement>(`input[name="${first}"]`)?.focus();
      return;
    }

    setLoading(true);
    try {
      const result = await api.auth.register({ name: name.trim(), email: email.trim(), password });
      router.replace(`/verify-email?email=${encodeURIComponent(result.email)}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.display : "Couldn't create your account. Check your connection and try again.";
      setErrors(/email/i.test(msg) ? { email: msg } : { form: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="type-page text-text">Create your account</h1>
      <p className="mt-2 text-sm text-text-2">
        Already have one?{" "}
        <Link href="/login" className="font-medium text-accent-text underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <Input label="Name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoFocus />
        <Input
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
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint={<span className={cn(hint.tone === "warn" && "text-warn-text", hint.tone === "ok" && "text-ok-text")}>{hint.text}</span>}
        />

        {errors.form && (
          <p role="alert" className="rounded-md bg-danger-tint px-3.5 py-3 text-sm text-danger-text ring-1 ring-danger-line ring-inset">
            {errors.form}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-label text-text-2">Free to use. To make bots you&apos;ll also need a Telegram account.</p>
      </form>

      <GoogleSignIn text="signup_with" onDone={() => router.replace("/dashboard")} />
    </div>
  );
}
