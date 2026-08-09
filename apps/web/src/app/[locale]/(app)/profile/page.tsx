import type { Metadata } from "next";
import { locale as localeParam } from "next/root-params";
import {
  Award,
  Bell,
  Bookmark,
  ChevronRight,
  Download,
  Flame,
  Lock,
  LogOut,
  Medal,
  Shield,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const loc = await localeParam();
  const dict = getDictionary(loc);
  return { title: dict.meta.profileTitle };
}

const BADGE_ICONS = [Flame, Trophy, Zap, Medal, Award];
const BADGE_CLASSES = [
  "bg-warning-soft text-warning",
  "bg-primary-soft text-primary",
  "bg-accent-soft text-accent",
  "bg-success-soft text-success",
  "bg-muted text-muted-foreground",
];

const SETTING_ICONS = [Bookmark, Bell, Shield, Download];
const SETTING_CLASSES = [
  "bg-primary-soft text-primary",
  "bg-warning-soft text-warning",
  "bg-info-soft text-info",
  "bg-muted text-muted-foreground",
];

export default async function ProfilePage() {
  const loc = await localeParam();
  const dict = getDictionary(loc);

  const badges = dict.app.profile.badgeItems.map((label, index) => ({
    label,
    icon: BADGE_ICONS[index],
    cls: BADGE_CLASSES[index],
    unlocked: index < 4,
  }));

  const settings = dict.app.profile.settingsItems.map((label, index) => ({
    label,
    icon: SETTING_ICONS[index],
    cls: SETTING_CLASSES[index],
  }));

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title={dict.app.nav.profile}
        subtitle={dict.app.profile.subtitle}
        actions={
          <Button size="sm" variant="secondary">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
            {dict.app.profile.goPro}
          </Button>
        }
      />

      {/* Identity */}
      <section aria-label={dict.app.nav.profile} className="flex items-center gap-4">
        <Avatar name={dict.app.profile.name} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display text-lg font-semibold text-foreground">
              {dict.app.profile.name}
            </p>
            <Badge variant="outline">{dict.app.profile.freePlan}</Badge>
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {dict.app.profile.email}
          </p>
        </div>
      </section>

      {/* Level */}
      <section aria-labelledby="level-heading" className="rounded-xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h3 id="level-heading" className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
              {dict.app.profile.level}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {dict.app.profile.nextLevel}
            </p>
          </div>
          <span className="tabular-nums text-sm font-semibold text-foreground">
            {dict.app.profile.xpCount}
          </span>
        </div>
        <Progress value={71} className="mt-3" />
        <p className="mt-2 text-xs text-muted-foreground">
          {dict.app.profile.xpHint}
        </p>
      </section>

      {/* Badges */}
      <section aria-labelledby="badges-heading">
        <h3 id="badges-heading" className="mb-3 text-sm font-semibold text-foreground">
          {dict.app.profile.badges}
        </h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className={`flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-soft ${
                badge.unlocked ? "" : "opacity-60"
              }`}
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-full ${badge.cls}`}>
                <badge.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-medium text-foreground">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Settings */}
      <section aria-labelledby="settings-heading" className="rounded-xl border border-border bg-card shadow-soft">
        <h3 id="settings-heading" className="border-b border-border px-5 py-4 text-sm font-semibold text-foreground">
          {dict.app.profile.settings}
        </h3>
        <ul className="divide-y divide-border">
          {settings.map((setting) => (
            <li key={setting.label}>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-5 py-3.5 text-start transition-colors hover:bg-muted/50"
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${setting.cls}`}>
                  <setting.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <span className="flex-1 text-sm font-medium text-foreground">{setting.label}</span>
                <ChevronRight className="h-4 w-4 rtl:rotate-180 text-muted-foreground" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Danger zone */}
      <section aria-label={dict.app.profile.signOut}>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/20 bg-danger-soft/40 py-3 text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
        >
          <LogOut className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {dict.app.profile.signOut}
        </button>
        <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" aria-hidden="true" />
          {dict.app.profile.dataNote}
        </p>
      </section>
    </div>
  );
}
