# Backend PRD: Routinely API And Delivery Plan

## 1. Purpose

This document defines the backend plan for **Routinely**, the current HabitFlow
mobile product. The backend must support the implemented Expo frontend first,
while preserving the broader Habitify-inspired direction described in the
project docs.

The backend owns trustworthy business behavior:

- Identity and account lifecycle.
- Habit configuration.
- Recurrence evaluation.
- Date-keyed habit progress logs.
- Daily status projection.
- Mood logs and mood details.
- Private notes and structured links.
- Analytics and streak calculations.
- Reminder configuration and notification delivery.
- Cross-device sync and conflict handling.

The frontend may optimistically render changes, but it must not become the source
of truth for recurrence, `due` / `missed` status, streaks, analytics, or reminder
eligibility.

## 2. Frontend Functionality Audit

The repository currently ships a mock-backed Expo React Native frontend. The
backend integration plan must align to the functionality that exists today
before adding speculative product surface.

### 2.1 Implemented Navigation

Current bottom tabs:

- Dashboard.
- Habits.
- Mood.
- Notes.
- Analytics.

Current settings entry:

- Profile avatar opens a settings overlay.
- Settings is not a bottom tab.

The older frontend spec still describes future Calendar and Challenges tabs.
Those are roadmap features, not Phase 1 backend requirements.

### 2.2 Dashboard

The Dashboard currently supports:

- A date strip anchored to yesterday, today, and tomorrow.
- Selected-date daily progress.
- Daily totals for completed, due, and missed habits.
- A next-action hint.
- Habit sections grouped by `Morning`, `Afternoon`, `Evening`, and `Anytime`.
- Checkbox completion.
- Numeric progress in `+1` steps.
- Duration progress in `+15 minute` steps.
- Resetting a completed numeric or duration habit.
- Date-keyed mood check-in.
- Upcoming reminder previews.
- Recent note previews and note detail.
- Empty state when no habits exist.

Backend implication:

- The API needs a selected-date dashboard read model.
- The server must return daily status and streak values.
- Habit progress writes must be idempotent and date-keyed.
- The server must preserve partial progress, not only completed state.

### 2.3 Habits Management

The Habits tab currently supports:

- Listing habits.
- Filtering by active, category, and missed state.
- Creating a habit with name, category, and time period.
- Editing name, category, and time period.
- Viewing a compact detail sheet.
- Archiving with confirmation.

The current local prototype removes the habit and its logs when archive is
pressed. The backend must **not** copy that behavior. Archive must preserve
history.

Future habit configuration already anticipated by the docs:

- Goal type and target.
- Unit.
- Explicit recurrence rule.
- Schedule time.
- Reminder rules.
- Start and optional end date.
- Restore and permanent delete behavior.

### 2.4 Mood

The Mood tab currently supports:

- One selected-date mood score from `1` to `5`.
- Updating an existing selected-date score.
- Optional detail presentation: summary, energy score, stress score, and note.
- A simple trend chart.

Backend implication:

- Mood logs are keyed by `userId + localDate`.
- Energy, stress, and note should be optional persisted fields, not fixture-only
  presentation strings.
- Mood trend analytics must have a dedicated dataset. The current frontend
  temporarily reuses generic chart fixture bars.

### 2.5 Notes

The Notes tab currently supports:

- Listing notes.
- Searching note title, body, and linked context.
- Creating a note with title and body.
- Opening note detail.
- Showing a private-note message.
- Displaying a linked context label such as a habit or mood log.

Backend implication:

- Notes are private by default.
- Search should be server-backed after persistence is introduced.
- Links must be structured foreign keys, not only a free-form `linkedTo` label.

### 2.6 Analytics

The Analytics tab currently supports:

- Weekly completion rate.
- Current streak.
- Longest streak.
- Daily bars for the last seven days.
- Strongest-day highlight.
- Habit performance ranking.

Backend implication:

- Analytics are derived from recurrence-aware scheduled occurrences and habit
  logs.
- Completion rate must not count days when a habit was not scheduled.
- Streak definitions must be explicit before implementation.

### 2.7 Settings And Account Surface

The settings UI currently exposes:

- Profile display with name, email, initials, and free-plan badge.
- Edit profile.
- Timezone display.
- Update email.
- Change password.
- Log out.
- Delete account confirmation.
- Future placeholders for notifications, appearance, privacy, sync and backup,
  help, and about.

Backend implication:

