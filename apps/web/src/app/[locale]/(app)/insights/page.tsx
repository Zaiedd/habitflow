import type { Metadata } from "next";
import { locale as localeParam } from "next/root-params";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Download,
  HeartPulse,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const loc = await localeParam();
  const dict = getDictionary(loc);
  return { title: dict.meta.insightsTitle };
}

const HEATMAP = [
  [1, 2, 3, 4, 0, 3, 2, 1, 2, 4, 3, 2],
  [2, 1, 0, 2, 3, 4, 2, 3, 1, 2, 4, 3],
  [3, 4, 2, 1, 2, 3, 4, 2, 3, 1, 2, 2],
  [2, 2, 3, 4, 2, 1, 3, 4, 2, 3, 1, 4],
  [1, 3, 4, 2, 3, 2, 1, 3, 4, 2, 3, 2],
  [4, 1, 2, 3, 4, 2, 3, 1, 2, 4, 3, 1],
  [2, 3, 1, 4, 2, 3, 4, 2, 1, 3, 2, 4],
];

function heatColor(value: number) {
  if (value === 0) return "bg-muted";
  if (value <= 1) return "bg-primary/30";
  if (value <= 2) return "bg-primary/55";
  if (value <= 3) return "bg-primary/80";
  return "bg-primary";
}

export default async function InsightsPage() {
  const loc = await localeParam();
  const dict = getDictionary(loc);

  const scores = [
    { label: dict.scoreLabels.habit, value: 88, delta: "+6", up: true, icon: Target, cls: "text-primary", bar: "bg-primary" },
    { label: dict.scoreLabels.growth, value: 72, delta: "+3", up: true, icon: TrendingUp, cls: "text-success", bar: "bg-success" },
    { label: dict.scoreLabels.focus, value: 64, delta: "-5", up: false, icon: Zap, cls: "text-accent", bar: "bg-accent" },
    { label: dict.scoreLabels.lifestyle, value: 81, delta: "+2", up: true, icon: HeartPulse, cls: "text-warning", bar: "bg-warning" },
  ];

  const weekBars = dict.app.insights.weekdays.map((day, index) => ({
    day,
    index,
    value: [55, 72, 64, 80, 88, 61, 74][index],
  }));

  const max = Math.max(...weekBars.map((b) => b.value));

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title={dict.app.nav.insights}
        subtitle={dict.app.insights.subtitle}
        actions={
          <>
            <div className="hidden rounded-lg border border-border bg-card p-0.5 shadow-soft sm:flex">
              <span className="inline-flex h-8 items-center rounded-md bg-muted px-3 text-xs font-medium text-foreground">
                {dict.app.insights.days7}
              </span>
              <span className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-muted-foreground">
                {dict.app.insights.days30}
              </span>
            </div>
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4" aria-hidden="true" />
              {dict.app.insights.exportCsv}
            </Button>
          </>
        }
      />

      {/* Scores */}
      <section aria-label={dict.app.today.scoresAria} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {scores.map((score) => (
          <div key={score.label} className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <score.icon className={`h-3.5 w-3.5 ${score.cls}`} aria-hidden="true" />
              {score.label}
            </p>
            <p className="tabular-nums mt-1.5 font-display text-3xl font-semibold text-foreground">
              {score.value}
            </p>
            <p
              className={`mt-1 flex items-center gap-0.5 text-xs font-medium ${
                score.up ? "text-success" : "text-danger"
              }`}
            >
              {score.up ? (
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              ) : (
                <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
              )}
              {score.delta} {dict.app.insights.vsLastWeek}
            </p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly chart */}
        <section aria-labelledby="weekly-heading" className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 id="weekly-heading" className="text-sm font-semibold text-foreground">
              {dict.app.insights.habitScore}
            </h3>
            <span className="flex items-center gap-1 text-xs font-medium text-success">
              <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
              {dict.app.insights.lastWeek}
            </span>
          </div>
          <div className="mt-6 flex h-44 items-end justify-between gap-2">
            {weekBars.map((bar) => (
              <div key={`${bar.index}-${bar.day}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div
                  className="w-full max-w-9 rounded-md bg-gradient-to-t from-primary/70 to-primary/40 transition-all"
                  style={{ height: `${(bar.value / max) * 100}%` }}
                />
                <span className="text-xs font-medium text-muted-foreground">{bar.day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* AI explanation */}
        <section aria-labelledby="ai-insight-heading" className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-soft">
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-b from-accent/15 to-transparent blur-2xl"
          />
          <div className="relative">
            <p id="ai-insight-heading" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              {dict.app.insights.coachTake}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {dict.app.insights.coachText}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {dict.app.insights.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Consistency heatmap */}
      <section aria-labelledby="heatmap-heading" className="rounded-xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 id="heatmap-heading" className="text-sm font-semibold text-foreground">
            {dict.app.insights.consistency}
          </h3>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {dict.app.insights.less}
            <span className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((v) => (
                <span key={v} className={`h-2.5 w-2.5 rounded-sm ${heatColor(v)}`} />
              ))}
            </span>
            {dict.app.insights.more}
          </span>
        </div>
        <div className="mt-5 grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2">
          {HEATMAP.flat().map((value, index) => (
            <span
              key={index}
              className={`h-3 w-3 rounded-[3px] ${heatColor(value)}`}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {dict.app.insights.streakText}
        </p>
      </section>
    </div>
  );
}
