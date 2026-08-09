import type { Metadata } from "next";
import { locale as localeParam } from "next/root-params";
import {
  BookOpen,
  CalendarDays,
  Clock,
  Droplets,
  Moon,
  Plus,
  Target,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const loc = await localeParam();
  const dict = getDictionary(loc);
  return { title: dict.meta.plannerTitle };
}

const BLOCK_ICONS = [BookOpen, Target, Droplets, BookOpen, Moon];
const BLOCK_CLASSES = [
  "bg-primary-soft text-primary",
  "bg-accent-soft text-accent",
  "bg-info-soft text-info",
  "bg-success-soft text-success",
  "bg-warning-soft text-warning",
];

export default async function PlannerPage() {
  const loc = await localeParam();
  const dict = getDictionary(loc);

  const days = dict.app.planner.days.map((label, index) => ({
    label,
    day: 8 + index,
    active: index === 4,
  }));

  const blocks = dict.app.planner.blocks.map((block, index) => ({
    ...block,
    icon: BLOCK_ICONS[index],
    cls: BLOCK_CLASSES[index],
  }));

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title={dict.app.nav.planner}
        subtitle={dict.app.planner.date}
        actions={
          <>
            <div className="flex rounded-lg border border-border bg-card p-0.5 shadow-soft">
              <span className="inline-flex h-8 items-center rounded-md bg-muted px-3 text-xs font-medium text-foreground">
                {dict.app.planner.day}
              </span>
              <span className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-muted-foreground">
                {dict.app.planner.week}
              </span>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {dict.app.planner.addBlock}
            </Button>
          </>
        }
      />

      {/* Week strip */}
      <section aria-label={dict.app.planner.week}>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {days.map((day) => (
            <button
              key={day.label}
              type="button"
              aria-current={day.active ? "date" : undefined}
              className={cn(
                "flex min-w-14 flex-col items-center gap-1 rounded-xl border p-3 transition-colors",
                day.active
                  ? "border-primary/40 bg-primary-soft text-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              <span className="text-xs font-medium">{day.label}</span>
              <span
                className={cn(
                  "tabular-nums font-display text-lg font-semibold",
                  day.active && "text-primary",
                )}
              >
                {day.day}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section aria-labelledby="timeline-heading">
        <div className="mb-3 flex items-center justify-between">
          <h3 id="timeline-heading" className="text-sm font-semibold text-foreground">
            {dict.app.planner.timeline}
          </h3>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {dict.app.planner.blocksCount}
          </span>
        </div>
        <ol className="relative space-y-2.5 border-s border-border ps-5">
          {blocks.map((block) => (
            <li key={block.time} className="relative">
              <span
                aria-hidden="true"
                className="absolute -start-[27px] top-5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary"
              />
              <div className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 shadow-soft">
                <span className="hidden w-12 shrink-0 text-xs font-semibold tabular-nums text-muted-foreground sm:block">
                  {block.time}
                </span>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${block.cls}`}>
                  <block.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {block.title}
                  </p>
                  <p className="text-xs text-muted-foreground sm:hidden">
                    {block.time} · {block.duration}
                  </p>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {block.duration}
                </Badge>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-subtle bg-muted/40 py-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
      >
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        {dict.app.planner.addNewBlock}
      </button>
    </div>
  );
}
