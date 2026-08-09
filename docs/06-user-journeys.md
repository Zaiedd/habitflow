# HabitFlow — User Journey & Flows

## 1. High-Level User Journey (New → Advocate)

```
Discover → Sign up → Onboard → First Wins → Daily Loop → Weekly Review → Pro → Community → Advocate
   A        B        C        D          E            F            G        H         I
```

- **A Discover:** landing page (value props, social proof, pricing), store/PWA install.
- **B Sign up:** email/OAuth, verification.
- **C Onboard (≤3 min):** 1) name/avatar/timezone 2) goals + focus areas 3) pick 3
  starter habits (templates) 4) wellness baseline (optional wearable connect) 5) AI
  preferences (coaching tone, schedule) → first AI plan generated.
- **D First wins (day 1–3):** complete 1st habit → streak + XP + badge; first AI
  check-in; daily plan accepted.
- **E Daily loop:** morning plan → complete → reward → evening check-in → AI
  reflection (≈2–3 min/day total).
- **F Weekly review:** AI summary, scores, next week plan (Sunday).
- **G Pro:** triggered by limits/paywall, upgrades for AI coach + analytics + themes.
- **H Community:** friends, groups, shared challenges.
- **I Advocate:** NPS/referral program, shareable achievement cards.

## 2. Activation Funnel (targets)

| Stage | Metric | Target |
|---|---|---|
| Onboarding completion | completed onboarding / signed up | ≥ 60% |
| First habit created | users w/ ≥1 habit | ≥ 90% |
| First completion | completed ≥1 habit / onboarded | ≥ 75% |
| First AI interaction | talked to coach / onboarded | ≥ 55% |
| Day-7 retention | active day 7 | ≥ 60% |

## 3. Core Flows (step diagrams)

### 3.1 Habit Check-in Flow
```
[Tap checkmark] → optimistic UI (confetti) → enqueue event → 
  online? ─yes→ POST /events ─→ server validates ─→ streaks/XP/scores (async) → UI confirm
  no ─→ buffer in IndexedDB → on reconnect → replay idempotent → reconcile
```

### 3.2 AI Coach Message Flow
```
[Type message] → POST /ai/coach/messages
  → load user context (profile + recent events + RAG memories)
  → orchestrator routes to agent(s)
  → tool calls: get_scores, list_habits, get_today_plan, get_weekly_review, ...
  → guardrail check (safety/medical/confidence)
  → SSE stream to client → persist conversation → update memory vector store
```

### 3.3 Daily Plan Flow
```
05:00 local (job) → collect tasks/habits/calendar/energy → 
  AI ranks & time-blocks → store plan → push notif → 
  user edits (drag) → feedback captured → next iteration improves
```

### 3.4 Burnout Prevention Flow
```
Weekly risk job → compute burnout_risk (0-100) → if ≥ threshold:
  create burnout_alert (severity, drivers)
  → rebalance next plan (reduce load, add rest) 
  → coach outreach message (compassionate)
  → user dismiss/ack → logged → threshold adaptive
```

### 3.5 Upgrade to Pro Flow
```
Limit hit / paywall → plan selector → Stripe checkout (3DS) →
  webhook → entitlements activated → UI unlocks → receipt email
```

### 3.6 Offline Sync Flow
```
Disconnect → buffer events (localId, idempotencyKey, clientUpdatedAt)
Reconnect → POST /events/sync (batch, ordered)
  → server dedups by idempotencyKey, applies in order
  → conflicts (same entity edited both sides): server timestamp wins,
     client shows "review changes" for editable fields
```

### 3.7 Community Accountability Flow
```
[Share habit] → pick friend/group → invite → accept →
  shared progress visible in feed → challenge created (optional) →
  members see progress bars → reactions/comments → done → celebration
```

## 4. Edge-Case Flows
- **Missed day (streak risk):** day after a miss → app surfaces "streak freeze
  available" + AI encouragement (no guilt).
- **New timezone travel:** detects TZ shift → re-asks "plan by your local time?",
  keeps schedule in user TZ.
- **First week with no data:** coach uses baseline estimates + templates; scores
  show "warming up" state instead of 0.
- **AI provider outage:** coach chat falls back to templated/rules responses with
  notice; logging unaffected.
