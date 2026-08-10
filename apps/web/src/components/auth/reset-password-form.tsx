"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword as apiResetPassword } from "@/lib/api";
import { localizePath } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/locale-context";

type FormState = "idle" | "loading" | "error" | "success";

export function ResetPasswordForm() {
  const { locale, dict } = useLocale();
  const t = dict.auth.resetPassword;
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formState, setFormState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setFormState("error");
      setError(t.invalidToken);
      return;
    }

    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirmPassword") ?? "");
    if (password !== confirm) {
      setFormState("error");
      setError(t.mismatch);
      return;
    }

    setError(null);
    setFormState("loading");

    const result = await apiResetPassword(token, password);
    if (result.ok) {
      setFormState("success");
      return;
    }

    setFormState("error");
    if (result.kind === "http" && result.status === 401) {
      setError(t.invalidToken);
    } else if (result.kind === "http" && result.status === 400) {
      setError(dict.auth.unexpectedError);
    } else {
      setError(dict.auth.apiError);
    }
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
              {t.successTitle}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t.successBody}</p>
          </div>
        </div>
        <Link
          href={localizePath(locale, "/login")}
          className="mt-8 inline-flex h-11 w-full select-none items-center justify-center whitespace-nowrap rounded-lg bg-primary px-5 text-[15px] font-medium text-primary-foreground shadow-soft transition-all duration-150 hover:bg-primary-hover active:scale-[0.98]"
        >
          {t.backToLogin}
        </Link>
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
          <Label htmlFor="password">{t.password}</Label>
          <div className="relative mt-1.5">
            <Lock
              className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={t.passwordPlaceholder}
              autoComplete="new-password"
              minLength={8}
              required
              aria-required="true"
              aria-invalid={formState === "error"}
              className="ps-10 pe-11"
            />
            <button
              type="button"
              aria-label={showPassword ? dict.auth.hidePassword : dict.auth.showPassword}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder={t.confirmPlaceholder}
            autoComplete="new-password"
            minLength={8}
            required
            aria-required="true"
            aria-invalid={formState === "error"}
            className="mt-1.5"
          />
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
