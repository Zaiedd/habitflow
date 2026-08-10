import { describe, expect, it } from "vitest";
import {
  defaultLocale,
  isLocale,
  localeLabels,
  locales,
  localizePath,
} from "./config";

describe("i18n config", () => {
  it("exposes supported locales with English as default", () => {
    expect(locales).toEqual(["en", "ar"]);
    expect(defaultLocale).toBe("en");
    expect(localeLabels.en).toBe("English");
    expect(localeLabels.ar).toBe("العربية");
  });

  it("isLocale validates locale values", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
  });

  it("localizePath prefixes non-root paths with the locale", () => {
    expect(localizePath("en", "/today")).toBe("/en/today");
    expect(localizePath("ar", "/today")).toBe("/ar/today");
    expect(localizePath("ar", "/register")).toBe("/ar/register");
  });

  it("localizePath leaves root path unchanged", () => {
    expect(localizePath("en", "/")).toBe("/en/");
  });

  it("localizePath returns external URLs untouched", () => {
    expect(localizePath("en", "https://example.com")).toBe(
      "https://example.com",
    );
  });
});
