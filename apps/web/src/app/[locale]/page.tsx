import Link from "next/link";
import { locale as localeParam } from "next/root-params";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  Droplets,
  Flame,
  HeartPulse,
  MessageSquare,
  Moon,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { SectionHeading } from "@/components/marketing/section-heading";
import { HeroPreview } from "@/components/marketing/hero-preview";
import { PricingSection } from "@/components/marketing/pricing-section";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/config";

const FEATURE_ICONS = [
  MessageSquare,
  Target,
  HeartPulse,
  BarChart3,
  Flame,
  ShieldCheck,
];

function FeatureCard({
  icon: Icon,
  title,
  description,
  iconClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="hover-lift group rounded-xl border border-border bg-card p-6 shadow-soft">
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-display text-base font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ShowcaseRow({
  index,
  kicker,
  title,
  description,
  visual,
}: {
  index: number;
  kicker: string;
  title: string;
  description: string;
  visual: React.ReactNode;
}) {
  const flipped = index % 2 === 1;
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div className={flipped ? "lg:order-2" : undefined}>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          {kicker}
        </p>
        <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className={flipped ? "lg:order-1" : undefined}>{visual}</div>
    </div>
  );
}

function BriefingVisual({ dict }: { dict: ReturnType<typeof getDictionary> }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {dict.briefVisual.title}
          </p>
          <p className="text-xs text-muted-foreground">{dict.briefVisual.time}</p>
        </div>
      </div>
      <p className="mt-4 rounded-lg bg-muted/60 p-4 text-sm leading-relaxed text-muted-foreground">
        {dict.briefVisual.text}
      </p>
      <div className="mt-4 flex gap-2">
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          {dict.briefVisual.accept}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          {dict.briefVisual.adjust}
        </span>
      </div>
    </div>
  );
}

function CheckinVisual({ dict }: { dict: ReturnType<typeof getDictionary> }) {
  const items = [
    {
      icon: Droplets,
      cls: "bg-info-soft text-info",
      name: dict.app.today.habits[0].name,
      meta: dict.app.today.habits[0].meta,
      done: true,
    },
    {
      icon: BookOpen,
      cls: "bg-primary-soft text-primary",
      name: dict.app.today.habits[1].name,
      meta: dict.app.today.habits[1].meta,
      done: false,
    },
    {
      icon: Moon,
      cls: "bg-accent-soft text-accent",
      name: dict.app.today.habits[2].name,
      meta: dict.app.today.habits[2].meta,
      done: true,
    },
  ];
  return (
    <div className="space-y-2.5 rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          {dict.checkinVisual.title}
        </p>
        <span className="flex items-center gap-1 text-xs font-semibold text-warning">
          <Flame className="h-3.5 w-3.5" aria-hidden="true" />
          {dict.checkinVisual.streak}
        </span>
      </div>
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-md ${item.cls}`}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.meta}</p>
          </div>
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border ${
              item.done
                ? "border-primary bg-primary text-primary-foreground"
                : "border-subtle bg-muted"
            }`}
          >
            {item.done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
          </span>
        </div>
      ))}
    </div>
  );
}

