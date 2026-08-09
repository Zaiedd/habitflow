import type { AuthTokens, AuthUser } from "./api";

export interface Session {
  user: AuthUser;
  tokens: AuthTokens;
  demo?: boolean;
}

const SESSION_KEY = "habitflow.session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function createDemoSession(
  email: string,
  displayName?: string,
): Session {
  const fallbackName = displayName?.trim() || email.split("@")[0] || "Guest";
  const nonce = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return {
    user: {
      id: `demo-${nonce}`,
      email: email.toLowerCase(),
      displayName: fallbackName,
      avatarUrl: null,
      locale: "en",
      timezone:
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : "UTC",
      plan: "FREE",
      status: "ACTIVE",
    },
    tokens: {
      accessToken: `demo-access.${nonce}`,
      refreshToken: `demo-refresh.${nonce}`,
      expiresIn: 900,
    },
    demo: true,
  };
}
