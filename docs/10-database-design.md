# HabitFlow — Database Design & ERD

- **Engine:** PostgreSQL 16+ · **ORM:** Prisma · **Cache/queue:** Redis
- **Vector:** pgvector (extension) for AI memory embeddings.
- **Conventions:** all tables have `id` (uuid v7), `created_at`, `updated_at`
  (timestamptz, UTC). Soft-delete via `deleted_at` where noted. All user-time
  values stored as UTC instant + `tz_offset_min` when display-dependent.
- Indexing: FK indexes on every relation; partial indexes on `deleted_at IS NULL`.

## 1. ERD (mermaid)

```mermaid
erDiagram
    User ||--o{ AuthProvider : has
    User ||--o{ Subscription : has
    User ||--o{ Habit : owns
    User ||--o{ HabitCategory : owns
    User ||--o{ Goal : owns
    User ||--o{ Task : owns
    User ||--o{ CalendarEvent : owns
    User ||--o{ JournalEntry : owns
    User ||--o{ WellnessMetric : owns
    User ||--o{ Event : emits
    User ||--o{ ScoreSnapshot : receives
    User ||--o{ UserLevel : has
    User ||--o{ BadgeAward : earns
    User ||--o{ FriendRequest : sends
    User ||--o{ GroupMember : joins
    User ||--o{ AiConversation : has
    User ||--o{ AiMemory : has
    User ||--o{ IntegrationConnection : has
    User ||--o{ Notification : receives

    HabitCategory ||--o{ Habit : categorizes
    Habit ||--o{ HabitCompletion : logs
    Habit ||--o{ HabitStreak : tracks
    HabitTemplate ||--o{ Habit : instantiates
    Goal ||--o{ GoalMilestone : contains
    Goal ||--o{ GoalLink : links
    Task ||--o{ Task : subtask
    Habit ||--o{ GoalLink : "linked to goal"
    Task ||--o{ GoalLink : "linked to goal"
    CalendarEvent ||--o{ TimeBlock : extends
    Habit ||--o{ TimeBlock : blocks
    Task ||--o{ TimeBlock : blocks

    Challenge ||--o{ ChallengeParticipant : has
    Badge ||--o{ BadgeAward : granted_by
    Reward ||--o{ UserLevel : grants

    Group ||--o{ GroupMember : has
    Group ||--o{ SharedItem : shares
    FriendRequest ||--o{ User : to
    FeedPost ||--o{ Reaction : has
    FeedPost ||--o{ FeedComment : has
    FeedPost ||--o{ Report : has

    AiConversation ||--o{ AiMessage : contains
    AiMemory ||--o{ MemoryChunk : vectorized
    Event ||--o{ Event : "correlation (stream)"
    IntegrationConnection ||--o{ SyncRun : executes
    SyncRun ||--o{ Event : produces
```

## 2. Core Tables

### 2.1 Identity & Access
- **users** — id, email (unique, citext), password_hash (nullable if OAuth-only),
  display_name, avatar_url, timezone, locale, tz_offset_min, units, theme,
  status (PENDING_VERIFICATION/ACTIVE/SUSPENDED/DELETING), two_factor_secret_enc,
  two_factor_enabled, backup_codes_enc, age_verified_at, last_login_at,
  current_plan (FREE/PRO/FAMILY), onboarded_at, deleted_at.
- **auth_providers** — id, user_id FK, provider (EMAIL/GOOGLE/APPLE), provider_id,
  email, meta (JSONB), linked_at.
- **sessions** — id, user_id, refresh_token_hash, device_id, ip, user_agent,
  expires_at, revoked_at, last_seen_at.
- **password_reset_tokens**, **email_verification_tokens** — token_hash, user_id,
  expires_at, used_at.

### 2.2 Billing
- **plans** — id, code (FREE/PRO_MONTHLY/PRO_ANNUAL/FAMILY_MONTHLY/FAMILY_ANNUAL),
  name, price, currency, period, features (JSONB), sort.