- Profile, email, password, logout, and account deletion belong in Phase 1.
- Notification preferences, export, device sync, and privacy controls follow in
  Phase 2.
- Appearance, help, and about are primarily client-owned.

## 3. Scope And Delivery Boundaries

### Phase 1: Integrate The Current Frontend

Build now:

- Auth and session management.
- Profile, email, password, logout, and account deletion request.
- Habit CRUD, archive, and restore.
- Explicit recurrence rules for daily and weekday habits.
- Date-keyed habit-log upsert and reset.
- Dashboard selected-date read model.
- A stable dashboard reminder-preview contract. Preview data may be empty until
  reminder configuration ships.
- Mood log upsert and retrieval.
- Notes create, list, detail, search, update, and delete.
- Weekly analytics summary.
- Unit, integration, and API contract tests.

### Phase 2: Reliability And Settings Completion

Build after Phase 1 is stable:

- Per-habit and global reminder configuration.
- Device registration and push token lifecycle.
- Quiet hours and notification preferences.
- Reminder job scheduling and delivery tracking.
- Cached reads and offline mutation queue support.
- Cross-device change feed and conflict handling.
- Data export.
- Account deletion execution after grace period.

### Phase 3: Broader Product Roadmap

Keep compatible, but do not block Phase 1:

- Advanced recurrence such as times per week and times per month.
- Calendar range and heatmap endpoints.
- Habit-specific analytics.
- Mood correlation analytics.
- Subscription entitlements.
- Challenges and leaderboards.
- Health, calendar, and automation integrations.

## 4. Recommended Architecture

Start with a modular monolith. Do not split into microservices.

Recommended stack:

- NestJS.
- PostgreSQL.
- Prisma or Drizzle.
- Redis only when jobs, rate limits, or caching require it.
- BullMQ when notification and export jobs are introduced.
- APNs and FCM through Expo Push Service initially.
- Sentry for backend error monitoring.
- OpenAPI generation for client contract visibility.

Suggested modules:

```text
src/
  modules/
    auth/
    users/
    habits/
    habit-logs/
    dashboard/
    mood-logs/
    notes/
    analytics/
    reminders/       # Phase 2
    devices/         # Phase 2
    sync/            # Phase 2
    exports/         # Phase 2
  shared/
    local-date/
    idempotency/
    pagination/
    errors/
```

Why modular monolith first:

- The core domains share transactional data.
- The first engineering risk is correctness, not independent scaling.
- Recurrence, logs, dashboard, and analytics need one consistent model.
- Modules can be separated later if traffic or team ownership demands it.

## 5. Core Backend Principles

- Habit configuration and daily execution state are separate concepts.
- Habit logs are the durable source of truth for user-entered progress.
- Scheduled occurrences are derived from recurrence rules and local dates.
- Daily statuses are server-owned read-model values.
- Store timestamps as UTC instants.
- Store user-facing calendar dates as validated `YYYY-MM-DD` local dates.
- Store IANA timezone names such as `Asia/Jakarta`.
- Make mutation retries safe through idempotency keys or absolute-value upserts.
- Archive configuration without destroying history.
- Calculate analytics correctly before adding caches.
- Treat notes as private user data.

## 6. Canonical Domain Model

The current frontend types are useful mock shapes, but they contain display
labels such as `scheduleLabel` and `reminderLabel`. The backend should store
structured values and return formatted labels only as read-model conveniences.

### 6.1 User

```ts
type User = {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  timezone: string; // IANA timezone
  createdAt: Date;
  updatedAt: Date;
  deletionRequestedAt?: Date;
  deletedAt?: Date;
};
```

### 6.2 Session

```ts
type Session = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
```

### 6.3 Habit

```ts
type HabitGoalType = 'checkbox' | 'numeric' | 'duration';
type TimePeriod = 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';

type Habit = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  timePeriod: TimePeriod;
  goalType: HabitGoalType;
  target: number;
  unit: string;
  frequencyRule: HabitFrequencyRule;
  scheduleTime?: string; // HH:mm local wall-clock time
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};
```

Initial recurrence support:

```ts
type HabitFrequencyRule =
  | { type: 'daily' }
  | { type: 'weekdays'; daysOfWeek: number[] };
```

Roadmap-compatible recurrence support:

```ts
type FutureHabitFrequencyRule =
  | { type: 'times_per_week'; count: number }
  | { type: 'times_per_month'; count: number };
```

Trade-off:

