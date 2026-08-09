# HabitFlow — Functional & Non-Functional Requirements

> Priority legend: **M** = Must (v1), **S** = Should (v1.1), **C** = Could (post-GA).

## 1. Functional Requirements

### FR-1 Authentication & Account
- **FR-1.1 [M]** Register with email + password (strong password policy) and with
  Google / Apple OAuth.
- **FR-1.2 [M]** Login (email or OAuth), session management (JWT + refresh), logout.
- **FR-1.3 [M]** Email verification flow.
- **FR-1.4 [M]** Password reset (email token, expiring).
- **FR-1.5 [M]** Two-factor authentication (TOTP app) with backup codes.
- **FR-1.6 [M]** Profile management: display name, avatar, timezone, locale, date
  format, units (metric/imperial), themes.
- **FR-1.7 [M]** Subscription state management (Free/Pro/Family) tied to payments.
- **FR-1.8 [M]** Multi-language UI (EN + AR at launch; more later). Full RTL support.
- **FR-1.9 [S]** Account deletion (GDPR), data export (JSON/CSV), privacy settings.

### FR-2 AI Personal Coach
- **FR-2.1 [M]** Conversational coach chat with persistent, per-user memory.
- **FR-2.2 [M]** Daily personalized guidance & morning plan ("Today at a glance").
- **FR-2.3 [M]** Weekly AI review + next-week plan.
- **FR-2.4 [M]** Monthly AI plan & goal re-planning.
- **FR-2.5 [M]** Burnout detection (pattern analysis) with proactive interventions.
- **FR-2.6 [M]** Stress reduction recommendations & mindfulness prompts.
- **FR-2.7 [M]** Coaching on habit/wellness/goal data via tool calling (reads scores,
  logs, streaks) and RAG over user memory.
- **FR-2.8 [M]** Confidence-gated responses; no medical/legal advice; escalation to
  crisis resources.
- **FR-2.9 [S]** Voice input on coach chat.
- **FR-2.10 [S]** AI-generated challenges personalized to user goals.

### FR-3 Habit Management
- **FR-3.1 [M]** Create/edit/delete habits: name, icon, color, category, difficulty
  (Easy/Medium/Hard), target (per-day, per-week, X times/week).
- **FR-3.2 [M]** Recurring schedules: daily, weekly (specific days), custom interval,
  monthly, reminder times (with timezone).
- **FR-3.3 [M]** Check-off completion (positive/negative habits), streak tracking,
  streak freeze/repair options.
- **FR-3.4 [M]** Habit templates gallery (library) with one-tap import.
- **FR-3.5 [M]** Categories with ordering and archiving.
- **FR-3.6 [M]** Reminders: local push + email/notification fallback.
- **FR-3.7 [S]** Difficulty auto-adjustment suggested by AI based on success rate.
- **FR-3.8 [C]** Habit sharing to groups/friends.

### FR-4 Goals
- **FR-4.1 [M]** SMART goal creation (specific, measurable, achievable, relevant,
  time-bound), start/end dates.
- **FR-4.2 [M]** Milestones (checkpoints with due dates).
- **FR-4.3 [M]** Progress tracking: % complete, remaining, velocity.
- **FR-4.4 [M]** Link habits/tasks to goals; progress computed from linked items.
- **FR-4.5 [M]** Goal analytics: trend, projected completion date, AI narrative.

### FR-5 Productivity
- **FR-5.1 [M]** Daily planner: tasks, time slots, priorities, drag-and-drop.
- **FR-5.2 [M]** Task CRUD with due dates, tags, recurring tasks, sub-tasks.
- **FR-5.3 [M]** Calendar view (day/week/month) with event + time-block entries.
- **FR-5.4 [M]** Time blocking: drag habits/tasks into calendar blocks.
- **FR-5.5 [M]** Pomodoro timer with focus/break cycles and session logs.
- **FR-5.6 [M]** Deep work / focus mode (blocks distracting notifications, countdown,
  focus stats).
- **FR-5.7 [M]** AI auto-scheduling suggestions for unplanned tasks.
- **FR-5.8 [S]** Calendar integrations sync (Google/Apple/Outlook).

### FR-6 Wellness
- **FR-6.1 [M]** Log sleep (duration, quality, bedtime, wake time, latency).
- **FR-6.2 [M]** Log water intake (cups, with goal).
- **FR-6.3 [M]** Log exercise (type, duration, intensity).
- **FR-6.4 [M]** Log mood, energy, stress (scales + optional tags).
- **FR-6.5 [M]** Meditation log (session count/duration), guided quick sessions.
- **FR-6.6 [M]** Reading log (time/pages) and screen time self-log.
- **FR-6.7 [M]** Wellness dashboard with AI insights and correlations.
- **FR-6.8 [S]** Integrations: Apple Health, Google Fit, Fitbit, Garmin, Samsung
  Health, smartwatches.

### FR-7 Journaling
- **FR-7.1 [M]** Journal entries: free text, mood, tags, attachments.
- **FR-7.2 [M]** Entry templates: daily reflection, gratitude, growth log.
- **FR-7.3 [M]** AI emotion detection + insights summary per entry and over time.
- **FR-7.4 [M]** Search, calendar browsing, streak of journaling.
- **FR-7.5 [S]** Voice journaling (transcription).

### FR-8 Analytics
- **FR-8.1 [M]** Composite scores: Habit Score, Growth Score, Focus Score,
  Lifestyle Score (0–100, weekly).
- **FR-8.2 [M]** Trends over 7/30/90 days; heatmaps (GitHub-style) for habits.
- **FR-8.3 [M]** Forecasts: projected streak, goal completion, burnout risk.
- **FR-8.4 [M]** AI explanations ("Why did my Focus Score drop?").
- **FR-8.5 [M]** Export analytics to CSV/PDF (Pro).