- **subscriptions** — id, user_id, plan_id, stripe_customer_id,
  stripe_subscription_id, status, trial_ends_at, current_period_end, cancel_at,
  family_members (JSONB, emails invited).
- **payments** — id, subscription_id, stripe_payment_intent_id, amount, currency,
  status, paid_at, receipt_url.

### 2.3 Habits
- **habit_categories** — id, user_id, name, icon, color, sort, is_system, deleted_at.
- **habits** — id, user_id, category_id, name, description, icon, color,
  type (POSITIVE/NEGATIVE), difficulty (EASY/MEDIUM/HARD), target_qty, target_period
  (DAY/WEEK/MONTH/INTERVAL), interval_days, schedule_days (SMALLINT[] 0..6),
  remind_at_min (local minutes), reminder_enabled, streak_freeze_enabled,
  archived_at, template_id (nullable FK), source (USER/TEMPLATE/INTEGRATION).
- **habit_templates** — id, title, description, category, icon, color, difficulty,
  target_qty, target_period, schedule_days, is_premium, locale.
- **habit_completions** — id, user_id, habit_id, local_id (client-generated uuid,
  unique per user), occurred_at, qty, note, source (APP/INTEGRATION/WEBHOOK),
  idempotency_key, synced_at. Unique(user_id, idempotency_key).
- **habit_streaks** — id, user_id, habit_id, current_streak, longest_streak,
  frozen_count, last_completed_on (date), streak_start_date.

### 2.4 Goals
- **goals** — id, user_id, title, description, goal_type, start_date, end_date,
  target_metric, target_value, current_value, status (ACTIVE/AT_RISK/COMPLETED/
  ARCHIVED), smart (JSONB: specific/measurable/achievable/relevant/time_bound),
  archived_at.
- **goal_milestones** — id, goal_id, title, due_date, weight, is_completed,
  completed_at, order.
- **goal_links** — id, goal_id, entity_type (HABIT/TASK), entity_id, weight.

### 2.5 Productivity
- **tasks** — id, user_id, parent_id (subtasks), title, notes, due_date,
  due_tz_offset, priority, status (TODO/IN_PROGRESS/DONE/ARCHIVED), estimated_min,
  completed_at, recurring_rule (RRULE JSON), order, list_id, tags (text[]).
- **calendar_events** — id, user_id, provider (LOCAL/GOOGLE/APPLE/OUTLOOK),
  external_id, title, starts_at, ends_at, all_day, source_data (JSONB).
- **time_blocks** — id, user_id, habit_id (nullable), task_id (nullable),
  title, starts_at, ends_at, kind (FOCUS/DEEP_WORK/BREAK/HABIT), ai_suggested (bool).
- **pomodoro_sessions** — id, user_id, task_id, started_at, ended_at,
  focus_min, break_min, completed (bool), interruptions.
- **focus_sessions** — id, user_id, started_at, ended_at, minutes,
  mode (DEEP_WORK/FOCUS), tasks_finished, notes.

### 2.6 Wellness
- **wellness_metrics** — id, user_id, metric (SLEEP/WATER/EXERCISE/MOOD/ENERGY/
  STRESS/MEDITATION/READING/SCREEN_TIME), occurred_at (date/instant),
  value (numeric), unit, extra (JSONB, e.g. mood tags, exercise type, sleep quality),
  source (APP/INTEGRATION), external_id, unique(user_id, metric, external_id)
  for integrations.
  > One polymorphic table simplifies pipeline + AI queries; filter by metric type.

### 2.7 Journaling
- **journal_entries** — id, user_id, entry_type (DAILY/GRATITUDE/REFLECTION/FREE),
  title, body, mood (nullable scale 1–5), tags (text[]), attachment_url,
  privacy (PRIVATE/SHARED), entry_date, ai_summary (JSONB: emotion, topics, sentiment),
  is_private_note, deleted_at.