- `daily` and `weekdays` have deterministic due dates and are safe for Phase 1.
- `times_per_week` and `times_per_month` require a product decision about when
  the UI should display `due`, `missed`, or still-available capacity.

### 6.4 HabitLog

```ts
type HabitLogStatus = 'in_progress' | 'completed' | 'skipped';

type HabitLog = {
  id: string;
  userId: string;
  habitId: string;
  localDate: string; // YYYY-MM-DD in the user's active timezone
  status: HabitLogStatus;
  value?: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};
```

Unique constraint:

- `userId + habitId + localDate`.

Rules:

- Checkbox habits store `value = 1` when completed.
- Numeric and duration habits may be `in_progress`.
- Progress is complete when `value >= habit.target`.
- Reset removes the log for that local date or records a tombstone in the sync
  feed.
- Skipped is explicit and is not equivalent to missed.

### 6.5 DailyHabitView

`DailyHabitView` is a response model, not a database table.

```ts
type DailyHabitStatus = 'completed' | 'due' | 'upcoming' | 'missed' | 'skipped';

type DailyHabitView = {
  id: string;
  name: string;
  category: string;
  timePeriod: TimePeriod;
  scheduleTime?: string;
  scheduleLabel: string;
  reminderLabel?: string;
  goalType: HabitGoalType;
  target: number;
  unit: string;
  progress: number;
  status: DailyHabitStatus;
  currentStreakDays: number;
};
```

### 6.6 MoodLog

```ts
type MoodLog = {
  id: string;
  userId: string;
  localDate: string;
  moodScore: 1 | 2 | 3 | 4 | 5;
  energyScore?: number; // 1..10
  stressScore?: number; // 1..10
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};
```

Unique constraint:

- `userId + localDate`.

### 6.7 Note

```ts
type NoteLinkType = 'habit' | 'habit_log' | 'mood_log';

type Note = {
  id: string;
  userId: string;
  title: string;
  body: string;
  localDate?: string;
  linkType?: NoteLinkType;
  habitId?: string;
  habitLogId?: string;
  moodLogId?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};
```

Rules:

- A note may be standalone.
- A linked note must reference an entity owned by the same user.
- `linkedToLabel` is generated for display and is not the persisted relationship.

### 6.8 ReminderRule

Phase 2:

```ts
type ReminderRule = {
  id: string;
  userId: string;
  habitId?: string;
  type: 'habit' | 'global_daily';
  time: string; // HH:mm local wall-clock time
  timezone: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```

### 6.9 Device

Phase 2:

```ts
type Device = {
  id: string;
  userId: string;
  platform: 'ios' | 'android';
  pushToken?: string;
  timezone: string;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
```

## 7. API Surface

Use `/v1` from the first public backend release.

### 7.1 Auth And Account

- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `GET /v1/auth/session`
- `PATCH /v1/me`
- `PATCH /v1/me/email`
- `PATCH /v1/me/password`
- `POST /v1/me/delete-request`

Phase 2:

- `POST /v1/me/delete-request/cancel`
- `GET /v1/me/export`

### 7.2 Habits

- `POST /v1/habits`
- `GET /v1/habits?lifecycle=active|archived&category=Health&date=YYYY-MM-DD&dailyStatus=missed`
- `GET /v1/habits/:habitId`
- `PATCH /v1/habits/:habitId`
- `POST /v1/habits/:habitId/archive`
- `POST /v1/habits/:habitId/restore`
- `DELETE /v1/habits/:habitId`

Permanent delete should be a deliberate later decision. Prefer archive in the
initial mobile UI.

Habit-list responses return stable configuration by default. When `date` is
provided, each list item may include a daily projection so the current Habits
tab can render progress and support its `Missed` filter without mixing daily
state into the persisted `Habit` entity.

### 7.3 Habit Logs

- `PUT /v1/habits/:habitId/logs/:localDate`
- `DELETE /v1/habits/:habitId/logs/:localDate`
- `GET /v1/habits/:habitId/logs?from=YYYY-MM-DD&to=YYYY-MM-DD`

Recommended write body:

```json
{
  "value": 18,
  "status": "in_progress",
  "mutationId": "client-generated-uuid"
}
```

Use absolute values, not server-side `increment` commands, for retries. A
replayed mobile request must not add progress twice.

### 7.4 Dashboard

- `GET /v1/dashboard?date=YYYY-MM-DD`

Recommended response:

