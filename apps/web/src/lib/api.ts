export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; kind: "http"; status: number; code?: string }
  | { ok: false; kind: "network" }
  | { ok: false; kind: "demo" };

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  locale: string;
  timezone: string;
  plan: string;
  status: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface BillingSubscription {
  id: string;
  planCode: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAt: string | null;
}

export interface SubscriptionInfo {
  plan: string;
  subscription: BillingSubscription | null;
}

async function request<T>(
  path: string,
  init: RequestInit,
  token?: string,
): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (res.ok) {
    const data = (await res.json().catch(() => null)) as T | null;
    return { ok: true, data: data as T };
  }

  const body = (await res.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  const message = Array.isArray(body?.message)
    ? body!.message![0]
    : body?.message;
  return { ok: false, kind: "http", status: res.status, code: message };
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  displayName: string,
  email: string,
  password: string,
  locale: string,
) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ displayName, email, password, locale }),
  });
}

export function verifyEmail(token: string) {
  return request<{ verified: boolean }>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function resendVerification(email: string, locale: string) {
  return request<{ sent: boolean }>("/auth/verify-email/resend", {
    method: "POST",
    body: JSON.stringify({ email, locale }),
  });
}

export function forgotPassword(email: string, locale: string) {
  return request<{ sent: boolean }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email, locale }),
  });
}

export function resetPassword(token: string, password: string) {
  return request<{ ok: boolean }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export function getSubscription(token: string) {
  return request<SubscriptionInfo>("/billing/subscription", {
    method: "GET",
  }, token);
}

export function createCheckoutSession(
  token: string,
  plan: "pro" | "family",
  interval: "month" | "year",
  locale: string,
) {
  return request<{ url: string }>(
    "/billing/checkout",
    { method: "POST", body: JSON.stringify({ plan, interval, locale }) },
    token,
  );
}

export function createPortalSession(token: string) {
  return request<{ url: string }>(
    "/billing/portal",
    { method: "POST" },
    token,
  );
}
