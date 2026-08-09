# HabitFlow — Wireframes (mobile-first, ASCII)

> Grid: 360×640 logical px base. Bottom tab bar = 5 tabs. All screens RTL-capable.

## WF-1 Landing (public)
```
┌─────────────────────────────┐
│  HabitFlow  [Sign in]        │
│  Your AI co-pilot for life   │
│  [          Try free ]       │
│  "Track less. Grow more."    │
│                              │
│  ┌─ Today ─┐ ┌─ Coach ─┐    │
│  │  plan   │ │ chat    │    │
│  └─────────┘ └─────────┘    │
│  Feature rows (4)            │
│  Pricing: Free / Pro / Family│
│  Footer: privacy, terms      │
└─────────────────────────────┘
```

## WF-2 Onboarding (step 3 of 5 — pick habits)
```
┌─────────────────────────────┐
│ ● ● ● ○ ○   [Skip]          │
│ Pick your first 3 habits     │
│ ┌─ Drink water ── [+] ┐     │
│ ┌─ Morning walk ── [+] ┐    │
│ ┌─ Read 10 min ── [+] ┐     │
│ ┌─ Meditate ── [+] ┐        │
│ ┌─ More from library ──→    │
│         [Continue →]        │
└─────────────────────────────┘
```

## WF-3 Today (home)
```
┌─────────────────────────────┐
│ 08:00  Good morning, Maya ✦ │
│ Plan: 2 blocks · 3 habits   │
│ ┌─────────────────────────┐ │
│ │ ⭐ Morning briefing (AI) │ │
│ │ "Focus: finish deck,     │ │
│ │  then 30-min run."  [↻] │ │
│ └─────────────────────────┘ │
│ HABITS TODAY                │
│ ☐ Drink water      ▓▓▓▓░  3/4│
│ ☑ Morning run     🔥 12 days│
│ ☐ Read 10 min     ▓░░░░  0/1│
│ TASKS                       │
│ ☐ Finish deck @10:00 [⏱]   │
│ ┌─────────────────────────┐ │
│ │ 💧 water  😌 mood  😴sleep│ │
│ │   Quick log (swipe row)   │ │
│ └─────────────────────────┘ │
│ [Today][Planner][Coach][Insights][Profile] │
└─────────────────────────────┘
```

## WF-4 Habit editor (create)
```
┌─────────────────────────────┐
│   New Habit        [Save]   │
│ Icon  Name [_____________]  │
│ Category [Wellness ▾]       │
│ Schedule: ●Daily ○Weekly     │
│  ○Custom [Mon Tue Wed …]    │
│ Target: [1]× per [day ▾]    │
│ Difficulty: E M ●H          │
│ Reminder: [07:00] [on]      │
│ Streak freeze: [on]         │
└─────────────────────────────┘
```

## WF-5 Coach chat
```
┌─────────────────────────────┐
│ ← Coach        ● ● ●        │
│ ┌─────────────────────────┐ │
│ │ AI: I noticed sleep was  │ │
│ │ low this week. Want to    │ │
│ │ move your run to evening? │ │
│ │  [Plan for me] [Just chat]│ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ me: yes, plan my day     │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ AI: Here's today's plan  │ │
│ │ 07:30 read · 10:00 deck  │ │
│ │ 17:00 run  · 21:00 wind  │ │
│ │      [Accept plan]       │ │
│ └─────────────────────────┘ │
│ [ ✏️ message ________ ] [➤] │
└─────────────────────────────┘
```

## WF-6 Planner / Calendar
```
┌─────────────────────────────┐
│ Planner          [Week ▾][+][🔍]│
│ ┌─────────────────────────┐ │
│ │ Today · Jun 12           │ │
│ │ 07:30 ┃ Read 10m   ▥▥▥   │ │
│ │ 10:00 ┃ Deck (block) ▦▦▦ │ │
│ │ 12:30 ┃ Lunch             │ │
│ │ 17:00 ┃ Run       ▤▤▤    │ │
│ │ 21:00 ┃ Wind down ▤▤     │ │
│ │   [ + Add block ]        │ │
│ └─────────────────────────┘ │
│  (drag handles right edge)  │
└─────────────────────────────┘
```

