# HabitFlow — API Design

- **Style:** REST + JSON. Streaming for AI chat via SSE. Monolith-first with
  modular NestJS modules (future service-split friendly).
- **Versioning:** `/api/v1/*`.
- **Auth:** `Authorization: Bearer <access_token>` (JWT, 15 min) + `refresh_token`
  via `POST /api/v1/auth/refresh`. Idempotency header `Idempotency-Key` on writes.
- **Errors:** RFC 7807 problem+json `{ type, title, status, detail, trace, errors[] }`.
- **Pagination:** `?cursor=&limit=` (cursor-based) → `{ data, nextCursor }`.
- **Time:** ISO-8601 UTC; client sends `X-Timezone-Offset` or per-request `tz`.

## 1. Auth & Account
```
POST   /api/v1/auth/register            { email, password, locale }
POST   /api/v1/auth/login               { email, password } → { access, refresh, mfaRequired? }
POST   /api/v1/auth/mfa/verify          { code } (TOTP)
POST   /api/v1/auth/refresh             { refreshToken }
POST   /api/v1/auth/logout
POST   /api/v1/auth/verify-email        { token }
POST   /api/v1/auth/resend-verification
POST   /api/v1/auth/forgot-password     { email }
POST   /api/v1/auth/reset-password      { token, password }
POST   /api/v1/auth/mfa/setup           → { secret, qr }
POST   /api/v1/auth/mfa/enable          { code }
POST   /api/v1/auth/mfa/disable         { code }
GET    /api/v1/me                       profile
PATCH  /api/v1/me                       { displayName, avatar, timezone, locale, units, theme }
GET    /api/v1/me/data-export           → job id; file emailed
DELETE /api/v1/me                       → DSAR delete (grace period)
```

## 2. Habits
```
GET    /api/v1/habits?category=&archived=&cursor=
POST   /api/v1/habits
GET    /api/v1/habits/:id
PATCH  /api/v1/habits/:id
DELETE /api/v1/habits/:id              (archive)
POST   /api/v1/habits/:id/archive | /unarchive
POST   /api/v1/habits/:id/completions  { localId, occurredAt, qty, idempotencyKey }  → 201 + streak snapshot
GET    /api/v1/habits/:id/stats        { currentStreak, longestStreak, successRate, trend }
GET    /api/v1/habits/templates        ?category=&locale=
GET    /api/v1/habits/heatmap?from=&to=
GET    /api/v1/categories
POST   /api/v1/categories
```

## 3. Goals
```
GET/POST /api/v1/goals
GET/PATCH/DELETE /api/v1/goals/:id
POST /api/v1/goals/:id/milestones
PATCH /api/v1/goals/:id/milestones/:mid
PUT  /api/v1/goals/:id/links            (link habits/tasks with weights)
GET  /api/v1/goals/:id/progress
POST /api/v1/goals/:id/ai-replan        → { suggestion, diff }
```

## 4. Productivity
```
GET/POST /api/v1/tasks
GET/PATCH/DELETE /api/v1/tasks/:id
POST /api/v1/tasks/:id/complete | /reopen
GET/POST /api/v1/time-blocks            ?date=           (day view)
PATCH/DELETE /api/v1/time-blocks/:id
GET/POST/PATCH/DELETE /api/v1/calendar/events
POST /api/v1/pomodoro/sessions
GET  /api/v1/pomodoro/stats
POST /api/v1/focus/sessions
GET  /api/v1/ai/today-plan              ?date= → plan { blocks[], focus[], summary }
POST /api/v1/ai/today-plan/:id/feedback { accepted, edits }
POST /api/v1/ai/auto-schedule           { taskIds } → suggested blocks
```

## 5. Wellness
```
POST /api/v1/wellness/{metric}          (sleep|water|exercise|mood|energy|stress|meditation|reading|screen)
GET  /api/v1/wellness?metrics=&from=&to=
PATCH/DELETE /api/v1/wellness/:id
GET  /api/v1/wellness/insights          → AI correlations
GET  /api/v1/wellness/summary           → weekly aggregates
```

## 6. Journaling
```
GET/POST /api/v1/journal
GET/PATCH/DELETE /api/v1/journal/:id
GET  /api/v1/journal/calendar?month=
GET  /api/v1/journal/templates
POST /api/v1/journal/:id/ai-summary     → { emotion, topics, sentiment }
GET  /api/v1/journal/insights           → mood trends
```

