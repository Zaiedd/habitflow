import type { Metadata } from "next";
import Link from "next/link";
import { locale as localeParam } from "next/root-params";
import {
  ArrowRight,
  BookOpen,
  Droplets,
  Flame,
  HeartPulse,
  Moon,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { HabitCheck } from "@/components/app/habit-check";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const loc = await localeParam();
  const dict = getDictionary(loc);
  return { title: dict.meta.todayTitle };
}

export default async function TodayPage() {
  const loc = await localeParam();
  const dict = getDictionary(loc);
  const plannerHref = localizePath(loc, "/planner");

  const scores = [
    { label: dict.scoreLabels.habit, value: 88, icon: Target, cls: "text-primary", bar: "bg-primary" },
    { label: dict.scoreLabels.growth, value: 72, icon: TrendingUp, cls: "text-success", bar: "bg-success" },
    { label: dict.scoreLabels.focus, value: 64, icon: Zap, cls: "text-accent", bar: "bg-accent" },
    { label: dict.scoreLabels.lifestyle, value: 81, icon: HeartPulse, cls: "text-warning", bar: "bg-warning" },
  ];

  const habits = [
    {
      id: "h1",
      name: dict.app.today.habits[0].name,
      meta: dict.app.today.habits[0].meta,
      icon: Droplets,
      iconClass: "bg-info-soft text-info",
      streak: "12",
      progress: 75,
      done: true,
    },
    {
      id: "h2",
      name: dict.app.today.habits[1].name,
      meta: dict.app.today.habits[1].meta,
      icon: BookOpen,
      iconClass: "bg-primary-soft text-primary",
      progress: 0,
    },
    {
      id: "h3",
      name: dict.app.today.habits[2].name,
      meta: dict.app.today.habits[2].meta,
      icon: Moon,
      iconClass: "bg-accent-soft text-accent",
      streak: "5",
      progress: 100,
      done: true,
    },
  ];

  const tasks = dict.app.today.tasksList.map((task, index) => ({
    id: `t${index + 1}`,
    ...task,
    tone: index === 0 ? ("warning" as const) : ("default" as const),
  }));

  const quickLogItems = [
    { label: dict.app.today.quickLogItems[0], icon: Droplets, cls: "text-info bg-info-soft" },
    { label: dict.app.today.quickLogItems[1], icon: HeartPulse, cls: "text-primary bg-primary-soft" },
    { label: dict.app.today.quickLogItems[2], icon: Moon, cls: "text-accent bg-accent-soft" },
    { label: dict.app.today.quickLogItems[3], icon: Zap, cls: "text-warning bg-warning-soft" },
  ];

  const doneCount = habits.filter((h) => h.done).length;
  const dateLabel = new Intl.DateTimeFormat(loc, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title={dict.app.today.greeting}
        subtitle={dateLabel}
        actions={
          <>
            <Badge variant="primary">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {dict.app.today.aiPlanReady}
            </Badge>
            <Button size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {dict.app.today.newHabit}
            </Button>
          </>
        }
      />

      {/* Scores */}
      <section aria-label={dict.app.today.scoresAria} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {scores.map((score) => (
          <Link
            key={score.label}
            href={localizePath(loc, "/insights")}
            className="hover-lift rounded-xl border border-border bg-card p-4 shadow-soft"
          >
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <score.icon className={`h-3.5 w-3.5 ${score.cls}`} aria-hidden="true" />
              {score.label}
            </p>
            <p className="tabular-nums mt-1.5 font-display text-2xl font-semibold text-foreground">
              {score.value}
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${score.bar}`} style={{ width: `${score.value}%` }} />
            </div>
          </Link>
        ))}
      </section>

      {/* Morning briefing */}
      <section className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card">
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-b from-accent/15 to-transparent blur-2xl"
        />
        <div className="relative">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            {dict.app.today.briefing}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {dict.app.today.briefingText}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex h-8 items-center rounded-full bg-primary px-3.5 text-xs font-medium text-primary-foreground">
              {dict.app.today.acceptPlan}
            </span>
            <span className="inline-flex h-8 items-center rounded-full border border-border px-3.5 text-xs font-medium text-muted-foreground">
              {dict.app.today.adjust}
            </span>
          </div>
        </div>
      </section>

      {/* Habits */}
      <section aria-labelledby="habits-heading">
        <div className="mb-3 flex items-center justify-between">
          <h3 id="habits-heading" className="text-sm font-semibold text-foreground">
            {dict.app.today.habitsToday}
          </h3>
          <span className="text-xs text-muted-foreground">
            {doneCount} of {habits.length}
          </span>
        </div>
        <ul className="space-y-2.5">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 shadow-soft"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${habit.iconClass}`}>
                <habit.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {habit.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{habit.meta}</p>
                <div className="mt-1.5 h-1 max-w-40 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${habit.progress}%` }}
                  />
                </div>
              </div>
              {habit.streak ? (
                <span className="flex items-center gap-0.5 text-xs font-semibold text-warning">
                  <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                  {habit.streak}
                </span>
              ) : null}
              <HabitCheck
                defaultChecked={habit.done}
                label={habit.name}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Tasks */}
      <section aria-labelledby="tasks-heading">
        <div className="mb-3 flex items-center justify-between">
          <h3 id="tasks-heading" className="text-sm font-semibold text-foreground">
            {dict.app.today.tasks}
          </h3>
          <Link
            href={plannerHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {dict.app.today.openPlanner}
            <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
        <ul className="space-y-2.5">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-soft"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-subtle bg-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.time}</p>
              </div>
              <Badge variant={task.tone}>
                {task.priority}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      {/* Quick log */}
      <section aria-labelledby="quicklog-heading">
        <h3 id="quicklog-heading" className="mb-3 text-sm font-semibold text-foreground">
          {dict.app.today.quickLog}
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {quickLogItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:border-primary/40 hover:shadow-card active:scale-[0.97]"
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.cls}`}>
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