## WF-7 Insights / Scores
```
┌─────────────────────────────┐
│ Insights       [7d ▾][CSV]  │
│ Habit  88  Growth 72        │
│ Focus  64  Lifestyle 81     │
│ ┌─ [Habit Score trend ╱╱] ─┐│
│ │ ╱╱╱╱╲╲╱╱▔▔▔  +12 vs wk ││
│ │ AI: "Morning consistency  ││
│ │ drove the jump."   [Why?]││
│ └─────────────────────────┘ │
│ Heatmap (habits) ▓▓▓░▓▓▓▓░ │
│ Forecast: streak risk ▾    │
│ [Today][Planner][Coach][Insights][Profile] │
└─────────────────────────────┘
```

## WF-8 Wellness
```
┌─────────────────────────────┐
│ Wellness        [Week ▾]    │
│ Sleep 7h04 ●●○○  [edit]    │
│ Water 5/8 cups  ▓▓▓░░░░░░  │
│ Mood  Good 😌  trend ↗     │
│ Stress Medium ▂▂▄▂▅        │
│ Exercise 3 sessions         │
│ Meditation 4 · 35 min       │
│ Screen time 4h12            │
│ AI insight: "Mood dips on   │
│ low-sleep days."            │
└─────────────────────────────┘
```

## WF-9 Goals
```
┌─────────────────────────────┐
│ Goals         [ + New ]     │
│ 🏃 Run a half marathon      │
│   ▓▓▓▓▓▓▓░░░░  62%          │
│   projection: Nov 3  [AI]   │
│   ─ milestones: 3/5         │
│ 📚 Read 12 books             │
│   ▓▓▓▓░░░░░░  33%           │
│   linked habits: reading    │
└─────────────────────────────┘
```

## WF-10 Community / Feed
```
┌─────────────────────────────┐
│ Community     [+][🔍]       │
│ Friends(4)  Groups(2)       │
│ ── Challenge: "30-day walk" │
│ Sara ▓▓▓▓▓░░ 5/30 🔥        │
│ Omar ▓▓▓░░░░ 3/30           │
│ ── Feed ─────────────────── │
│ Omar completed "Walk" 👍😀  │
│ Sara shared milestone 🏅    │
│   [Reply] [React] [Report]  │
└─────────────────────────────┘
```

## WF-11 Profile / Premium
```
┌─────────────────────────────┐
│ ← Maya           [⚙]       │
│  Lv 12 · 4,320 XP ▓▓▓▓▓░░  │
│  50/80 → next badge         │
│ ──────────                  │
│ Today · Planner · Coach     │
│ Insights · Community ·      │
│ Journal · Goals · Library   │
│ Integrations · Data · Help  │
│ ──────────                  │
│ [ ⭐ Go Premium ]           │
└─────────────────────────────┘
```

## WF-12 Paywall
```
┌─────────────────────────────┐
│ Unlock AI Coach & Analytics │
│ ✓ Unlimited habits          │
│ ✓ Advanced analytics + AI   │
│ ✓ Custom themes · Cloud sync│
│  [Monthly $9.99]            │
│  [Annual $79.99  (best)]    │
│  [Family $14.99 · 6 people] │
│ 3-day free trial · cancel any time
│  Terms · Restore purchase   │
└─────────────────────────────┘
```

## WF-13 Admin (desktop)
```
┌─────────────────────────────┐
│ Users │ Content │ Flags │ Mod │
│ Search [________]  filters  │
│ ┌────┬──────┬──────┬──────┐ │
│ │ ID │ email│ plan │ flags│ │
│ │ …  │ …    │ Pro  │ 2    │ │
│ └────┴──────┴──────┴──────┘ │
└─────────────────────────────┘
```

## UX Notes
- All destructive actions require confirmation; archive preferred over delete.
- Empty states guide with templates (never blank screens).
- Progress/streaks animate on completion (Framer Motion), respectful of
  `prefers-reduced-motion`.
- Bottom sheet for quick-log; full screen for editors.
