"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login as apiLogin, register as apiRegister } from "@/lib/api";
import { createDemoSession, saveSession } from "@/lib/session";
import { localizePath } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";

type Field = {
  name: string;
  type: "text" | "email" | "password";
  label: string;
  placeholder: string;
  autoComplete?: string;
  minLength?: number;
};

type FormState = "idle" | "loading" | "error" | "success" | "demo";

const FIELD_ICONS = {
  displayName: User,
  email: Mail,
  password: Lock,
} as const;

const STRENGTH_COLORS = ["bg-danger", "bg-warning", "bg-success", "bg-accent"];

function passwordScore(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export function AuthForm({
  title,
  subtitle,
  submitLabel,
  fields,
  footer,
  mode,
  passwordHint,
}: {
  title: string;
  subtitle: string;
  submitLabel: string;
  fields: Field[];
  footer: React.ReactNode;
  mode: "login" | "register";
  passwordHint?: React.ReactNode;
}) {
  const { locale, dict } = useLocale();
  const auth = dict.auth;
  const router = useRouter();

  const [formState, setFormState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const score = passwordScore(password);
  const strengthIndex = score <= 1 ? 0 : score === 2 ? 1 : score === 3 ? 2 : 3;
  const strengthLabels = [
    auth.passwordStrength.weak,
    auth.passwordStrength.fair,
    auth.passwordStrength.good,
    auth.passwordStrength.strong,
  ];

  const enterApp = () => router.push(localizePath(locale, "/today"));

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const passwordValue = String(data.get("password") ?? "");
    const displayName = String(data.get("displayName") ?? "").trim();
    if (!email || !passwordValue) return;

    setError(null);
    setFormState("loading");

    const result =
      mode === "login"
        ? await apiLogin(email, passwordValue)
        : await apiRegister(displayName, email, passwordValue, locale);

    if (result.ok) {
      saveSession({ user: result.data.user, tokens: result.data.tokens });
      setFormState("success");
      window.setTimeout(enterApp, 700);
      return;
    }

    if (
      result.kind === "network" ||
      (result.kind === "http" && result.status >= 500)
    ) {
      saveSession(createDemoSession(email, displayName));
      setFormState("demo");
      window.setTimeout(enterApp, 900);
      return;
    }

    if (result.kind !== "http") return;

    setFormState("error");
    if (result.status === 401) setError(auth.invalidCredentials);
    else if (result.status === 409) setError(auth.emailTaken);
    else setError(auth.unexpectedError);
  };

  return (
    <div className="animate-slide-up">
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        {fields.map((field) => {
          const Icon =
            FIELD_ICONS[
              field.name as keyof typeof FIELD_ICONS
            ] as React.ComponentType<{ className?: string }> | undefined;
          const isPassword = field.type === "password";
          return (
            <div key={field.name}>
              <Label htmlFor={field.name}>{field.label}</Label>
              <div className="relative mt-1.5">
                {Icon ? (
                  <Icon
                    className={cn(
                      "pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2",
                      formState === "error"
                        ? "text-danger"
                        : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                ) : null}
                <Input
                  id={field.name}
                  name={field.name}
                  type={isPassword && showPassword ? "text" : field.type}
                  placeholder={field.placeholder}
                  autoComplete={
                    isPassword
                      ? mode === "login"
                        ? "current-password"
                        : "new-password"
                      : field.autoComplete
                  }
                  minLength={field.minLength}
                  required
                  aria-required="true"
                  aria-invalid={formState === "error"}
                  value={isPassword ? password : undefined}
                  onChange={
                    isPassword
                      ? (e) => setPassword(e.target.value)
                      : undefined
                  }
                  className={cn(
                    Icon && "ps-10",
                    isPassword && "pe-11",
                    formState === "error" &&
                      "border-danger/60 focus:border-danger/60 focus:ring-danger/25",
                  )}
                />
                {isPassword ? (
                  <button
                    type="button"
                    aria-label={showPassword ? auth.hidePassword : auth.showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                ) : null}
              </div>

              {mode === "register" && isPassword ? (
                <div className="mt-2">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    {[0, 1, 2, 3].map((bar) => (
                      <span
                        key={bar}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          password && bar <= score - 1
                            ? STRENGTH_COLORS[strengthIndex]
                            : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  {password ? (
                    <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                      {strengthLabels[strengthIndex]}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {isPassword && passwordHint ? (
                <div className="mt-2 text-end">{passwordHint}</div>
              ) : null}
            </div>
          );
        })}

        {formState === "error" && error ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger-soft p-3 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : null}

        {formState === "success" && mode === "register" ? (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-lg border border-info/30 bg-info-soft p-3 text-sm text-info"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{auth.register.verifyNotice}</p>
          </div>
        ) : null}

        {formState === "success" && mode === "login" ? (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success-soft p-3 text-sm text-success"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{auth.welcome}</p>
          </div>
        ) : null}

        {formState === "demo" ? (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-lg border border-info/30 bg-info-soft p-3 text-sm text-info"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{auth.demoNotice}</p>
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
            submitLabel
          )}
        </Button>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          {auth.agreeTerms}{" "}
          <Link href="#" className="font-medium underline-offset-4 hover:underline">
            {auth.terms}
          </Link>{" "}
          {auth.and}{" "}
          <Link href="#" className="font-medium underline-offset-4 hover:underline">
            {auth.privacy}
          </Link>
          .
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {footer}
      </p>
    </div>
  );
}
