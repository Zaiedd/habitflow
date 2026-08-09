"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { BillingToggle } from "@/components/marketing/billing-toggle";
import { useLocale } from "@/lib/i18n/locale-context";
import { localizePath } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const PRICES = [
  { monthly: 0, annual: 0 },
  { monthly: 8, annual: 6 },
  { monthly: 16, annual: 12 },
];

export function PricingSection() {
  const { locale, dict } = useLocale();
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  const plans = dict.planItems.map((plan, index) => ({
    ...plan,
    ...PRICES[index],
  }));

  return (
    <section id="pricing" className="scroll-mt-24 py-24 sm:py-32">
      <div className="container-app">
        <div className="flex flex-col items-center gap-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {dict.pricing.eyebrow}
          </p>
          <h2 className="max-w-2xl text-center font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {dict.pricing.title}
          </h2>
          <p className="max-w-xl text-center text-base text-muted-foreground sm:text-lg">
            {dict.pricing.subtitle}
          </p>
          <BillingToggle value={billing} onChange={setBilling} />
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const price = billing === "annual" ? plan.annual : plan.monthly;
            return (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-xl border p-7",
                  plan.featured
                    ? "border-primary/40 bg-primary-soft/40 shadow-pop"
                    : "border-border bg-card shadow-soft",
                )}
              >
                {plan.featured ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-soft">
                    {dict.pricing.mostPopular}
                  </span>
                ) : null}
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="tabular-nums font-display text-4xl font-semibold text-foreground">
                    ${price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {dict.pricing.perMonth}
                  </span>
                </div>
                {plan.monthly > 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {billing === "annual"
                      ? dict.pricing.billedAnnual.replace(
                          "{amount}",
                          `$${plan.annual * 12}`,
                        )
                      : dict.pricing.billedMonthly}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dict.pricing.freeForever}
                  </p>
                )}
                <Link
                  href={localizePath(locale, "/register")}
                  className={cn(
                    "mt-6 inline-flex h-11 items-center justify-center rounded-lg text-sm font-medium transition-all active:scale-[0.98]",
                    plan.featured
                      ? "bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover"
                      : "border border-border bg-surface text-foreground shadow-soft hover:bg-muted",
                  )}
                >
                  {plan.cta}
                </Link>
                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