function ScoresVisual({ dict }: { dict: ReturnType<typeof getDictionary> }) {
  const scores = [
    { label: dict.scoreLabels.habit, value: 88, cls: "text-success", bar: "bg-success" },
    { label: dict.scoreLabels.growth, value: 72, cls: "text-primary", bar: "bg-primary" },
    { label: dict.scoreLabels.focus, value: 64, cls: "text-accent", bar: "bg-accent" },
    { label: dict.scoreLabels.lifestyle, value: 81, cls: "text-warning", bar: "bg-warning" },
  ];
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          {dict.scoresVisual.title}
        </p>
        <span className="flex items-center gap-1 text-xs font-medium text-success">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
          {dict.scoresVisual.delta}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-3">
        {scores.map((score) => (
          <div key={score.label}>
            <p className={`tabular-nums font-display text-2xl font-semibold ${score.cls}`}>
              {score.value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{score.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {scores.map((score) => (
          <div key={score.label}>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${score.bar}`}
                style={{ width: `${score.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-lg bg-primary-soft p-3 text-xs leading-relaxed text-primary">
        <span className="font-semibold">{dict.scoresVisual.coachLabel}:</span>{" "}
        {dict.scoresVisual.coach}
      </p>
    </div>
  );
}

export default async function LandingPage() {
  const loc = await localeParam();
  const dict = getDictionary(loc);
  const registerHref = localizePath(loc, "/register");
  const loginHref = localizePath(loc, "/login");

  const features = dict.featureItems.map((feature, index) => ({
    ...feature,
    icon: FEATURE_ICONS[index],
    iconClass:
      ["bg-accent-soft text-accent", "bg-primary-soft text-primary", "bg-success-soft text-success", "bg-info-soft text-info", "bg-warning-soft text-warning", "bg-muted text-foreground"][
        index
      ],
  }));

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/15 via-accent/8 to-transparent blur-3xl"
        />
        <div className="container-app relative pt-20 text-center sm:pt-28 lg:pt-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-soft">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
            {dict.hero.badge}
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {dict.hero.titleTrack}{" "}
            <span className="text-gradient">{dict.hero.titleGrow}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {dict.hero.subtitle}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={registerHref}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[15px] font-medium text-primary-foreground shadow-soft transition-all hover:bg-primary-hover active:scale-[0.98] sm:w-auto"
            >
              {dict.hero.ctaPrimary}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
            <Link
              href="#product"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-surface px-6 text-[15px] font-medium text-foreground shadow-soft transition-colors hover:bg-muted sm:w-auto"
            >
              {dict.hero.ctaSecondary}
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{dict.hero.note}</p>
        </div>
        <div className="container-app relative pb-20 pt-16 sm:pb-28">
          <HeroPreview />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 border-t border-border bg-muted/40 py-24 sm:py-32">
        <div className="container-app">
          <SectionHeading
            eyebrow={dict.features.eyebrow}
            title={dict.features.title}
            description={dict.features.description}
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Product showcase */}
      <section id="product" className="scroll-mt-24 py-24 sm:py-32">
        <div className="container-app space-y-24">
          <ShowcaseRow
            index={0}
            kicker={dict.showcase[0].kicker}
            title={dict.showcase[0].title}
            description={dict.showcase[0].description}
            visual={<BriefingVisual dict={dict} />}
          />
          <ShowcaseRow
            index={1}
            kicker={dict.showcase[1].kicker}
            title={dict.showcase[1].title}
            description={dict.showcase[1].description}
            visual={<CheckinVisual dict={dict} />}
          />
          <ShowcaseRow
            index={2}
            kicker={dict.showcase[2].kicker}
            title={dict.showcase[2].title}
            description={dict.showcase[2].description}
            visual={<ScoresVisual dict={dict} />}
          />
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="scroll-mt-24 border-t border-border bg-muted/40 py-24 sm:py-32">
        <div className="container-app">
          <SectionHeading
            eyebrow={dict.testimonials.eyebrow}
            title={dict.testimonials.title}
            description={dict.testimonials.description}
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {dict.testimonialItems.map((t) => (
              <figure
                key={t.name}
                className="hover-lift flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-soft"
              >
                <blockquote className="text-sm leading-relaxed text-foreground">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 border-t border-border bg-muted/40 py-24 sm:py-32">
        <div className="container-app">
          <SectionHeading
            eyebrow={dict.faq.eyebrow}
            title={dict.faq.title}
            description={dict.faq.description}
          />
          <div className="mx-auto mt-12 max-w-2xl space-y-3">
            {dict.faqItems.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-border bg-card px-5 shadow-soft"
              >
                <summary className="flex cursor-pointer select-none list-none items-center justify-between gap-4 py-4 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="text-muted-foreground transition-transform duration-200 group-open:rotate-45">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-card sm:px-12">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-0 h-64 w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-primary/20 to-transparent blur-3xl"
            />
            <div className="relative">
              <h2 className="mx-auto max-w-xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {dict.cta.title}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
                {dict.cta.subtitle}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={registerHref}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[15px] font-medium text-primary-foreground shadow-soft transition-all hover:bg-primary-hover active:scale-[0.98] sm:w-auto"
                >
                  {dict.cta.ctaPrimary}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
                <Link
                  href={loginHref}
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-surface px-6 text-[15px] font-medium text-foreground shadow-soft transition-colors hover:bg-muted sm:w-auto"
                >
                  {dict.cta.ctaSecondary}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