```ts
type DashboardResponse = {
  localDate: string;
  timezone: string;
  habits: DailyHabitView[];
  summary: {
    completedCount: number;
    dueCount: number;
    missedCount: number;
    completionRate: number;
    nextHabitId?: string;
  };
  moodLog?: MoodLog;
  upcomingReminders: ReminderPreview[];
  recentNotes: NotePreview[];
};
```

Why use a dashboard endpoint:

- The screen needs one coherent date-scoped snapshot.
- It reduces request waterfalls on mobile.
- It keeps recurrence, status, streak, and summary calculations consistent.

### 7.5 Mood Logs

- `PUT /v1/mood-logs/:localDate`
- `GET /v1/mood-logs?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /v1/mood-logs/:localDate`
- `DELETE /v1/mood-logs/:localDate`

### 7.6 Notes

- `POST /v1/notes`
- `GET /v1/notes?q=keyword&localDate=YYYY-MM-DD&habitId=UUID&cursor=...`
- `GET /v1/notes/:noteId`
- `PATCH /v1/notes/:noteId`
- `DELETE /v1/notes/:noteId`

### 7.7 Analytics

- `GET /v1/analytics/weekly?anchorDate=YYYY-MM-DD`

Recommended response:

```ts
type WeeklyAnalyticsResponse = {
  from: string;
  to: string;
  completionRate: number;
  currentStreakDays: number;
  longestStreakDays: number;
  bars: { localDate: string; label: string; value: number }[];
  topHabits: {
    habitId: string;
    name: string;
    completionRate: number;
  }[];
};
```

Phase 3:

- `GET /v1/analytics/habits/:habitId`
- `GET /v1/analytics/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /v1/analytics/mood-trend?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /v1/analytics/mood-correlation?from=YYYY-MM-DD&to=YYYY-MM-DD`

### 7.8 Reminders And Devices

Phase 2:

- `POST /v1/reminders`
- `GET /v1/reminders`
- `PATCH /v1/reminders/:reminderId`
- `DELETE /v1/reminders/:reminderId`
- `POST /v1/devices/register`
- `PATCH /v1/devices/:deviceId`
- `DELETE /v1/devices/:deviceId`

## 8. Service Responsibilities

### 8.1 Recurrence Service

Responsibilities:

- Validate recurrence rules.
- Determine whether a habit is scheduled on a local date.
- Expand scheduled occurrences for an analytics range.
- Respect habit start date, end date, and archive timestamp.
- Avoid generating occurrences before habit creation.

Phase 1 test cases:

- Daily habit.
- Weekday habit across Sunday and Monday boundaries.
- Leap day and month boundary.
- Habit created mid-week.
- Habit archived mid-week.
- User timezone changed after logs already exist.

### 8.2 Daily Projection Service

Responsibilities:

- Combine scheduled habits and logs for one local date.
- Return progress and status.
- Return due, missed, upcoming, completed, and skipped states.
- Produce dashboard summary counts and next actionable habit.

Status rule warning:

- `upcoming`, `due`, and `missed` depend on schedule time and timezone.
- If a habit has no schedule time, define product behavior explicitly. A safe
  Phase 1 default is `due` during the selected current date and `missed` after
  the local date ends.

### 8.3 Habit Log Service

Responsibilities:

- Validate that the habit belongs to the user.
- Validate local date and progress value.
- Upsert logs idempotently.
- Convert value to completion status consistently.
- Reset selected-date progress safely.
- Emit sync changes in Phase 2.

### 8.4 Streak Service

Responsibilities:

- Compute current streak.
- Compute longest streak.
- Ignore unscheduled dates.
- Do not count dates before the habit start date.
- Treat skipped dates according to an explicit product rule.

Open product decision:

- Does `skipped` preserve a streak, break a streak, or become excluded? Do not
  bury this policy inside implementation.

### 8.5 Analytics Service

Responsibilities:

- Compute completion rate from scheduled occurrences and logs.
- Aggregate daily bars.
- Rank habits.
- Return streak metrics.
- Add habit detail, calendar, mood trends, and mood correlations later.

### 8.6 Notes Service

Responsibilities:

- Create and update private notes.
- Validate structured note links.
- Search owned notes.
- Return generated linked-context labels for the mobile UI.

### 8.7 Notification Service

Phase 2 responsibilities:

- Schedule reminders in the user's timezone.
- Respect quiet hours and disabled reminders.
- Recalculate jobs after timezone changes.
- Send push notifications.
- Record attempted, delivered, opened, and failed events where supported.
- Prevent duplicate sends.

