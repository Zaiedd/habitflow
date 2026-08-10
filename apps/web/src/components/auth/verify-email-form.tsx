"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resendVerification,
  verifyEmail as apiVerifyEmail,
} from "@/lib/api";
import { localizePath } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/locale-context";

type State = "checking" | "verified" | "error" | "demo" | "resend-sent";

export function VerifyEmailForm() {
  const { locale, dict } = useLocale();
  const t = dict.auth.verifyEmail;
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<State>(token ? "checking" : "error");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void apiVerifyEmail(token).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setState("verified");
      } else if (
        result.kind === "network" ||
        (result.kind === "http" && result.status >= 500)
      ) {
        setState("demo");
      } else {
        setState("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const onResend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) return;
    await resendVerification(value, locale);
    setState("resend-sent");
  };

  const backToLogin = (
    <p className="mt-8 text-center text-sm text-muted-foreground">
      <Link
        href={localizePath(locale, "/login")}
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        {t.backToLogin}
      </Link>
    </p>
  );

  return (
    <div className="animate-slide-up">
      {state === "checking" ? (
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{t.verifying}</p>
        </div>
      ) : null}

      {state === "verified" ? (
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
      ) : null}

      {state === "error" ? (
        <div className="flex items-start gap-3">
          <AlertCircle
            className="mt-1 h-6 w-6 shrink-0 text-danger"
            aria-hidden="true"
          />
          <div>
            <h1 className="font-display text-[26px] font-semibold tracking-tight text-foreground">
              {t.errorTitle}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t.errorBody}</p>
          </div>
        </div>
      ) : null}

      {state === "demo" ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-lg border border-info/30 bg-info-soft p-3 text-sm text-info"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{t.demoNotice}</p>
        </div>
      ) : null}

      {state === "resend-sent" ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success-soft p-3 text-sm text-success"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{t.resendSent}</p>
        </div>
      ) : null}

      {state === "error" || state === "demo" ? (
        <form onSubmit={onResend} className="mt-8 space-y-5" noValidate>
          <div>
            <Label htmlFor="resend-email">{dict.auth.login.email}</Label>
            <div className="relative mt-1.5">
              <Mail
                className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="resend-email"
                type="email"
                placeholder={dict.auth.login.emailPlaceholder}
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ps-10"
              />
            </div>
          </div>
          <Button type="submit" size="lg" className="h-11 w-full">
            {t.resend}
          </Button>
        </form>
      ) : null}

      {state === "verified" || state === "error" ? backToLogin : null}
    </div>
  );
}
