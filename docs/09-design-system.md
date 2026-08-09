# HabitFlow — Design System

## 1. Tokens

### 1.1 Color
```ts
// Tailwind-friendly CSS variables (light/dark)
:root {                          // Light
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card:       0 0% 100%;
  --muted:      220 14% 96%;
  --primary:    221 83% 53%;     // indigo/blue — trust, focus
  --primary-fg: 0 0% 100%;
  --accent:     262 83% 58%;     // violet — AI/coach personality
  --success:    142 71% 45%;     // completions, streaks
  --warning:    38 92% 50%;      // reminders, at-risk
  --danger:     0 84% 60%;       // errors, burnout alerts
  --info:       199 89% 48%;
  --ring:       221 83% 53%;
}
[data-theme=dark] {              // dark
  --background: 222 47% 8%;
  --foreground: 210 40% 98%;
  --card:       222 40% 12%;
  --muted:      217 32% 17%;
  --primary:    217 91% 60%;
  --accent:     263 90% 68%;
  --success:    141 60% 48%;
  ...
}
```

### 1.2 Typography
- Font families: **Inter** (UI), **Lexend** (display/numbers) — Google Fonts,
  variable, `font-display: swap`.
- Scale (rem): display 2.25 / h1 1.875 / h2 1.5 / h3 1.25 / body 1.0 / sm 0.875 /
  xs 0.75. Line heights: display 1.15, body 1.5.
- Numbers/timer/streaks use tabular-nums.

### 1.3 Spacing & Radius
- Spacing: 4-pt scale (0,4,8,12,16,24,32,48,64).
- Radius: sm 6 / md 10 / lg 16 / full (avatars, buttons pills).
- Cards: radius lg; elevated via subtle border + shadow (no heavy shadows).

### 1.4 Elevation & Motion
- Shadows: sm/md/lg tokenized; dark mode uses border + glow instead.
- Motion (Framer Motion): 150 ms (micro), 250 ms (standard), 350 ms (enter).
- Easing: `cubic-bezier(0.22,1,0.36,1)`.
- `prefers-reduced-motion` → disable transform/parallax; keep opacity fades.

### 1.5 Iconography
- Lucide (consistent, stroke-based, 1.5px). Custom badges/gamification art.

## 2. Components (shadcn/ui baseline)
Button, Input, Textarea, Select, Checkbox, Switch, Radio, Slider, Card, Dialog,
Sheet (bottom sheets), Popover, Dropdown, Tabs, Accordion, Toast, Skeleton,
Progress, Avatar, Badge, Tooltip, Command (search), DatePicker, Calendar.

### Key custom components
- `HabitCheckButton` — large tappable check with ripple + confetti.
- `StreakChip` — fire + count; freeze indicator.
- `ScoreRing` — circular progress (habit/growth/focus/lifestyle).
- `Heatmap` — GitHub-style year grid, color-scaled.
- `TimeBlock` — draggable calendar block with resize handles.
- `AIInsightCard` — citation chips ("viewed your sleep log"), confidence tag.
- `QuickLogBar` — water/mood/sleep/energy one-tap row.
- `XpBar` / `LevelBadge` — gamification visuals.
- `PlanRow` — AI plan line items with accept/reject affordances.

## 3. States
- Every interactive element: default / hover / active / focus-visible / disabled /
  loading / error. Focus ring ≥ 2px with high contrast (WCAG AA).
- Loading skeletons over spinners for lists; optimistic UI for check-ins.

## 4. Accessibility (WCAG 2.2 AA)
- Contrast ≥ 4.5:1 (text), ≥ 3:1 (UI/graphics).
- Touch targets ≥ 44×44 px.
- Full keyboard navigation + focus management for sheets/dialogs.
- Screen-reader labels for icon-only buttons; aria-live for streaks/XP.
- Reduced-motion + forced-colors support.

## 5. Themes
- Presets: Light, Dark, System, plus **Pro custom accent + theme presets**
  (Calm/ Focus / Energy / Nature / Midnight).
- Theming via CSS variables; no runtime CSS injection (safety).

## 6. RTL & i18n
- Layout flips via `dir=rtl`; icons flip when directional.
- All strings through i18n keys; plural/date/number localization via Intl.
- Fonts include Arabic subset (Lexend supports Arabic).

## 7. Branding
- Logo: droplet + spark hybrid (habit droplet forming a growth curve).
- Tagline: "Your AI co-pilot for life."
- Voice: warm, concise, action-oriented; never guilt-based. AI coach tone
  configurable (Encouraging / Direct / Minimal).
