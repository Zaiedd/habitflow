"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/ui/logo";
import { useLocale } from "@/lib/i18n/locale-context";
import { localizePath } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function AppTopbar() {
  const { locale, dict } = useLocale();
  const pathname = usePathname();
  const path = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  function pageTitle() {
    if (path.startsWith("/planner")) return dict.app.nav.planner;
    if (path.startsWith("/coach")) return dict.app.nav.coach;
    if (path.startsWith("/insights")) return dict.app.nav.insights;
    if (path.startsWith("/profile")) return dict.app.nav.profile;
    return dict.app.nav.today;
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Link
          href={localizePath(locale, "/")}
          aria-label={dict.app.topbar.home}
          className="lg:hidden"
        >
          <Logo />
        </Link>

        <div className="hidden items-center lg:flex">
          <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">
            {pageTitle()}
          </h1>
        </div>

        <div className="ms-auto flex items-center gap-1.5">
          <div className="relative hidden sm:block">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label={dict.app.topbar.search}
              placeholder={dict.app.topbar.search}
              className="h-9 w-52 rounded-lg border border-border bg-card ps-9 pe-3 text-sm text-foreground shadow-soft transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/25 lg:w-64"
            />
          </div>
          <button
            type="button"
            aria-label={dict.app.topbar.notifications}
            className={cn(
              "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            )}
          >
            <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </button>
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href={localizePath(locale, "/profile")}
            aria-label={dict.app.topbar.profile}
            className="ms-1 hidden rounded-full ring-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:block"
          >
            <Avatar name={dict.app.profile.name} />
          </Link>
        </div>
      </div>
    </header>
  );
}
