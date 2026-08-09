# HabitFlow — Use Cases

> Each UC lists actor, trigger, main flow, extensions, preconditions, and priority.

## UC-1 Register Account
- **Actor:** Visitor
- **Trigger:** User taps "Sign up"
- **Preconditions:** None
- **Main flow:**
  1. User chooses email+password or Google/Apple.
  2. System validates inputs (strong password, unique email).
  3. System creates account (status = PENDING_VERIFICATION).
  4. System sends verification email.
  5. User verifies email → status = ACTIVE.
  6. System routes to onboarding wizard.
- **Extensions:**
  - 2a. OAuth: system exchanges code, creates/link accounts, no email step.
  - 4a. Email failure → user can request resend; verification token expires in 24h.
- **Priority:** M

## UC-2 Login & 2FA
- **Actor:** Registered user
- **Trigger:** User opens app
- **Main flow:**
  1. User provides credentials.
  2. System verifies; if 2FA enabled, requests TOTP.
  3. System issues access + refresh tokens (device-bound).
  4. System restores session and caches recent data for offline mode.
- **Extensions:**
  - 2a. Brute force: after 5 failures → lockout + email alert.
  - 3a. Backup code accepted if TOTP lost.
- **Priority:** M

## UC-3 Create Habit
- **Actor:** User
- **Trigger:** User taps "+ Habit"
- **Main flow:**
  1. User selects template OR creates custom (name, icon, color, category).
  2. User sets schedule (daily/weekly/custom) and target.
  3. User sets difficulty and reminders (timezone-aware).
  4. System validates; creates habit; schedules next due instances.
  5. System adds to AI context (memory index update async).
- **Extensions:**
  - 2a. Custom interval rules validated against calendar edge cases.
  - 4a. Free tier habit cap reached → upgrade prompt (gated).
- **Priority:** M

## UC-4 Complete Habit (Check-in)
- **Actor:** User (device, possibly offline)
- **Trigger:** User taps checkmark / logs in offline mode
- **Main flow:**
  1. Client creates `event` (completion) with local UUID + timestamp.
  2. If offline → buffered in IndexedDB, synced later (idempotent).
  3. Server validates schedule/target; writes completion.
  4. Server recomputes streak, XP, scores (async).
  5. System evaluates badge/challenge unlock (async).
  6. UI shows confirmation + reward animation.
- **Extensions:**
  - 3a. Double-tap duplicate → idempotency key rejects.
  - 4a. Streak at risk → server enqueues AI nudge.
- **Priority:** M

## UC-5 AI Coach Conversation
- **Actor:** Pro user (Free: template coaching)
- **Trigger:** User opens Coach tab / sends message
- **Main flow:**
  1. System loads user context: profile, recent events, scores, memories (RAG).
  2. Orchestrator routes query (planning / wellbeing / motivation / analytics).
  3. Agent(s) execute tool calls against user data; grounded citations.
  4. Guardrails validate response (no medical/legal, confidence, safety).
  5. Response streamed to client; conversation + memory persisted.
- **Extensions:**
  - 3a. Tool call fails → agent retries once, then gracefully states limits.
  - 4a. Crisis keywords → system returns helpline resources instead.
  - 5a. Provider outage → fallback to rules engine responses.
- **Priority:** M

## UC-6 Daily AI Plan Generation
- **Actor:** Scheduled job / user request
- **Trigger:** 05:00 local time (or user taps "Plan my day")
- **Main flow:**
  1. Gather: incomplete tasks, habit dues, calendar events, energy forecast, load.
  2. AI generates ranked, time-blocked plan (energy-aware).
  3. Plan stored; pushed to user's planner; optional notification.
  4. User accepts/edits; feedback fed back to model.
- **Priority:** M

## UC-7 Burnout Detection & Intervention
- **Actor:** AI pipeline (weekly job)
- **Trigger:** Weekly analytics job / daily stress signals
- **Main flow:**
  1. Model evaluates stress, sleep debt, completion drop, mood trends.
  2. If risk ≥ threshold → flag `burnout_risk` with severity + drivers.
  3. System schedules interventions: reduced plan, rest blocks, coach conversation,
     no guilt nudges.
  4. User responses logged as feedback.
- **Extensions:**
  - 2a. False positive → user dismisses; model adjusts threshold.
- **Priority:** M

## UC-8 Goal Progress & Re-planning
- **Actor:** User / AI job
- **Main flow:**
  1. Linked habit/task completions roll up to goal %.
  2. On milestone due or off-track signal → AI suggests adjusted plan.
  3. User accepts/declines; decisions logged for learning.
- **Priority:** M

## UC-9 Journaling with AI Insights
- **Actor:** User
- **Main flow:**
  1. User writes entry (or voice transcribes) with mood tag.
  2. Entry saved (private by default).
  3. Async: AI extracts emotion, topics, risk signals; updates memory.
  4. Weekly journal summary generated; surfaced to user.
- **Priority:** M

## UC-10 Community Accountability
- **Actor:** User + friend/group
- **Main flow:**
  1. User sends friend request / creates group / shares habit.
  2. Recipient accepts → accountability established.
  3. Shared completions visible in scoped feed; reactions; shared challenge progress.
  4. Violation/abuse → report → moderation queue.
- **Priority:** M

## UC-11 Wearable/Calendar Sync
- **Actor:** User, external provider
- **Trigger:** OAuth connect / scheduled pull
- **Main flow:**
  1. User authorizes provider (OAuth2).
  2. Connector pulls data on schedule (or webhook).
  3. System normalizes into `events` pipeline (dedup by external IDs).
  4. Scores/AI updated; user sees data in wellness/calendar.
- **Extensions:**
  - 3a. Token expired → re-auth prompt; data gap annotated.
- **Priority:** S

## UC-12 Upgrade to Pro
- **Actor:** User
- **Main flow:**
  1. Paywall/limit triggers upgrade intent.
  2. System presents plans (monthly/annual/family).
  3. Payment via Stripe (3DS); webhook confirms.
  4. Entitlements activated immediately; receipt emailed.
- **Extensions:**
  - 3a. Payment fails → retry; trial continues.
- **Priority:** M

## UC-13 Account Deletion / Data Export (DSAR)
- **Actor:** User
- **Main flow:**
  1. User requests export → system emails JSON/CSV archive (≤48h).
  2. User requests deletion → grace period (30d reversible) → irreversible purge.
  3. Audit trail records the request (non-personal).
- **Priority:** S

## UC-14 Admin Moderation
- **Actor:** Admin/Moderator
- **Main flow:** view reports → auto/preview action (remove/hide/ban) → notify user →
  appeal path.
- **Priority:** M

## UC-15 Offline Sync Recovery
- **Actor:** Device
- **Main flow:** reconnect → replay buffered events (idempotent, ordered) → conflict
  resolution (server wins per `updated_at` + client review for key conflicts) →
  state reconciled.
- **Priority:** M
