import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

import { locales } from "./config";
import { getDictionary } from "./dictionaries";
import { ar } from "./ar";
import { en } from "./en";

function leafPaths(obj: unknown, prefix = ""): string[] {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
      leafPaths(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

describe("getDictionary", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the English dictionary for 'en'", () => {
    expect(getDictionary("en")).toBe(en);
  });

  it("returns the Arabic dictionary for 'ar'", () => {
    expect(getDictionary("ar")).toBe(ar);
  });

  it("throws notFound for unsupported locales", () => {
    expect(() => getDictionary("fr")).toThrow("NOT_FOUND");
  });

  it("exposes every supported locale", () => {
    for (const locale of locales) {
      expect(getDictionary(locale)).toBeDefined();
    }
  });

  it("keeps English and Arabic dictionaries structurally identical", () => {
    const enPaths = new Set(leafPaths(en));
    const arPaths = new Set(leafPaths(ar));

    const missingInAr = [...enPaths].filter((p) => !arPaths.has(p));
    const missingInEn = [...arPaths].filter((p) => !enPaths.has(p));

    expect(missingInAr, `Missing keys in ar: ${missingInAr.join(", ")}`).toEqual(
      [],
    );
    expect(missingInEn, `Missing keys in en: ${missingInEn.join(", ")}`).toEqual(
      [],
    );
  });
});
