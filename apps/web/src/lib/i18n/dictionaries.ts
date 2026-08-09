import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import { en, type Dictionary } from "./en";
import { ar } from "./ar";

const dictionaries: Record<Locale, Dictionary> = {
  en,
  ar,
};

export function getDictionary(locale: string): Dictionary {
  if (!isLocale(locale)) notFound();
  return dictionaries[locale];
}

export type { Dictionary };
