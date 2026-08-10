"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword as apiForgotPassword } from "@/lib/api";
import { localizePath } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/locale-context";

type FormState = "idle" | "loading" | "error" | "success" | "demo";

export function ForgotPasswordForm() {
  const { locale, dict } = useLocale();
  const t = dict.auth.forgotPassword;
  const [formState, setFormState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(
      new FormData(event.currentTarget).get("email") ?? "",
    ).trim();
    if (!email) return;

    setError(null);
    setFormState("loading");

    const result = await apiForgotPassword(email, locale);
    if (result.ok) {
      setFormState("success");
      return;
    }

    if (
      result.kind === "network" ||
      (result.kind === "http" && result.status >= 500)
    ) {
      setFormState("demo");
      return;
    }

    setFormState("error");
    setError(dict.auth.unexpectedError);
  };

  if (formState === "success") {
    return (
      <div className="animate-slide-up">
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-1 h-6 w-6 shrink-0 text-success"
            aria-hidden="true"
          />
          <div>
            <h1 className="font-display text-[26px] font-semibold tracking-tight text-foreground">
              {t.sentTitle}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t.sentBody}</p>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link
            href={localizePath(locale, "/login")}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t.backToLogin}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-foreground">
          {t.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <div>
          <Label htmlFor="email">{t.email}</Label>
          <div className="relative mt-1.5">
            <Mail
              className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t.emailPlaceholder}
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={formState === "error"}
              className="ps-10"
            />
          </div>
        </div>

        {formState === "error" && error ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger-soft p-3 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : null}

        {formState === "demo" ? (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-lg border border-info/30 bg-info-soft p-3 text-sm text-info"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{t.demoNotice}</p>
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full"
          disabled={formState === "loading"}
        >
          {formState === "loading" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            t.submit
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link
          href={localizePath(locale, "/login")}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t.backToLogin}
        </Link>
      </p>
    </div>
  );
}
