"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CircleUserRound,
  MessageSquare,
  Target,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { localizePath } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function AppBottomNav() {
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
    <nav
      aria-label={dict.app.nav.today}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex h-16 w-full max-w-md items-stretch px-2">
        {navItems.map((item) => {
          const active = path === item.href || path.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={localizePath(locale, item.href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                    active && "bg-primary-soft",
                  )}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
