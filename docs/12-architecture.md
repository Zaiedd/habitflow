# HabitFlow — Backend / Frontend / AI Architecture

## 1. System Overview

```
                         ┌─────────────────────────────────────────────┐
                         │                 Clients                     │
                         │  Web (Next.js PWA) · iOS/Android (PWA) ·    │
                         │  Admin console · Webhooks/API consumers     │
                         └───────────────┬─────────────────────────────┘
                                         │ HTTPS / WSS (SSE)
                         ┌───────────────▼─────────────────────────────┐
                         │          Edge: Cloudflare (CDN, DDoS,      │
                         │            WAF, HTTP/3, R2 static)         │
                         └───────────────┬─────────────────────────────┘
        ┌────────────────────────────────┼──────────────────────────────┐
        │               ┌───────────────▼──────────────┐                │
        │               │  Vercel (Frontend)           │                │
        │               │  Next.js App Router + SSR/ISR│                │
        │               │  Server Actions fallback →   │                │
        │               └───────────────┬──────────────┘                │
        │                               │ /api/v1 → BFF proxy          │
┌───────▼───────────────────────────────▼──────────────────────────────▼──────┐
│                          NestJS Backend (AWS EKS)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────────────────────┐  │
│  │ Auth     │ │ Habits/  │ │ Goals/Tasks/ │ │ Billing/Integrations/      │  │
│  │ Gateway  │ │ Goals    │ │ Planner      │ │ Community/Admin            │  │
│  └──────────┘ └──────────┘ └──────────────┘ └────────────────────────────┘  │
│  ┌────────────────────────┐  ┌─────────────────────────────────────────┐    │
│  │ Events pipeline        │  │ AI Orchestration (multi-agent)          │    │
│  │ (ingest → enrich →     │  │ planner/coach/analyst/burnout agents    │    │
│  │  persist → emit)       │  │ + tool calling + RAG (pgvector)         │    │
│  └───────────┬────────────┘  └──────────────┬──────────────────────────┘    │
└──────────────┼──────────────────────────────┼──────────────────────────────┘
               │                              │
      ┌────────▼────────┐  ┌─────────────────▼────────────┐  ┌───────────────┐
      │ PostgreSQL 16   │  │ Redis (cache, queue BullMQ,  │  │ Object store  │
      │ + pgvector      │  │ rate-limit, pub/sub)         │  │ S3/R2 (media) │
      └─────────────────┘  └──────────────────────────────┘  └───────────────┘
```

## 2. Frontend (Next.js)
- **Framework:** Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS,
  shadcn/ui + Radix, Framer Motion, TanStack Query, Zustand.
- **Rendering:** App shell SSR/SSG for landing + auth; authenticated app = client-side
  with RSC for list/data islands. ISR for public marketing/templates.
- **Data layer:** TanStack Query with optimistic updates for check-ins; offline
  buffer in IndexedDB (idb) + navigator sync; mutation queue replays via
  `POST /events/sync`.
- **PWA:** next-pwa/service worker (workbox) — precache app shell, runtime cache
  API GETs (network-first), push via web-push + service worker.
- **i18n/RTL:** next-intl or custom provider keyed by locale; AR RTL layout; number/
  date via Intl. Lazy-loaded locale bundles.
- **State/guards:** route guards via middleware (auth token check, redirect),
  entitlement gates for Pro features, feature-flag gating.
- **Performance:** code-split by route, `next/image`, font preload, streaming SSR,
  Lighthouse CI enforced.

## 3. Backend (NestJS)
- **Structure:** monolith with domain modules (auth, users, habits, goals,
  productivity, wellness, journal, analytics, gamification, community, ai, billing,
  integrations, admin, notifications, events). Repository pattern over Prisma.
- **Modules & infra:**
  - **AuthService** — sessions, refresh rotation, 2FA, RBAC guards.
  - **EventsService** — idempotent ingest (unique idempotency_key), enrichment,
    emits domain events (NestJS EventEmitter + BullMQ for heavy side-effects).
  - **Workers (BullMQ consumers):** streak/XP computation, score snapshots, badge
    evaluation, challenge progress, AI jobs, notification dispatch, integration
    sync, digest builder, retention/cohort jobs.
  - **AnalyticsService** — score computation from materialized event projections;
    read replicas for heavy queries; pg_partman partitioning on `events`,
    `wellness_metrics`, `events`-derived aggregates.
  - **AIGateway** — provider abstraction (OpenAI/Anthropic/self-hosted), model
    routing (cheap fast model vs premium model), fallback to rules engine,
    per-user spend tracking & caps.
- **API:** NestJS controllers → DTOs (class-validator) → services. OpenAPI 3.1
  auto-generated. Guard stack: AuthGuard → EntitlementGuard → RateLimitGuard →
  Idempotency interceptor.
- **Caching:** Redis — hot reads (today plan, scores, feeds), TTL tuned; invalidated
  by event-driven cache tags. Session store for web-push subscriptions (partly DB).
- **Concurrency:** distributed locks (Redis Redlock) for job-critical recomputations.

