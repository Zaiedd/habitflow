import { afterEach, describe, expect, it, vi } from "vitest";
import { login, register, API_URL } from "./api";

function mockFetchResponse(
  body: unknown,
  status = 200,
  ok = status >= 200 && status < 300,
) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
        ...(ok ? {} : { statusText: "Error" }),
      }),
    );
}

describe("api client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("targets the configured API base URL", () => {
    expect(API_URL).toMatch(/\/api\/v1$/);
  });

  it("login returns user and tokens on success", async () => {
    const payload = {
      user: { id: "u1", email: "a@b.c" },
      tokens: { accessToken: "t", refreshToken: "r", expiresIn: 900 },
    };
    const fetchMock = mockFetchResponse(payload);

    const result = await login("a@b.c", "password123");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/login`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "a@b.c", password: "password123" }),
      }),
    );
    expect(result).toEqual({ ok: true, data: payload });
  });

  it("register posts displayName, email, password and locale", async () => {
    const fetchMock = mockFetchResponse({
      user: { id: "u1" },
      tokens: { accessToken: "t" },
    });

    await register("Sara", "sara@b.c", "password123", "ar");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/register`,
      expect.objectContaining({
        body: JSON.stringify({
          displayName: "Sara",
          email: "sara@b.c",
          password: "password123",
          locale: "ar",
        }),
      }),
    );
  });

  it("maps a 401 to an http error with its message", async () => {
    mockFetchResponse({ message: "INVALID_CREDENTIALS" }, 401);

    const result = await login("a@b.c", "wrong");

    expect(result).toEqual({
      ok: false,
      kind: "http",
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  });

  it("maps a 409 to an http error", async () => {
    mockFetchResponse({ message: "EMAIL_TAKEN" }, 409);

    const result = await register("Sara", "sara@b.c", "password123", "en");

    expect(result).toEqual({
      ok: false,
      kind: "http",
      status: 409,
      code: "EMAIL_TAKEN",
    });
  });

  it("maps an array error message to its first entry", async () => {
    mockFetchResponse({ message: ["EMAIL_TAKEN", "OTHER"] }, 409);

    const result = await login("a@b.c", "x");

    expect(result).toEqual({
      ok: false,
      kind: "http",
      status: 409,
      code: "EMAIL_TAKEN",
    });
  });

  it("maps a network failure to a network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    const result = await login("a@b.c", "x");

    expect(result).toEqual({ ok: false, kind: "network" });
  });

  it("handles a non-JSON success response gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("<html>oops</html>", { status: 200 }),
    );

    const result = await login("a@b.c", "x");

    expect(result.ok).toBe(true);
  });
});