## 9. Timezone And Local-Date Rules

Timezone correctness is a first-class backend requirement.

- The user profile owns the default IANA timezone.
- Every user-facing habit occurrence uses a validated local date.
- All event timestamps are stored in UTC.
- Habit logs persist the local date used when the action occurred.
- Changing a timezone does not rewrite historical log local dates.
- Dashboard requests include `date=YYYY-MM-DD`.
- Dashboard responses include both `localDate` and the timezone used.
- Reminder times are local wall-clock values plus an IANA timezone.
- Analytics buckets use user-local dates, not UTC day boundaries.

## 10. Sync And Conflict Rules

Phase 1 should make future sync possible even if offline writes are deferred.

- Give mutable records `updatedAt` and `version`.
- Accept a client-generated `mutationId` for habit-log writes.
- Make `PUT habit log` an idempotent absolute-state write.
- Make `DELETE habit log` idempotent.
- Use archive instead of destructive history removal.

Phase 2 conflict rules:

- Habit configuration: reject stale versions or use last-write-wins with an
  explicit server timestamp.
- Habit logs: merge by `habitId + localDate`, with the newest accepted absolute
  state winning.
- Mood logs: merge by `userId + localDate`.
- Notes: reject stale versions to avoid silently overwriting private text.
- Deletions: emit tombstones so offline devices do not resurrect removed data.

## 11. Database Constraints And Indexes

Required constraints:

- Unique normalized user email.
- Unique `habit_logs(user_id, habit_id, local_date)`.
- Unique `mood_logs(user_id, local_date)`.
- Foreign keys for every owned relationship.
- Check constraints for mood, energy, and stress ranges.
- Check constraints for positive habit targets.

Required indexes:

- `habits(user_id, archived_at)`.
- `habit_logs(user_id, local_date)`.
- `habit_logs(habit_id, local_date)`.
- `mood_logs(user_id, local_date)`.
- `notes(user_id, created_at desc)`.
- Search index for note title and body when server-backed search ships.

## 12. Security And Privacy

- Scope every query by authenticated `userId`.
- Hash passwords with Argon2id or bcrypt using an appropriate work factor.
- Store refresh-token hashes, not raw refresh tokens.
- Rotate refresh tokens.
- Revoke sessions on logout and password change.
- Rate-limit login, password, and email-change endpoints.
- Require password re-authentication for email change and account deletion.
- Treat notes as sensitive private content.
- Redact note bodies and auth tokens from logs and error monitoring.
- Encrypt backups and transport.
- Define an account-deletion grace period before irreversible deletion.

## 13. Implementation Plan

### Milestone 0: Contract Baseline

- Confirm Phase 1 recurrence scope: `daily` and `weekdays`.
- Decide skipped-day streak semantics.
- Generate OpenAPI schemas for Phase 1 endpoints.
- Define a shared response-error shape.
- Add backend repository structure and local PostgreSQL setup.

Exit criteria:

- Frontend and backend agree on request and response types.
- Open decisions are recorded before coding business logic.

### Milestone 1: Auth And Profile

- Implement user registration and login.
- Implement access and refresh sessions.
- Add session retrieval and logout.
- Add profile update, email update, and password update.
- Add account deletion request.

Exit criteria:

- Settings account flows can replace mock alerts.
- Tests cover session rotation, revocation, ownership, and deleted-account login.

### Milestone 2: Habit Configuration And Logs

- Implement habit CRUD, archive, and restore.
- Implement recurrence validation.
- Implement date-keyed habit-log upsert and reset.
- Preserve partial numeric and duration values.
- Add idempotency handling for repeated writes.

Exit criteria:

- Checkbox, numeric, and duration interactions can persist safely.
- Archiving a habit never deletes history.

### Milestone 3: Dashboard Read Model

- Implement recurrence evaluation.
- Implement selected-date daily projection.
- Compute progress, status, streak, summary counts, and next action.
- Include selected-date mood log, reminder previews, and recent notes.
- Keep the reminder-preview response shape stable even if previews are empty
  until Phase 2 reminder configuration is implemented.
- Add timezone edge-case tests.

Exit criteria:

- The frontend can replace `buildDailyHabitViews()` and mock fixtures with one
  dashboard query.
- Daily state remains correct across date navigation and app foreground rollover.

### Milestone 4: Mood And Notes

- Implement mood upsert, get, range list, and delete.
- Persist optional energy, stress, and mood note values.
- Implement notes CRUD, structured links, pagination, and search.
- Return note preview labels for mobile display.

