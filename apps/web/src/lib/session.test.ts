import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSession,
  createDemoSession,
  getSession,
  saveSession,
} from "./session";
import type { Session } from "./session";

const SESSION_KEY = "habitflow.session";

describe("session", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when no session exists", () => {
    expect(getSession()).toBeNull();
  });

  it("round-trips a saved session", () => {
    const session: Session = {
      user: {
        id: "u1",
        email: "a@b.c",
        displayName: "A",
        avatarUrl: null,
        locale: "en",
        timezone: "UTC",
        plan: "FREE",
        status: "ACTIVE",
      },
      tokens: { accessToken: "at", refreshToken: "rt", expiresIn: 900 },
    };

    saveSession(session);

    expect(getSession()).toEqual(session);
  });

  it("clearSession removes the stored session", () => {
    const session: Session = {
      user: {
        id: "u1",
        email: "a@b.c",
        displayName: "A",
        avatarUrl: null,
        locale: "en",
        timezone: "UTC",
        plan: "FREE",
        status: "ACTIVE",
      },
      tokens: { accessToken: "at", refreshToken: "rt", expiresIn: 900 },
    };
    saveSession(session);

    clearSession();

    expect(getSession()).toBeNull();
  });

  it("returns null for corrupted stored data", () => {
    window.localStorage.setItem(SESSION_KEY, "{not-json");

    expect(getSession()).toBeNull();
  });

  it("createDemoSession derives the display name from email when missing", () => {
    const session = createDemoSession("Sara@Example.com");

    expect(session.demo).toBe(true);
    expect(session.user.email).toBe("sara@example.com");
    expect(session.user.displayName).toBe("Sara");
    expect(session.user.plan).toBe("FREE");
    expect(session.user.status).toBe("ACTIVE");
    expect(session.user.id.startsWith("demo-")).toBe(true);
  });

  it("createDemoSession honours an explicit display name", () => {
    const session = createDemoSession("sara@example.com", "Sara Hassan");

    expect(session.user.displayName).toBe("Sara Hassan");
  });

  it("createDemoSession issues demo access and refresh tokens", () => {
    const session = createDemoSession("sara@example.com");

    expect(session.tokens.accessToken.startsWith("demo-access.")).toBe(true);
    expect(session.tokens.refreshToken.startsWith("demo-refresh.")).toBe(true);
    expect(session.tokens.expiresIn).toBe(900);
  });
});
