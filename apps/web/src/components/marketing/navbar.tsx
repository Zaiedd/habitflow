"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/i18n/locale-context";
import { localizePath } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { locale, dict } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: dict.nav.features },
    { href: "#product", label: dict.nav.product },
    { href: "#testimonials", label: dict.nav.testimonials },
    { href: "#pricing", label: dict.nav.pricing },
    { href: "#faq", label: dict.nav.faq },
  ];

  const homeHref = localizePath(locale, "/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => setOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-200",
        scrolled || open
          ? "border-b border-border bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label={dict.nav.product}
        className="container-app flex h-16 items-center justify-between"
      >
        <Link href={homeHref} aria-label={dict.nav.home} className="rounded-md">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href={localizePath(locale, "/login")}
            className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {dict.nav.signIn}
          </Link>
          <Link
            href={localizePath(locale, "/register")}
            className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover"
          >
            {dict.nav.getStarted}
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? dict.nav.closeMenu : dict.nav.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-border bg-background/95 backdrop-blur-md lg:hidden">
          <div className="container-app flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              <Link
                href={localizePath(locale, "/login")}
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-surface text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {dict.nav.signIn}
              </Link>
              <Link
                href={localizePath(locale, "/register")}
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover"
              >
                {dict.nav.getStartedFree}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