## 7. Analytics & Scores
```
GET /api/v1/insights/overview           → 4 scores + deltas
GET /api/v1/insights/scores?type=&window=&from=&to=
GET /api/v1/insights/trends?type=&days=
GET /api/v1/insights/forecasts          → streak/goal/burnout projections
GET /api/v1/insights/explain?type=      → AI explanation of a score change
GET /api/v1/insights/report?format=csv|pdf
```

## 8. AI Coach
```
POST /api/v1/ai/coach/messages          { conversationId?, content } → SSE stream
GET  /api/v1/ai/conversations
GET  /api/v1/ai/conversations/:id/messages?cursor=
POST /api/v1/ai/reviews/weekly          → generates weekly review
POST /api/v1/ai/reviews/monthly
GET  /api/v1/ai/plans                   (daily/weekly/monthly list)
GET  /api/v1/ai/memory                  (readable memory, editable)
PATCH /api/v1/ai/memory/:id             (user edits/removes a memory)
GET  /api/v1/ai/burnout                → current risk + drivers
POST /api/v1/ai/burnout/:id/ack
```

## 9. Gamification
```
GET  /api/v1/gamification/me            → xp, level, next, badges
GET  /api/v1/badges
GET  /api/v1/challenges
POST /api/v1/challenges
GET/PATCH /api/v1/challenges/:id
POST /api/v1/challenges/:id/join
GET  /api/v1/rewards
POST /api/v1/rewards/:id/claim
GET  /api/v1/leaderboards?group_id=
```

## 10. Community
```
GET/POST /api/v1/friends/requests
POST /api/v1/friends/:id/accept | /decline
GET  /api/v1/friends
GET/POST /api/v1/groups
GET/PATCH/DELETE /api/v1/groups/:id
POST /api/v1/groups/:id/join | /leave
PATCH /api/v1/groups/:id/members/:uid   (role)
POST /api/v1/shared-items
GET  /api/v1/feed?group_id=&cursor=
POST /api/v1/feed/:id/reactions
POST /api/v1/feed/:id/comments
POST /api/v1/reports
```

## 11. Integrations
```
GET  /api/v1/integrations               → providers + status
POST /api/v1/integrations/:provider/connect    (OAuth start)
POST /api/v1/integrations/:provider/callback
POST /api/v1/integrations/:provider/sync       → manual sync
DELETE /api/v1/integrations/:provider
GET  /api/v1/integrations/:provider/status
```

## 12. Billing
```
GET  /api/v1/billing/plans
POST /api/v1/billing/checkout          { planCode, interval }
POST /api/v1/billing/portal            → Stripe customer portal
POST /api/v1/billing/webhooks          (Stripe, HMAC-verified)
GET  /api/v1/billing/receipts
POST /api/v1/billing/cancel
```

## 13. Platform
```
POST /api/v1/events/sync               (offline batch replay, idempotent)
GET  /api/v1/notifications?cursor=
POST /api/v1/notifications/:id/read
POST /api/v1/devices/register          (web-push subscription)
POST /api/v1/upload                    (presigned S3/R2 URL) → { url, key }
GET  /api/v1/meta                      (feature flags, locales, constants)
```

## 14. Admin (role-gated)
```
GET  /api/v1/admin/users?cursor=         PATCH /api/v1/admin/users/:id
GET/POST/PATCH/DELETE /api/v1/admin/flags
GET/POST/PATCH /api/v1/admin/content    (templates/badges/challenges)
GET /api/v1/admin/moderation?status=     POST /api/v1/admin/moderation/:id/resolve
GET /api/v1/admin/health                (per-service status)
```

## 15. Conventions & Rules
- **Idempotency:** writes require `Idempotency-Key`; duplicate key returns the
  original response (retry-safe offline sync).
- **Optimistic concurrency:** PATCH accepts `version`/`updatedAt`; 409 on conflict.
- **Rate limits (Redis sliding window):** auth 10/min/IP; writes 120/min/user;
  coach 30/min/Pro, 10/day/Free; uploads 10/min.
- **Auth gates:** most endpoints require Bearer; Free-tier limits enforced
  server-side (habits ≤ 20, AI coach basic, analytics limited).
- **Streaming:** SSE events `event: token` / `event: done` with `id` for resume.
- **OpenAPI 3.1 spec** generated from NestJS decorators; published to docs site.
