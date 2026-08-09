import {
  Bell,
  Check,
  Droplets,
  Flame,
  HeartPulse,
  MessageSquare,
  Moon,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { locale as localeParam } from "next/root-params";
import { getDictionary } from "@/lib/i18n/dictionaries";

function HabitRow({
  icon,
  iconClass,
  name,
  meta,
  checked,
  streak,
}: {
  icon: React.ReactNode;
  iconClass: string;
  name: string;
  meta: string;
  checked?: boolean;
  streak?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 shadow-soft">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${iconClass}`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground">{name}</p>
        <p className="text-[11px] text-muted-foreground">{meta}</p>
      </div>
      {streak ? (
        <span className="flex items-center gap-0.5 text-[11px] font-semibold text-warning">
          <Flame className="h-3 w-3" aria-hidden="true" />
          {streak}
        </span>
      ) : null}
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-subtle bg-muted"
        }`}
      >
        {checked ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      </span>
    </div>
  );
}

export async function HeroPreview() {
  const loc = await localeParam();
  const dict = getDictionary(loc);

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div
        aria-hidden="true"
        className="absolute -inset-x-8 -top-10 h-64 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent blur-2xl"
      />
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-pop">
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <div className="ml-3 hidden flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground sm:flex">
            <Search className="h-3 w-3" aria-hidden="true" />
            {dict.preview.searchUrl}
          </div>
          <span className="ml-auto flex items-center gap-2 text-muted-foreground">
            <Bell className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="h-5 w-5 rounded-full bg-primary-soft" />
          </span>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="hidden w-44 flex-col gap-1 border-e border-border bg-muted/30 p-3 md:flex">
            <div className="mb-2 flex items-center gap-2 px-2">
              <span className="h-5 w-5 rounded-md bg-gradient-to-br from-primary to-accent" />
              <span className="font-display text-[13px] font-semibold text-foreground">
                HabitFlow
              </span>
            </div>
            {[
              { icon: <Check className="h-3.5 w-3.5" />, label: dict.app.nav.today, active: true },
              { icon: <Target className="h-3.5 w-3.5" />, label: dict.app.nav.planner },
              { icon: <MessageSquare className="h-3.5 w-3.5" />, label: dict.app.nav.coach },
              { icon: <BarChart3 className="h-3.5 w-3.5" />, label: dict.app.nav.insights },
            ].map((item) => (
              <span
                key={item.label}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium ${
                  item.active
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </span>
            ))}
            <div className="mt-auto rounded-lg border border-border bg-card p-2.5 shadow-soft">
              <p className="text-[10px] text-muted-foreground">
                {dict.preview.level}
              </p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-accent" />
              </div>
              <p className="mt-1.5 text-[10px] font-medium text-foreground">
                {dict.preview.xp}
              </p>
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">
                  {dict.preview.date}
                </p>
                <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">
                  {dict.preview.greeting}
                </h3>
              </div>
              <span className="hidden items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary sm:flex">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {dict.preview.aiPlanReady}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: dict.scoreLabels.habit, value: "88", icon: <Check className="h-3 w-3 text-success" /> },
                { label: dict.scoreLabels.growth, value: "72", icon: <TrendingUp className="h-3 w-3 text-primary" /> },
                { label: dict.scoreLabels.focus, value: "64", icon: <Target className="h-3 w-3 text-accent" /> },
                { label: dict.scoreLabels.lifestyle, value: "81", icon: <HeartPulse className="h-3 w-3 text-warning" /> },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border bg-card p-2.5 shadow-soft"
                >
                  <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    {stat.icon}
                    {stat.label}
                  </p>
                  <p className="tabular-nums font-display text-lg font-semibold text-foreground">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-border bg-card p-3 shadow-soft">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                {dict.briefVisual.title}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                {dict.briefVisual.text}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <HabitRow
                icon={<Droplets className="h-4 w-4 text-info" />}
                iconClass="bg-info-soft"
                name={dict.app.today.habits[0].name}
                meta={dict.app.today.habits[0].meta}
                checked
                streak="12"
              />
              <HabitRow
                icon={<BookOpen className="h-4 w-4 text-primary" />}
                iconClass="bg-primary-soft"
                name={dict.app.today.habits[1].name}
                meta={dict.app.today.habits[1].meta}
              />
              <HabitRow
                icon={<Moon className="h-4 w-4 text-accent" />}
                iconClass="bg-accent-soft"
                name={dict.app.today.habits[2].name}
                meta={dict.app.today.habits[2].meta}
                checked
                streak="5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
