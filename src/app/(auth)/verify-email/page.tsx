"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRedirectIfAuthed } from "@/lib/use-redirect-if-authed";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, CODE_LENGTH);

function VerifyEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const { signIn } = useAuth();
  useRedirectIfAuthed();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  // The cooldown is tracked as a deadline so a throttled background tab still counts down correctly.
  const cooldownEnd = useRef(0);

  useEffect(() => {
    document.title = "Verify your email | TeleForge";
  }, []);

  useEffect(() => {
    cooldownEnd.current = Date.now() + RESEND_SECONDS * 1000;
    const tick = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.ceil((cooldownEnd.current - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  function startCooldown(seconds: number) {
    cooldownEnd.current = Date.now() + seconds * 1000;
    setSecondsLeft(seconds);
  }

  function focusCode(select = false) {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    if (select) el.select();
  }

  async function verify(value: string) {
    if (submitting.current) return;
    if (value.length < CODE_LENGTH) {
      setError(`Enter the ${CODE_LENGTH}-digit code from your email.`);
      focusCode();
      return;
    }
    submitting.current = true;
    setError(null);
    setLoading(true);
    try {
      const result = await api.auth.verifyEmail({ email, code: value });
      await signIn(result);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.display : "Couldn't verify your code. Check your connection and try again.");
      setLoading(false);
      submitting.current = false;
      // Wait a frame so the field is editable again before focusing it.
      requestAnimationFrame(() => focusCode(true));
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = digitsOnly(e.target.value);
    setCode(next);
    if (error) setError(null);
    if (next.length === CODE_LENGTH) void verify(next);
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    // Codes are often copied as "123 456" or "123-456"; strip separators before maxLength truncates them.
    e.preventDefault();
    const next = digitsOnly(e.clipboardData.getData("text"));
    if (!next) return;
    setCode(next);
    if (error) setError(null);
    if (next.length === CODE_LENGTH) void verify(next);
  }

  async function resend() {
    setResending(true);
    try {
      await api.auth.resendOtp({ email });
      startCooldown(RESEND_SECONDS);
      setCode("");
      setError(null);
      toast.success("New code sent");
      focusCode();
    } catch (err) {
      const message = err instanceof ApiError ? err.display : "Couldn't send a new code. Check your connection and try again.";
      toast.error(message);
      if (err instanceof ApiError && err.status === 429) {
        const wait = Number(/(\d+)\s*s/i.exec(err.message)?.[1]);
        startCooldown(wait > 0 ? wait : RESEND_SECONDS);
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <div>
      <h1 className="type-page text-text">Check your email</h1>
      <p className="mt-2 text-sm text-text-2">
        We sent a 6-digit code to <span className="font-medium break-all text-text">{email}</span>. It expires in 10 minutes.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void verify(code);
        }}
        className="mt-8 space-y-5"
        noValidate
      >
        <Input
          ref={inputRef}
          label="Verification code"
          name="code"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          spellCheck={false}
          placeholder="000000"
          value={code}
          onChange={onChange}
          onPaste={onPaste}
          readOnly={loading}
          error={error}
          hint="Enter the 6 digits. Pasting works too."
          className="h-14 pl-[0.5em] text-center font-mono text-2xl tracking-[0.5em] sm:text-2xl"
          autoFocus
        />
        {/* The field's message isn't a live region, so announce errors here. */}
        <p role="alert" aria-live="assertive" className="sr-only">
          {error}
        </p>

        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Verifying…" : "Verify email"}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-start gap-3">
        <Button variant="secondary" size="sm" onClick={resend} loading={resending} disabled={secondsLeft > 0 || loading}>
          {secondsLeft > 0 ? `Send a new code in ${secondsLeft}s` : "Send a new code"}
        </Button>
        <Link href="/signup" className="text-sm font-medium text-accent-text underline-offset-2 hover:underline">
          Wrong email? Sign up again
        </Link>
      </div>
    </div>
  );
}

function VerifyEmail() {
  const router = useRouter();
  const email = useSearchParams().get("email")?.trim() || "";

  useEffect(() => {
    if (!email) router.replace("/signup");
  }, [email, router]);

  if (!email) return null;
  return <VerifyEmailForm email={email} />;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail />
    </Suspense>
  );
}