Exit criteria:

- Mood and Notes tabs no longer depend on local fixture arrays.
- Dashboard recent reflections use the same note records as the Notes tab.

### Milestone 5: Weekly Analytics

- Implement recurrence-aware scheduled-occurrence aggregation.
- Implement weekly bars, completion rate, streak metrics, and habit rankings.
- Add deterministic analytics fixtures and tests.

Exit criteria:

- Analytics numbers reconcile against logs for the same period.
- Empty periods return valid zero values, never `NaN`.

### Milestone 6: Phase 2 Reliability

- Add reminder rules and device registration.
- Add BullMQ reminder workers and delivery deduplication.
- Add sync change feed, record versions, and tombstones.
- Add data export.
- Execute account deletions after the grace period.

Exit criteria:

- Notification settings and sync placeholders can become real screens.
- Multi-device mutation tests pass.

## 14. Test Strategy

### Unit Tests

- Local-date validation.
- Recurrence evaluation.
- Daily status evaluation.
- Partial progress and completion thresholds.
- Streak calculation.
- Weekly analytics aggregation.
- Structured note-link validation.

### Integration Tests

- Auth session lifecycle.
- User ownership isolation.
- Habit archive preserving logs.
- Idempotent repeated habit-log write.
- Selected-date dashboard response.
- Mood uniqueness by local date.
- Notes search scoped to current user.
- Account deletion request and session revocation.

### Contract Tests

- Generate or validate OpenAPI schema.
- Test dashboard response mapping against Expo frontend types.
- Test zero-data and empty-state responses.
- Test malformed local dates and invalid IANA timezones.

### Phase 2 Reliability Tests

- Duplicate reminder-job suppression.
- Timezone change rescheduling.
- Offline replay using repeated `mutationId`.
- Stale note edit conflict.
- Tombstone handling across two devices.

## 15. Frontend Alignment Gaps To Close During Integration

These are known adapter tasks. They should not weaken the backend design.

1. The frontend `Habit` mock stores `scheduleLabel`, `reminderLabel`, `streak`,
   and visual `accent`. The server should return structured fields and computed
   read-model values; the client should own visual accents.
2. The frontend currently derives `due`, `missed`, and `upcoming` locally. That
   is acceptable for fixtures only. Replace it with dashboard response status.
3. The Habits tab currently receives a selected-date `DailyHabitView[]`. For
   integration, load stable habit configuration and request an optional daily
   projection for progress and the `Missed` filter. Do not store daily fields on
   the persisted habit.
4. Local archive currently filters out habit logs. Server archive must preserve
   logs and historical analytics.
5. Note links currently use a free-form `linkedTo` label. Replace with structured
   link IDs plus a server-generated display label.
6. Mood details are partly fixtures. Persist optional energy, stress, and note
   fields.
7. Mood trend currently reuses generic analytics bars. Add a dedicated mood
   trend endpoint when that chart becomes a real insight.
8. Reminder previews currently come from display strings on mock habits. Replace
   with structured reminder configuration in Phase 2.
9. The older frontend spec still lists Calendar and Challenges as main tabs,
   while the current app implements Habits, Mood, and Notes. Treat Calendar and
   Challenges as roadmap scope unless product direction changes.

## 16. Backend Acceptance Criteria

Phase 1 backend is ready for frontend integration when:

- User-scoped auth and account settings flows work.
- Habit CRUD, archive, and restore preserve history correctly.
- Daily and weekday recurrence rules are tested.
- Habit logs are unique by `userId + habitId + localDate`.
- Repeated habit-log writes are idempotent.
- Numeric and duration partial progress persists.
- Dashboard returns correct selected-date daily status in the user's timezone.
- Mood logs are unique by `userId + localDate`.
- Notes are private, searchable, and structurally linkable.
- Weekly analytics reconcile against scheduled occurrences and logs.
- Empty states return valid response shapes.
- OpenAPI and automated tests pass.

## 17. Senior Engineering Note

Do not start with challenges, integrations, Redis caching, or microservices.
Those are visible features or scaling tools, not the first correctness problem.

The real backend foundation is:

```text
explicit recurrence
  -> timezone-safe scheduled occurrence
  -> idempotent date-keyed progress log
  -> trustworthy daily projection
  -> trustworthy streak and analytics
  -> reliable notifications and sync
```

If that chain is weak, every later feature inherits incorrect data.