### FR-9 Gamification
- **FR-9.1 [M]** XP earned from completions, weighted by difficulty & consistency.
- **FR-9.2 [M]** Levels with titles; level-up celebration.
- **FR-9.3 [M]** Badges & achievements catalog with unlock conditions.
- **FR-9.4 [M]** Challenges: personal, daily streaks, shared challenges.
- **FR-9.5 [M]** Rewards: unlockable themes/icons, streak freezes (in-app currency).
- **FR-9.6 [S]** Leaderboards within groups/friends.

### FR-10 Community
- **FR-10.1 [M]** Friends: request, accept, remove, block.
- **FR-10.2 [M]** Groups: create, join by invite/code, roles (member/admin/owner).
- **FR-10.3 [M]** Accountability: share a habit/goal with a friend/group.
- **FR-10.4 [M]** Activity feed (privacy-scoped), reactions, comments (moderated).
- **FR-10.5 [M]** Shared challenges with progress tracking.
- **FR-10.6 [S]** Community feed of motivational content / public challenges.

### FR-11 Integrations & Platform
- **FR-11.1 [M]** Cloud sync across devices (server-authoritative).
- **FR-11.2 [M]** Push notifications via web-push (PWA).
- **FR-11.3 [M]** Offline queue: actions buffer locally and sync when online.
- **FR-11.4 [M]** Custom themes (light/dark/system; Pro adds custom accent + presets).
- **FR-11.5 [S]** Calendar OAuth integrations (Google/Apple/Outlook).
- **FR-11.6 [S]** Health integrations (Apple Health, Google Fit, Fitbit, Garmin,
  Samsung Health).
- **FR-11.7 [C]** Import/export habit data, IFTTT/Zapier-style webhooks.

### FR-12 Admin & Ops (internal)
- **FR-12.1 [M]** Admin panel: user management, feature flags, content (templates,
  badges) management.
- **FR-12.2 [M]** Moderation queue for community content & reports.
- **FR-12.3 [M]** Observability: logs, traces, metrics, error tracking.

## 2. Non-Functional Requirements

### NFR-1 Performance
- **NFR-1.1** Lighthouse ≥ 95 (performance, accessibility, best practices, SEO).
- **NFR-1.2** p95 API latency < 300 ms (CRUD, excluding AI generation).
- **NFR-1.3** AI first token < 1.5 s; full coach reply < 6 s p95.
- **NFR-1.4** TTI < 2 s on mid-range mobile (4G); LCP < 2.5 s.
- **NFR-1.5** App shell loads offline (PWA, service worker).

### NFR-2 Reliability & Availability
- **NFR-2.1** 99.9% availability for API tier (target), RPO ≤ 5 min, RTO ≤ 15 min.
- **NFR-2.2** Zero data loss on client crash: optimistic UI + idempotent sync.
- **NFR-2.3** Graceful degradation when AI provider is down (fallback to rules engine).

### NFR-3 Security
- **NFR-3.1** OWASP Top 10 compliance; auth via OWASP ASVS L2.
- **NFR-3.2** TLS 1.2+ everywhere; HSTS.
- **NFR-3.3** Passwords hashed with Argon2id; tokens at-rest encrypted.
- **NFR-3.4** Wellness/health data treated as sensitive; encrypted at rest
  (AES-256) + field-level encryption where required.
- **NFR-3.5** Rate limiting, brute-force protection, session revocation.
- **NFR-3.6** No plaintext secrets in repos/logs; secret manager.

### NFR-4 Privacy & Compliance
- **NFR-4.1** GDPR, CCPA, UK GDPR, ePrivacy (consent for non-essential cookies/analytics).
- **NFR-4.2** Data Subject Access Requests (export, delete) within 30 days.
- **NFR-4.3** Data residency configurable (EU/US). Privacy-by-design: AI does not
  train on user data; data not sold.
- **NFR-4.4** Child safety: 16+ age gate; no targeting of children (COPPA/KYCC).

### NFR-5 Scalability
- **NFR-5.1** Support 100k MAU, 1M+ events/day at GA; architecture must scale to
  1M MAU without redesign.
- **NFR-5.2** Horizontal scaling of API (stateless), workers (queue-based), DB
  (read replicas + partitioning).
- **NFR-5.3** Autoscaling on Kubernetes; burst handling via queue.

### NFR-6 Accessibility & Internationalization
- **NFR-6.1** WCAG 2.2 AA (contrast, keyboard nav, screen reader labels, focus mgmt).
- **NFR-6.2** Full i18n: UI strings, dates, numbers, plurals; RTL (AR).
- **NFR-6.3** Localized AI coach (EN/AR v1) with language consistency.

### NFR-7 Maintainability & Quality
- **NFR-7.1** TypeScript strict; ESLint + Prettier enforced in CI.
- **NFR-7.2** Test coverage: unit ≥ 80% on server logic; E2E for critical paths.
- **NFR-7.3** Semantic versioning; feature flags for progressive rollout.
- **NFR-7.4** Full documentation; architecture docs kept in repo.

### NFR-8 Cost & Efficiency
- **NFR-8.1** AI cost per active Pro user ≤ $0.60/month (routing + caching + caps).
- **NFR-8.2** Infra cost per MAU within plan; automated cost alerts.

### NFR-9 Observability
- **NFR-9.1** Structured logs, traces, metrics (RED + USE), dashboards, alerts.
- **NFR-9.2** Distributed tracing across API, workers, AI calls.
- **NFR-9.3** Error budget tracking and SLO alerting.
