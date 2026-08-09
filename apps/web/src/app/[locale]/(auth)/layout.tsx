import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { locale as localeParam } from "next/root-params";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/config";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loc = await localeParam();
  const dict = getDictionary(loc);
  const homeHref = localizePath(loc, "/");
  const initials = dict.auth.quoteName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-e border-border bg-gradient-to-br from-card via-muted/40 to-background lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top_left,black_35%,transparent_75%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-b from-primary/20 to-transparent blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-gradient-to-t from-accent/15 to-transparent blur-3xl"
        />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative space-y-10">
          <blockquote className="max-w-md">
            <Sparkles className="h-7 w-7 text-accent" aria-hidden="true" />
            <p className="mt-5 font-display text-3xl font-medium leading-snug tracking-tight text-foreground">
              {dict.auth.quote}
            </p>
            <footer className="mt-7 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground ring-2 ring-primary/20">
                {initials}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {dict.auth.quoteName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dict.auth.quoteRole}
                </p>
              </div>
            </footer>
          </blockquote>

          <ul className="space-y-3">
            {dict.auth.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} HabitFlow, Inc.
        </p>
      </aside>

      {/* Form panel */}
      <div className="relative flex flex-col overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/10 to-transparent blur-3xl rtl:translate-x-1/2"
        />
        <div className="relative flex items-center justify-between p-6 lg:justify-end lg:pr-10">
          <Link href={homeHref} aria-label={dict.nav.home} className="lg:hidden">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <main className="relative flex flex-1 flex-col justify-center px-6 pb-16 sm:mx-auto sm:w-full sm:max-w-md lg:px-0 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
