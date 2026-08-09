# HabitFlow — User Stories

> Format: `As a <persona>, I want <action>, so that <value>`.
> Epics map to features in 02-requirements.md. Prioritization: M/S/C (match FRs).

## Epic: Onboarding & Activation
- US-01 **M** As a new user, I want a 5-step guided onboarding (goals → habits →
  wellness baseline → AI preferences → first plan), so that my account starts with
  a tailored plan in under 3 minutes.
- US-02 **M** As a new user, I want to import habits from templates, so that I
  don't have to invent everything from scratch.
- US-03 **M** As a new user, I want to sync a wearable/calendar during onboarding,
  so that my baseline data is real from day one.
- US-04 **M** As a new user, I want an activation email, so that my account is
  verified and secure.
- US-05 **S** As a new user, I want a "cold start" estimate (sleep, water, screen
  time), so that my scores work even before I log much.

## Epic: Habits
- US-10 **M** As a user, I want to create a habit with a schedule, reminder, and
  difficulty, so that it fits my routine.
- US-11 **M** As a user, I want to check off a habit in one tap, so that logging
  takes under 5 seconds.
- US-12 **M** As a user, I want streaks and streak freezes, so that one missed day
  doesn't reset my motivation.
- US-13 **M** As a user, I want negative-habit logging ("snacks"), so that I can
  reduce what I want to cut.
- US-14 **M** As a user, I want reminders at my chosen local time, so that I don't
  forget.
- US-15 **S** As a user, I want the AI to suggest difficulty adjustments, so that
  habits stay challenging but achievable.
- US-16 **S** As a user, I want to archive rather than delete, so that history
  stays intact.

## Epic: Goals
- US-20 **M** As a user, I want SMART goals with milestones, so that big ambitions
  become trackable.
- US-21 **M** As a user, I want habits/tasks linked to goals, so that progress is
  computed automatically.
- US-22 **M** As a user, I want a projected completion date, so that I know if I'm
  on track.
- US-23 **M** As a user, I want AI re-planning suggestions when I'm off track, so
  that I can adjust before it's too late.

## Epic: Productivity
- US-30 **M** As a user, I want a daily planner with time slots, so that I can
  structure my day.
- US-31 **M** As a user, I want a calendar with time blocks I can drag, so that I
  allocate deep work and habits visually.
- US-32 **M** As a user, I want a Pomodoro timer, so that I focus in sustainable
  bursts.
- US-33 **M** As a user, I want focus mode that suppresses notifications, so that I
  protect deep work.
- US-34 **M** As a user, I want the AI to auto-block unplanned tasks, so that my
  plan is complete without manual effort.
- US-35 **S** As a user, I want my calendar to sync with Google/Apple/Outlook, so
  that everything is in one place.

## Epic: Wellness
- US-40 **M** As a user, I want one-tap logging for sleep, water, mood, exercise,
  stress, so that tracking is effortless.
- US-41 **M** As a user, I want AI insights linking my sleep/mood/productivity, so
  that I understand root causes.
- US-42 **M** As a user, I want meditation and reading logs, so that I see
  consistency in mental habits.
- US-43 **S** As a user, I want wearable sync, so that my logs are automatic.

## Epic: Journaling
- US-50 **M** As a user, I want to journal with mood and templates, so that
  reflection is quick.
- US-51 **M** As a user, I want the AI to summarize my entries and detect mood
  trends, so that I gain insight without effort.
- US-52 **S** As a user, I want private-by-default entries, so that my thoughts are
  safe.

## Epic: Analytics & AI Coach
- US-60 **M** As a user, I want composite scores and trends, so that I can see
  progress at a glance.
- US-61 **M** As a user, I want an AI coach that answers in plain language using my
  real data, so that advice is concrete.
- US-62 **M** As a user, I want a daily AI plan and weekly review, so that I always
  know the next best action.
- US-63 **M** As a user, I want burnout warnings, so that I can protect my wellbeing
  before crashing.
- US-64 **M** As a user, I want AI to explain score changes, so that I trust the
  numbers.
- US-65 **M** As a user, I want the AI to remember context across conversations, so
  that it doesn't repeat questions.

## Epic: Gamification & Community
- US-70 **M** As a user, I want XP, levels, badges, and challenges, so that staying
  consistent feels rewarding.
- US-71 **M** As a user, I want friends and accountability groups, so that I stay
  committed.
- US-72 **M** As a user, I want shared challenges, so that we motivate each other.
- US-73 **M** As a user, I want a privacy-controlled feed, so that I share only
  what I choose.
- US-74 **S** As a user, I want to redeem rewards/streak freezes, so that
  gamification has tangible value.

## Epic: Monetization & Platform
- US-80 **M** As a user, I want a free tier with clear limits, so that I can try
  the product.
- US-81 **M** As a Pro user, I want unlimited habits, premium AI, advanced
  analytics, themes, and cloud sync, so that the subscription is worth it.
- US-82 **M** As a user, I want the app to work offline, so that I can log anywhere.
- US-83 **M** As a user, I want push reminders, so that I stay on track.
- US-84 **M** As a user, I want to switch languages (EN/AR), so that I use it
  comfortably.
- US-85 **S** As a user, I want data export and deletion, so that I keep control of
  my data.

## Epic: Admin & Ops (internal)
- US-90 **M** As an admin, I want feature flags and content management, so that I
  can roll out safely.
- US-91 **M** As a moderator, I want a report/moderation queue, so that the
  community stays safe.

## Acceptance Criteria Example (US-12 Streaks)
GIVEN a user has an active daily habit
WHEN the user completes the habit on a scheduled day
THEN streak increments by 1
AND the longest streak updates if exceeded
AND a miss is allowed up to `freeze_count` (from rewards) without reset
AND the AI is notified of a pending streak risk 2 days before reset.
