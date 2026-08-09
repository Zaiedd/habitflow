export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; kind: "http"; status: number; code?: string }
  | { ok: false; kind: "network" };

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

async function request<T>(
  path: string,
  init: RequestInit,
): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
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
