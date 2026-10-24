// Shapes mirror the Express API exactly (see backend/docs/API_SPEC.md).

export type Role = "user" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  googleId?: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  hasPassword?: boolean;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export type BotStatus = "draft" | "active" | "stopped" | "error";

export interface BotListStats {
  messages30d: number;
  messagesToday: number;
  uniqueUsers30d: number;
  lastMessage: { text: string; at: string; from?: string | null } | null;
}

export interface Bot {
  _id: string;
  ownerId: string;
  name: string;
  telegramBotInfo: { id: number | null; username: string | null; firstName: string | null };
  personaPrompt: string;
  status: BotStatus;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
  stats?: BotListStats;
}

export interface BotStats {
  messagesToday: number;
  repliesToday: number;
  errorsToday: number;
  messages30d: number;
  activeUsers: number;
  uptimeMs: number;
  lastMessageAt: string | null;
  status: BotStatus;
}

export type ActivityType =
  | "message_in"
  | "message_out"
  | "error"
  | "started"
  | "stopped"
  | "config_updated";

export interface Activity {
  _id: string;
  botId: string;
  type: ActivityType;
  description: string;
  meta: {
    telegramChatId?: number;
    telegramUserId?: number;
    fromName?: string | null;
    text?: string;
    error?: string;
  };
  createdAt: string;
}

export interface DashboardStats {
  totalBots: number;
  activeBots: number;
  stoppedBots: number;
  messagesToday: number;
  messagesTrend: number[];
  activeBotsPercent: number;
  errorBots: number;
  draftBots: number;
  repliesToday: number;
  activeUsers24h: number;
  errorsToday: number;
  messages30d: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface Health {
  success: boolean;
  status: string;
  mongo?: string;
  runningBots?: number;
  geminiConfigured?: boolean;
  googleAuthConfigured?: boolean;
  message?: string;
  timestamp?: string;
}
