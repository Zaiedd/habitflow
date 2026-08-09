# HabitFlow — Testing Strategy

## 1. Test Pyramid
```
     ▲  E2E (Playwright) — critical user journeys, ≤ 40
     ▲▲  Integration (NestJS e2e + DB) — modules, RLS, idempotency
     ▲▲▲  Unit (Vitest/Jest) — services, validators, AI guardrails
     ▲▲▲▲  Static (ESLint + typecheck) — enforced in CI
```

## 2. Unit Tests
- Framework: **Vitest** (frontend) + **Jest** (NestJS backend).
- Targets:
  - Validators (DTO), scoring math (habit/focus/lifestyle), streak logic
    (freeze/repair), XP/leveling, gamification criteria, schedule recurrence
    (RRULE), timezone-aware due logic.
  - AI guardrails: forbidden-topic classifier, confidence thresholds, crisis
    detection, tool-call grounding (numbers must come from tools), memory
    dedup/decay.
  - i18n: plural rules, RTL, number/date formatting.
- Coverage gate: backend ≥ 80% lines on `src/server` (services), frontend ≥ 70%
  on pure logic (utils, hooks).

## 3. Integration Tests
- NestJS supertest against test DB (Postgres container per run) + Redis.
- Cases: auth flows (register→verify→login→refresh→2FA), RLS scoping (user A can't
  read user B), idempotency on duplicate completions/sync, entitlement limits
  (Free cap enforced), webhook HMAC verification (Stripe, integrations), offline
  batch replay + conflict resolution, score snapshot correctness, BullMQ job
  pipeline (streak→XP→badge), AI tool-call routing with mocked provider.

## 4. E2E Tests (Playwright)
- **Web:** onboarding completion, create+complete habit (streak + XP shown),
  AI coach conversation (SSE) with tool-grounded answer, daily plan accept/edit,
  journal + AI summary, upgrade path (Stripe test mode), offline → reconnect sync,
  RTL (AR) pass on core journeys, PWA install + offline shell, push notification.
- **Accessibility:** axe-core assertions on all major routes (WCAG AA).
- **Admin:** flag toggle, moderation resolution, user lookup.

## 5. AI-Specific Testing
- **Golden sets:** curated conversation fixtures with expected grounded outputs;
  regression-run on model changes.
- **Red-team set:** jailbreak, prompt injection, medical-advice, crisis — must be
  handled safely.
- **Grounding checks:** every numeric claim traceable to a tool result; hallucination
  audit harness (synthetic queries, compare to DB truth).
- **Evaluators:** rubric scoring (helpful, safe, grounded, tone) with a labeled
  eval set; run nightly on staging model; gate promotions.
- **Cost/latency budgets:** assert per-intent token & latency ceilings.

## 6. Performance & Load
- Lighthouse CI (≥95) on core routes; bundle-size budgets.
- k6 load tests: auth burst, check-in 500 RPS, feed scroll, coach SSE concurrency
  (100 parallel) with target p95 < 300 ms (API) / first-token < 1.5 s.
- Soak test 24h; DB index/query plan review for hot paths.

## 7. Security Testing
- SAST (Semgrep), dependency audit (npm audit/Snyk), secret scanning (gitleaks),
- DAST: OWASP ZAP baseline on staging after each release.
- RLS/entitlement tests in integration suite; webhook spoofing tests; brute-force
  lockout tests; SSRF guard tests.

## 8. Test Environments & Data
- CI: ephemeral Postgres + Redis containers; seeded deterministic fixtures.
- Staging: long-lived env, synthetic PII, test LLM provider with recorded
  responses for determinism; nightly AI eval.
- Fixtures: persona datasets (Maya/Omar/Lina) for journeys.

## 9. CI Gates
```
PR: lint+type → unit → build → (fast) integration
main: + e2e → a11y → lighthouse → trivy → (gated) staging deploy
release: + load/smoke → security baseline → canary
```

## 10. QA Manual Pass (per release)
- Onboarding, auth edge cases (OAuth, 2FA, resets), timezone/travel, offline
  sync conflicts, billing lifecycle (trial→paid→cancel→downgrade), community
  moderation, AR/RTL, dark mode, screen-reader pass, burn-in 24h.
