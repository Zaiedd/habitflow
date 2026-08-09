"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CircleUserRound,
  MessageSquare,
  Sparkles,
  Target,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { useLocale } from "@/lib/i18n/locale-context";
import { localizePath } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { locale, dict } = useLocale();
  const pathname = usePathname();
  const path = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  const navItems = [
    { href: "/today", label: dict.app.nav.today, icon: Target },
    { href: "/planner", label: dict.app.nav.planner, icon: CalendarDays },
    { href: "/coach", label: dict.app.nav.coach, icon: MessageSquare },
    { href: "/insights", label: dict.app.nav.insights, icon: BarChart3 },
    { href: "/profile", label: dict.app.nav.profile, icon: CircleUserRound },
  ];

  return (
    <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-border bg-card lg:flex">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href={localizePath(locale, "/")} aria-label={dict.app.topbar.home}>
          <Logo />
        </Link>
      </div>

      <nav aria-label={dict.app.nav.today} className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const active = path === item.href || path.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={localizePath(locale, item.href)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px]",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                )}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-4 border-t border-border p-4">
        <div className="rounded-xl border border-primary/20 bg-primary-soft/60 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
            {dict.app.sidebar.level}
          </p>
          <Progress value={71} label={dict.app.sidebar.xpProgress} className="mt-3" />
          <p className="mt-2 text-xs text-muted-foreground">
            {dict.app.sidebar.xpCount}
          </p>
          <Link
            href={localizePath(locale, "/profile")}
            className="mt-3 inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover"
          >
            {dict.app.sidebar.viewProgress}
          </Link>
        </div>
        <div className="flex items-center gap-3 rounded-lg px-2 py-1">
          <Avatar name={dict.app.profile.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {dict.app.profile.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {dict.app.sidebar.freePlan}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
