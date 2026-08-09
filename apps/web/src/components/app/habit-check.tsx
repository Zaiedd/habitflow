"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";

export function HabitCheck({
  defaultChecked = false,
  label,
}: {
  defaultChecked?: boolean;
  label: string;
}) {
  const { dict } = useLocale();
  const [checked, setChecked] = useState(defaultChecked);

  const markDone = dict.app.today.markDone.replace("{label}", label);
  const markNotDone = dict.app.today.markNotDone.replace("{label}", label);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? markNotDone : markDone}
      onClick={() => setChecked((v) => !v)}
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-90",
        checked
          ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_rgba(79,70,229,0.15)]"
          : "border-subtle bg-muted hover:border-primary/50",
      )}
    >
      <Check
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          checked ? "scale-100" : "scale-0",
        )}
        aria-hidden="true"
      />
    </button>
  );
}