### 2.8 Unified Events & Analytics
- **events** — id (uuid v7, sortable), user_id, stream_id (session/app instance),
  type (HABIT_COMPLETED/GOAL_PROGRESS/TASK_DONE/WELLNESS_LOGGED/JOURNAL_CREATED/
  AI_PLAN_ACCEPTED/XP_EARNED/BADGE_UNLOCKED/...), entity_type, entity_id,
  occurred_at, tz_offset_min, payload (JSONB), idempotency_key (unique).
  > Drives streaks, scores, analytics, gamification, and AI context.
- **score_snapshots** — id, user_id, window (DAY/WEEK), score_type
  (HABIT/GROWTH/FOCUS/LIFESTYLE), value, components (JSONB), computed_at.
  Unique(user_id, score_type, window, period_start).
- **ai_insights** — id, user_id, kind, title, body, refs (JSONB: entity ids),
  confidence, generated_at, dismissed_at.

### 2.9 Gamification
- **user_levels** — id, user_id, level, xp, total_xp, xp_to_next, updated_at.
- **badges** — id, code, title, description, icon, criteria (JSONB), rarity.
- **badge_awards** — id, user_id, badge_id, awarded_at, shared (bool).
- **challenges** — id, owner_id, title, description, metric, target, period,
  starts_at, ends_at, kind (PERSONAL/GROUP), visibility.
- **challenge_participants** — id, challenge_id, user_id, progress, joined_at.
- **rewards** — id, code (STREAK_FREEZE/THEME/ICON), title, cost, payload (JSONB).
- **user_rewards** — id, user_id, reward_id, claimed_at, balance_before.

### 2.10 Community
- **friend_requests** — id, from_user, to_user, status, created_at, responded_at.
- **friendships** — id, user_a, user_b, created_at. (sorted pair unique)
- **groups** — id, name, avatar, description, invite_code, privacy, owner_id, created_at.
- **group_members** — id, group_id, user_id, role (OWNER/ADMIN/MEMBER), joined_at.
- **shared_items** — id, owner_id, group_id (nullable), entity_type (HABIT/GOAL),
  entity_id, visibility, created_at.
- **feed_posts** — id, user_id, group_id (nullable), type (ACHIEVEMENT/MILESTONE/
  SHARED_PROGRESS/GENERAL), title, body, refs (JSONB), created_at, deleted_at.
- **reactions** — id, post_id, user_id, type, created_at.
- **feed_comments** — id, post_id, user_id, body, created_at, deleted_at.
- **reports** — id, target_type, target_id, reporter_id, reason, status, resolved_at.

### 2.11 AI
- **ai_conversations** — id, user_id, title, pinned, created_at.
- **ai_messages** — id, conversation_id, role (USER/ASSISTANT/SYSTEM/TOOL), content,
  tool_calls (JSONB), tool_results (JSONB), model, latency_ms, tokens, created_at.
- **ai_memories** — id, user_id, kind (FACT/PREFERENCE/PATTERN/GOAL_CONTEXT),
  content, source (JSONB), importance, embedding vector(1536), created_at,
  last_accessed_at. (pgvector HNSW index.)
- **ai_jobs** — id, user_id, type (DAILY_PLAN/WEEKLY_REVIEW/MONTHLY_PLAN/BURNOUT/
  INSIGHT), status, payload, result, scheduled_for, executed_at.

### 2.12 Integrations & Platform
- **integration_connections** — id, user_id, provider
  (GOOGLE_CAL/APPLE_CAL/OUTLOOK_CAL/APPLE_HEALTH/GOOGLE_FIT/FITBIT/GARMIN/
  SAMSUNG_HEALTH/WEBHOOK), tokens_enc (JSONB), scopes, status, last_sync_at,
  created_at. Encrypted at rest.
- **sync_runs** — id, connection_id, started_at, finished_at, status, stats (JSONB).
- **sync_queue** — id, user_id, entity_type, entity_id, action, payload,
  idempotency_key, status, attempts, error, created_at, processed_at.
- **notifications** — id, user_id, type, title, body, data (JSONB), read_at,
  scheduled_for, sent_at.
- **feature_flags** — id, key, rollout (JSONB: % and user_ids), enabled, updated_at.
- **audit_logs** — id, actor_id, action, target_type, target_id, ip, meta (JSONB),
  created_at.
