"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useAnimatedTheme } from "@/lib/use-animated-theme";
import { Desktop, Moon, Sun } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/misc";
import { SettingsCard } from "@/components/ui/settings-card";
import { API_URL, api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useDashboardStats, useHealth } from "@/lib/hooks";
import { cn, formatNumber } from "@/lib/utils";

const subscribe = () => () => {};

function HealthRow({ label, ok, value }: { label: string; ok: boolean | null; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-sm text-text-2">{label}</dt>
      <dd className={cn("inline-flex items-center gap-2 text-sm", ok === false ? "text-danger-text" : "text-text")}>
        <span aria-hidden className={cn("size-2 rounded-full", ok === null ? "bg-text-3" : ok ? "bg-ok" : "bg-danger")} />
        {value}
      </dd>
    </div>
  );
}

function ThemeChoice() {
  const { theme, setTheme } = useAnimatedTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const current = mounted ? theme ?? "system" : null;
  const options = [
    { value: "system", label: "System", icon: <Desktop size={18} /> },
    { value: "light", label: "Light", icon: <Sun size={18} /> },
    { value: "dark", label: "Dark", icon: <Moon size={18} /> },
  ];
  return (
    <fieldset>
      <legend className="sr-only">Theme</legend>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex cursor-pointer flex-col items-start gap-3 rounded-md bg-surface px-3.5 py-3 text-sm text-text shadow-1 transition-[box-shadow,background-color] duration-150 hover:shadow-2",
              "has-[:checked]:bg-accent-tint has-[:checked]:shadow-none has-[:checked]:ring-2 has-[:checked]:ring-accent",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
            )}
          >
            <input type="radio" name="theme" value={o.value} checked={current === o.value} onChange={() => setTheme(o.value)} className="sr-only" />
            <span className="text-text-2">{o.icon}</span>
            <span className="font-medium">{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function SettingsPage() {
  const { user, setUser, signOut } = useAuth();
  const { data: stats } = useDashboardStats();
  const { data: health, mutate: refreshHealth, isValidating: checking } = useHealth();

  const [name, setName] = useState(user?.name ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);

  const hasPassword = user?.hasPassword !== false;
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwErrors, setPwErrors] = useState<{ current?: string; next?: string; confirm?: string; form?: string }>({});
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    document.title = "Settings | TeleForge";
  }, []);

  if (!user) return null;
  const method = user.googleId && user.hasPassword ? "Google and a password" : user.googleId ? "Google" : "your email and password";

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setNameError(null);
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 50) return setNameError("Use between 2 and 50 characters.");
    setSavingName(true);
    try {
      const updated = await api.users.updateMe({ name: trimmed });
      setUser(updated);
      toast.success("Name saved");
    } catch (err) {
      setNameError(err instanceof ApiError ? err.display : "Couldn't save your name. Check your connection and try again.");
    } finally {
      setSavingName(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof pwErrors = {};
    if (hasPassword && !currentPw) next.current = "Enter your current password.";
    if (newPw.length < 8) next.next = "Use at least 8 characters.";
    else if (newPw !== confirmPw) next.confirm = "This doesn't match the new password.";
    setPwErrors(next);
    if (Object.keys(next).length) return;
    setSavingPw(true);
    try {
      await api.users.changePassword({ currentPassword: hasPassword ? currentPw : undefined, newPassword: newPw });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      if (!hasPassword) setUser({ ...user!, hasPassword: true });
      toast.success(hasPassword ? "Password changed" : "Password set. You can now sign in with your email too.");
    } catch (err) {
      const msg = err instanceof ApiError ? err.display : "Couldn't change the password. Check your connection and try again.";
      setPwErrors(/current/i.test(msg) ? { current: msg } : { form: msg });
    } finally {
      setSavingPw(false);
    }
  }

  const apiUp = health?.success === true;

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description={`Signed in as ${user.email} with ${method}.`} />

      <div className="space-y-6">
        <SettingsCard
          as="form"
          onSubmit={saveName}
          noValidate
          title="Your name"
          description="Shown in the account menu."
          note="Your email can't be changed."
          action={
            <Button type="submit" size="sm" loading={savingName}>
              Save name
            </Button>
          }
        >
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} autoComplete="name" error={nameError} />
        </SettingsCard>

        <SettingsCard
          as="form"
          onSubmit={savePassword}
          noValidate
          title={hasPassword ? "Password" : "Add a password"}
          description={hasPassword ? "Changing it doesn't sign you out on other devices." : "You signed up with Google. Add a password to also sign in with your email."}
          note="Use at least 8 characters."
          action={
            <Button type="submit" size="sm" loading={savingPw}>
              {hasPassword ? "Change password" : "Set password"}
            </Button>
          }
        >
          <div className="space-y-4">
            {hasPassword && (
              <Input label="Current password" type="password" autoComplete="current-password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} error={pwErrors.current} />
            )}
            <Input label="New password" type="password" autoComplete="new-password" value={newPw} onChange={(e) => setNewPw(e.target.value)} error={pwErrors.next} />
            <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} error={pwErrors.confirm} />
            {pwErrors.form && (
              <p role="alert" className="text-sm text-danger-text">
                {pwErrors.form}
              </p>
            )}
          </div>
        </SettingsCard>

        <SettingsCard title="Appearance" description="System follows your device's light or dark setting.">
          <ThemeChoice />
        </SettingsCard>

        <SettingsCard title="Usage" description="Each account can run up to 10 bots on Gemini's free tier. Activity is kept for 30 days.">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-line ring-1 ring-line">
            <div className="bg-surface px-4 py-3">
              <dt className="text-label text-text-2">Bots</dt>
              <dd className="mt-1 text-xl font-medium text-text">
                {stats ? stats.totalBots : "–"}
                <span className="text-sm font-normal text-text-2"> of 10</span>
              </dd>
            </div>
            <div className="bg-surface px-4 py-3">
              <dt className="text-label text-text-2">Messages, 30 days</dt>
              <dd className="mt-1 text-xl font-medium text-text">{stats ? formatNumber(stats.messages30d) : "–"}</dd>
            </div>
          </dl>
        </SettingsCard>

        <SettingsCard
          title="Server connection"
          description="The TeleForge API this app talks to, and whether everything it needs is set up."
          note={<span className="font-mono">{API_URL}</span>}
          action={
            <Button variant="secondary" size="sm" onClick={() => refreshHealth()} loading={checking}>
              Check again
            </Button>
          }
        >
          <dl className="divide-y divide-line border-y border-line">
            <HealthRow label="API server" ok={health ? apiUp : null} value={health ? (apiUp ? "Online" : "Unreachable") : "Checking…"} />
            <HealthRow label="Database" ok={health ? health.mongo === "connected" : null} value={health?.mongo === "connected" ? "Connected" : health ? "Not connected" : "Checking…"} />
            <HealthRow label="Bots running on the server" ok={health ? apiUp : null} value={health?.runningBots !== undefined ? String(health.runningBots) : "–"} />
            <HealthRow label="Gemini API key" ok={health ? Boolean(health.geminiConfigured) : null} value={health ? (health.geminiConfigured ? "Configured" : "Missing") : "Checking…"} />
            <HealthRow label="Google sign-in" ok={health?.googleAuthConfigured ? true : null} value={health?.googleAuthConfigured ? "Configured" : "Off (optional)"} />
          </dl>
        </SettingsCard>

        <SettingsCard
          title="Log out"
          description="Signs you out in this browser. Your bots keep running on the server."
          action={
            <Button variant="danger-secondary" size="sm" onClick={() => signOut()}>
              Log out
            </Button>
          }
        />
      </div>
    </div>
  );
}
