"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { api, ApiError, setUnauthorizedHandler, tokenStore } from "./api";
import type { AuthResult, User } from "./types";

type Status = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  status: Status;
  user: User | null;
  /** Store the token from login/register/google and load the full profile. */
  signIn: (result: AuthResult) => Promise<void>;
  signOut: (opts?: { silent?: boolean }) => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUserState] = useState<User | null>(null);
  const expiredNotified = useRef(false);

  const clearCache = useCallback(() => mutate(() => true, undefined, { revalidate: false }), [mutate]);

  const refreshUser = useCallback(async () => {
    const me = await api.auth.me();
    setUserState(me);
    setStatus("authenticated");
  }, []);

  // Bootstrap from a stored token
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenStore.get()) {
        setStatus("anonymous");
        return;
      }
      // Only a 401 means the session is dead. Network errors, 429s and 5xx are retried
      // a few times so a flaky connection doesn't log the user out.
      for (let attempt = 0; attempt < 3 && !cancelled; attempt++) {
        try {
          const me = await api.auth.me();
          if (!cancelled) {
            setUserState(me);
            setStatus("authenticated");
          }
          return;
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) break;
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        }
      }
      if (cancelled) return;
      tokenStore.clear();
      setStatus("anonymous");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Any 401 from the API ends the session
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!tokenStore.get()) return;
      tokenStore.clear();
      setUserState(null);
      setStatus("anonymous");
      clearCache();
      if (!expiredNotified.current) {
        expiredNotified.current = true;
        toast.error("Your session ended. Please log in again.");
        setTimeout(() => (expiredNotified.current = false), 3000);
      }
      router.replace("/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [router, clearCache]);

  const signIn = useCallback(
    async (result: AuthResult) => {
      tokenStore.set(result.token);
      clearCache();
      await refreshUser();
    },
    [refreshUser, clearCache],
  );

  const signOut = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      await api.auth.logout();
      tokenStore.clear();
      setUserState(null);
      setStatus("anonymous");
      clearCache();
      if (!silent) toast.success("Logged out.");
      router.replace("/login");
    },
    [router, clearCache],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signOut, refreshUser, setUser: setUserState }),
    [status, user, signIn, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
