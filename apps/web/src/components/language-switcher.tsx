"use client";

import { usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { locales, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, dict } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const segments = pathname.split("/").filter(Boolean);
  const currentIndex = segments.indexOf(locale);

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    const nextSegments =
      currentIndex >= 0
        ? segments.map((seg, i) => (i === currentIndex ? next : seg))
        : [next, ...segments];
    router.push(`/${nextSegments.join("/")}`);
  };

  const other = locales.find((l) => l !== locale)!;

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={dict.locale.switchTo}
        title={dict.locale.switchTo}
        onClick={() => switchTo(other)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Languages className="h-[18px] w-[18px]" aria-hidden="true" />
        <span className="hidden sm:inline">
          {other === "ar" ? "العربية" : "English"}
        </span>
      </button>
    </div>
  );
}
