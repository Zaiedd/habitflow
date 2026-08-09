"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";

export function BillingToggle({
  value,
  onChange,
}: {
  value: "monthly" | "annual";
  onChange: (value: "monthly" | "annual") => void;
}) {
  const { dict } = useLocale();

  return (
    <div
      role="group"
      aria-label={dict.pricing.billingPeriod}
      className="inline-flex items-center rounded-lg border border-border bg-card p-1 shadow-soft"
    >
      {(["monthly", "annual"] as const).map((period) => (
        <button
          key={period}
          type="button"
          onClick={() => onChange(period)}
          aria-pressed={value === period}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            value === period
              ? "bg-muted text-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {period === "monthly" ? dict.pricing.monthly : dict.pricing.annual}
        </button>
      ))}
    </div>
  );
}