## 4. AI Architecture (multi-agent)

### 4.1 Agent topology
```
                    ┌──────────────────────────────┐
                    │  Orchestrator (LLM router)   │
                    │  intent: plan|coach|analytics│
                    └──────┬─────────┬─────────┬───┘
                           │         │         │
              ┌────────────▼──┐ ┌────▼─────┐ ┌─▼──────────┐
              │ Planner Agent │ │ Coach    │ │ Analyst    │
              │ daily/week/   │ │ Agent    │ │ Agent      │
              │ monthly plans │ │ wellbeing│ │ score/trend│
              │ auto-block    │ │ motivation│ │ explainer  │
              └───────────────┘ └──────────┘ └────────────┘
        ┌───────────────┐   ┌──────────────┐   ┌─────────────────┐
        │ Burnout Agent │   │ Memory Agent │   │ Guardrail Agent │
        │ prediction &  │   │ RAG write/   │   │ safety, medical,│
        │ interventions │   │ retrieve     │   │ confidence,     │
        └───────────────┘   └──────────────┘   │ refs-check      │
                                                └─────────────────┘
```

### 4.2 Tool calling (function tools available to agents)
`get_scores`, `get_trends`, `list_habits`, `get_habit_stats`, `get_today_plan`,
`get_wellness`, `get_journal_insights`, `get_goals`, `get_calendar`,
`auto_schedule`, `create_plan_draft`, `search_memory`, `add_memory`,
`update_memory`, `get_burnout_risk`, `get_challenge_progress`, `send_nudge`
(e.g. schedule notification), `schedule_review`.

### 4.3 RAG / Memory
- **Ingestion:** events, completions, journal entries, wellness logs, AI
  conversations, plan feedback → summarized → embedded (text-embedding-3-small)
  → stored in `ai_memories` (pgvector, HNSW).
- **Retrieval:** hybrid (vector + recency + importance boost + user editable
  preferences) → top-k context packed with system prompt.
- **Memory hygiene:** dedup, decay, importance scoring, user-visible/editable
  memory panel, privacy: memory only for user; never shared across accounts.
- **Personalized learning:** preference memory (tone, schedule constraints) +
  feedback loops (accepted/rejected plans, message ratings).

### 4.4 Predictive AI
- **Burnout prediction:** gradient-boosted model (XGBoost/LightGBM) over weekly
  feature matrix (stress, sleep debt, completion drop, mood, load) + LLM narrative;
  threshold tuned; adaptive to dismissal feedback.
- **Forecasts:** streak survival, goal completion date, engagement risk (simple
  time-series + Bayesian scoring), all served to analytics + coach.
- **Smart scheduling:** energy-aware time blocking using historical focus/energy
  patterns; handled by Planner Agent with deterministic constraints first.

### 4.5 Safety & Quality
- **Guardrail Agent:** deny medical/legal/financial advice; crisis keywords →
  helpline resources; confidence < threshold → answer with uncertainty or
  rephrase; never invent data — tool calls must ground numbers.
- **Rate & spend:** per-user token caps, model routing, prompt caching, batching
  of nightly jobs.
- **Observability:** token usage, latency, feedback scores, hallucination audits,
  human flag channel.

## 5. Integrations Architecture
- **Health (Apple Health, Google Fit, Fitbit, Garmin, Samsung Health):** OAuth2 +
  provider SDK/REST; connectors normalize → `wellness_metrics` (dedup via
  external_id) → events pipeline → scores/AI. Refresh-token lifecycle managed;
  daily + on-demand sync; gap annotation.
- **Calendars (Google/Apple/Outlook):** OAuth2 + CalDAV/provider API; events
  mirrored into `calendar_events`; AI time blocking respects busy time; two-way
  optional (v1.1).
- **Webhooks (v1.1+):** signed request verification, per-user endpoints, delivery
  retries, event filtering.

## 6. Data Flows (examples)
- **Check-in:** client → `POST /habits/:id/completions` → events ingest →
  BullMQ jobs: streak+XP → gamification → score snapshot → (if risk) AI nudge →
  cache invalidation → notifications.
- **Daily plan:** cron per timezone (05:00) → gather context → Planner Agent →
  persist plan → push → feedback hook.
- **Weekly review:** Sunday job → aggregate week → Analyst + Coach agents → review
  doc + next-week plan → notification → memory update.

## 7. Environments & Observability
- Envs: `local` → `staging` → `prod`. DB migrations via Prisma migrate +
  deployment gates. Feature flags per env.
- Observability: OpenTelemetry → traces (Tempo), metrics (Prometheus/Grafana),
  logs (Loki), error tracking (Sentry), AI-specific dashboards (token cost, latency,
  feedback, hallucination rate). SLO dashboards + alerting (99.9% API, AI latency).

## 8. Cost Controls
- Model routing (fast/cheap for short intents; strong model for plans/reviews).
- Prompt caching, shared completions for recurring daily prompts where safe.
- Free tier uses rule engine + cached template insights (no streaming LLM).
- Per-user daily AI budget; hard caps alert team.
