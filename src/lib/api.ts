import type {
  Activity,
  AuthResult,
  Bot,
  BotStats,
  BotStatus,
  DashboardStats,
  Health,
  Paginated,
  User,
} from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

const TOKEN_KEY = "teleforge.token";

/* ── Token storage (localStorage, guarded for SSR / private mode) ── */
export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable — session will not persist */
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

/* ── Errors ── */
export class ApiError extends Error {
  status: number;
  errors?: string[];
  /** Machine-readable code from the API, e.g. "EMAIL_NOT_VERIFIED". */
  code?: string;
  constructor(message: string, status: number, errors?: string[], code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
  /** The most specific message to show a user: first field error if present, else the message. */
  get display(): string {
    return this.errors?.length ? this.errors[0] : this.message;
  }
}

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;
/** AuthProvider registers this so any 401 anywhere logs the user out and redirects. */
export function setUnauthorizedHandler(fn: UnauthorizedHandler | null) {
  onUnauthorized = fn;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
}

/** The browser's IANA time zone, so "today" in stats means the viewer's today. */
function timeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

async function request<T>(path: string, { method = "GET", body, auth = true, signal }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
    const tz = timeZone();
    if (tz) headers["X-Timezone"] = tz;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError("Can't reach the TeleForge server. Check your connection and that the API is running.", 0);
  }

  let json: { success?: boolean; message?: string; data?: unknown; pagination?: unknown; errors?: string[]; code?: string } | null = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok || json?.success === false) {
    if (res.status === 401 && auth && onUnauthorized) onUnauthorized();
    throw new ApiError(json?.message || `Request failed (${res.status})`, res.status, json?.errors, json?.code);
  }

  return json as T;
}

type Envelope<T> = { success: true; message: string; data: T };
type PageEnvelope<T> = { success: true; data: T[]; pagination: Paginated<T>["pagination"] };

const unwrap = async <T,>(p: Promise<Envelope<T>>) => (await p).data;
const page = async <T,>(p: Promise<PageEnvelope<T>>): Promise<Paginated<T>> => {
  const r = await p;
  return { data: r.data, pagination: r.pagination };
};

const qs = (params: Record<string, string | number | undefined | null>) => {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") s.set(k, String(v));
  const str = s.toString();
  return str ? `?${str}` : "";
};

/* ── Endpoints ── */
export const api = {
  auth: {
    register: (body: { name: string; email: string; password: string }) =>
      unwrap(request<Envelope<{ pendingVerification: true; email: string }>>("/api/auth/register", { method: "POST", body, auth: false })),
    verifyEmail: (body: { email: string; code: string }) =>
      unwrap(request<Envelope<AuthResult>>("/api/auth/verify-email", { method: "POST", body, auth: false })),
    resendOtp: (body: { email: string }) => request<Envelope<null>>("/api/auth/resend-otp", { method: "POST", body, auth: false }),
    login: (body: { email: string; password: string }) =>
      unwrap(request<Envelope<AuthResult>>("/api/auth/login", { method: "POST", body, auth: false })),
    google: (idToken: string) =>
      unwrap(request<Envelope<AuthResult>>("/api/auth/google", { method: "POST", body: { idToken }, auth: false })),
    me: () => unwrap(request<Envelope<User>>("/api/auth/me")),
    logout: () => request<Envelope<null>>("/api/auth/logout", { method: "POST" }).catch(() => null),
  },
  users: {
    updateMe: (body: { name?: string; avatar?: string | null }) =>
      unwrap(request<Envelope<User>>("/api/users/me", { method: "PUT", body })),
    changePassword: (body: { currentPassword?: string; newPassword: string }) =>
      request<Envelope<null>>("/api/users/change-password", { method: "PUT", body }),
  },
  bots: {
    list: (params: { page?: number; limit?: number; status?: BotStatus | ""; q?: string } = {}) =>
      page(request<PageEnvelope<Bot>>(`/api/bots${qs(params)}`)),
    get: (id: string) => unwrap(request<Envelope<Bot>>(`/api/bots/${id}`)),
    create: (body: { name: string; personaPrompt: string; telegramToken: string }) =>
      unwrap(request<Envelope<Bot>>("/api/bots", { method: "POST", body })),
    update: (id: string, body: { name?: string; personaPrompt?: string }) =>
      unwrap(request<Envelope<Bot>>(`/api/bots/${id}`, { method: "PUT", body })),
    remove: (id: string) => request<Envelope<null>>(`/api/bots/${id}`, { method: "DELETE" }),
    start: (id: string) => unwrap(request<Envelope<{ status: BotStatus }>>(`/api/bots/${id}/start`, { method: "POST" })),
    stop: (id: string) => unwrap(request<Envelope<{ status: BotStatus }>>(`/api/bots/${id}/stop`, { method: "POST" })),
    stats: (id: string) => unwrap(request<Envelope<BotStats>>(`/api/bots/${id}/stats`)),
    activity: (id: string, params: { page?: number; limit?: number; types?: string } = {}) =>
      page(request<PageEnvelope<Activity>>(`/api/bots/${id}/activity${qs(params)}`)),
    preview: (body: { personaPrompt: string; message: string; history?: { role: "user" | "assistant"; content: string }[] }) =>
      unwrap(request<Envelope<{ reply: string }>>("/api/bots/preview", { method: "POST", body })),
  },
  dashboard: {
    stats: () => unwrap(request<Envelope<DashboardStats>>("/api/dashboard/stats")),
  },
  health: async (): Promise<Health> => {
    try {
      const res = await fetch(`${API_URL}/health`, { headers: { Accept: "application/json" } });
      return (await res.json()) as Health;
    } catch {
      return { success: false, status: "unreachable", message: "Can't reach the API server." };
    }
  },
};
