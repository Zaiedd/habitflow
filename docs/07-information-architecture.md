# HabitFlow — Information Architecture & Sitemap

## 1. Navigation Principles
- **Bottom tab bar (mobile):** Today | Planner | Coach | Insights | Profile (5 tabs max).
- **Discoverable sections** hang off Profile or Today via entry cards.
- Habit/Goal/Task/Journal live under **Planner** and **Today**; deep management under
  **Profile → Library**.
- Everything reachable in ≤ 3 taps.

## 2. IA Map

```
Home /
├─ Landing (marketing, pricing, install) [public]
└─ Auth (login, register, forgot/reset password, verify email, 2FA) [public]

App (authenticated)
├─ /today          Today (daily engine)
│   ├─ Morning briefing (AI plan summary)
│   ├─ Habit check-offs (due today)
│   ├─ Focus tasks + time blocks
│   ├─ Quick log (mood/water/sleep/energy)
│   └─ Evening reflection card
├─ /planner        Planner & Library
│   ├─ Planner
│   │   ├─ Tasks (list, drag to calendar)
│   │   ├─ Calendar (day/week/month, time blocks)
│   │   ├─ Time blocking
│   │   ├─ Pomodoro
│   │   └─ Focus mode
│   └─ Library
│       ├─ Habits (list, create/edit, categories, templates)
│       ├─ Goals (SMART, milestones)
│       └─ Journal (entries, templates, calendar view)
├─ /coach          AI Coach
│   ├─ Chat (SSE)
│   ├─ Daily plan detail
│   ├─ Weekly/Monthly review
│   └─ Coach settings (tone, schedule, memory)
├─ /insights       Analytics & Wellness
│   ├─ Overview (scores: habit/growth/focus/lifestyle)
│   ├─ Habits (heatmap, trends, forecasts, AI explainer)
│   ├─ Goals (progress, velocity, projection)
│   ├─ Productivity (focus time, pomodoro, completion)
│   ├─ Wellness (sleep/water/exercise/mood/stress/meditation/reading/screen)
│   ├─ Journal insights (mood trends, AI summaries)
│   └─ Reports (export)
├─ /community      Community
│   ├─ Friends (requests, list)
│   ├─ Groups (create/join, roles)
│   ├─ Challenges (shared, progress)
│   └─ Feed (activity, reactions)
├─ /profile        Profile
│   ├─ Settings (profile, notifications, privacy, security)
│   ├─ Library management (categories, archived)
│   ├─ Integrations (health, calendar, webhooks)
│   ├─ Premium (plans, billing, receipts)
│   ├─ Gamification (XP, level, badges, rewards, leaderboards)
│   ├─ Language & Appearance (themes, i18n)
│   ├─ Data (export, delete)
│   └─ Help & Support
└─ /admin          Admin (role-gated)
    ├─ Users, Feature flags, Content, Moderation, Ops
```

## 3. Sitemap (route table)

| Route | Group | Auth | Description |
|---|---|---|---|
| `/` | Public | No | Landing |
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` | Auth | No | Auth flows |
| `/today` | App | Yes | Daily engine |
| `/planner` | App | Yes | Planner + tasks + time blocks |
| `/planner/calendar` | App | Yes | Calendar views |
| `/planner/pomodoro` | App | Yes | Timer |
| `/library/habits` | App | Yes | Habit CRUD |
| `/library/habits/templates` | App | Yes | Template gallery |
| `/library/goals` | App | Yes | Goals + milestones |
| `/library/journal` | App | Yes | Journaling |
| `/coach` | App | Yes | AI coach chat |
| `/coach/reviews` | App | Yes | Weekly/monthly reviews |
| `/insights` | App | Yes | Scores + analytics |
| `/insights/wellness` | App | Yes | Wellness dashboards |
| `/community` | App | Yes | Friends/groups/feed |
| `/community/groups/:id` | App | Yes | Group detail |
| `/profile` | App | Yes | Profile hub |
| `/profile/settings` | App | Yes | Settings |
| `/profile/integrations` | App | Yes | Connect providers |
| `/profile/premium` | App | Yes | Plans/billing |
| `/profile/gamification` | App | Yes | XP/badges/rewards |
| `/profile/data` | App | Yes | Export/delete |
| `/admin` | App | Admin | Admin console |

## 4. IA Rules
- **Entity ownership:** habits/goals/tasks/journal belong to a user or family group.
- **Shared entities** (community): read/scoped views, never co-editable in v1.
- **Archival:** delete soft → archive; hard delete only via DSAR.
- **Scoring model lives in Insights**; all scores computed from the events pipeline.
- **Global search** (habits/goals/journal) available from Today header (v1.1).
