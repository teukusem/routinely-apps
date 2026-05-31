# Backend PRD

## Purpose

The backend owns identity, habit configuration, recurrence evaluation,
completion logs, analytics, reminders, challenges, integrations, subscriptions,
and cross-device sync.

The backend must protect user trust. If habit history, streaks, or reminders are
wrong, the product feels broken even when the UI looks good.

## Recommended Stack

- NestJS.
- PostgreSQL.
- Prisma or Drizzle.
- Redis.
- BullMQ for background jobs.
- APNs/FCM for push notifications.
- Stripe for subscriptions.
- Sentry for errors.
- PostHog or similar product analytics.

## Core Backend Principles

- Completion logs are the source of truth.
- Recurrence rules must be explicit and testable.
- Store timestamps in UTC.
- Store and evaluate habit dates in the user's timezone.
- Make completion writes idempotent.
- Avoid deleting user history unless explicitly requested.
- Cache analytics only after correctness is established.

## Domain Entities

### User

```ts
type User = {
  id: string;
  email: string;
  name?: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};
```

### Habit

```ts
type Habit = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  categoryId?: string;
  icon?: string;
  color?: string;
  goalType: 'checkbox' | 'count' | 'duration';
  targetValue?: number;
  frequencyRule: HabitFrequencyRule;
  scheduleTime?: string;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
```

### HabitLog

```ts
type HabitLog = {
  id: string;
  userId: string;
  habitId: string;
  localDate: string;
  status: 'completed' | 'skipped';
  value?: number;
  note?: string;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
```

Unique constraint:

- `userId + habitId + localDate`.

### MoodLog

```ts
type MoodLog = {
  id: string;
  userId: string;
  localDate: string;
  moodScore: 1 | 2 | 3 | 4 | 5;
  moodLabel?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
};
```

Unique constraint:

- `userId + localDate`.

### Note

```ts
type Note = {
  id: string;
  userId: string;
  habitId?: string;
  habitLogId?: string;
  localDate?: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
};
```

### Reminder

```ts
type Reminder = {
  id: string;
  userId: string;
  habitId?: string;
  type: 'global' | 'habit';
  time: string;
  timezone: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```

### Challenge

```ts
type Challenge = {
  id: string;
  creatorId: string;
  name: string;
  description?: string;
  habitTemplate: unknown;
  startDate: string;
  endDate: string;
  visibility: 'private' | 'public';
  scoringRule: 'completion_count' | 'completion_rate' | 'streak';
  createdAt: Date;
  updatedAt: Date;
};
```

### ChallengeParticipant

```ts
type ChallengeParticipant = {
  id: string;
  challengeId: string;
  userId: string;
  score: number;
  joinedAt: Date;
};
```

### Device

```ts
type Device = {
  id: string;
  userId: string;
  platform: 'ios' | 'android' | 'web';
  pushToken?: string;
  timezone: string;
  lastSeenAt: Date;
};
```

### IntegrationAccount

```ts
type IntegrationAccount = {
  id: string;
  userId: string;
  provider: 'apple_health' | 'google_fit' | 'apple_calendar' | 'google_calendar' | 'zapier' | 'ifttt';
  status: 'connected' | 'disconnected' | 'error';
  externalAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
};
```

## API Surface

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/session`
- `POST /auth/refresh`

### Habits

- `POST /habits`
- `GET /habits`
- `GET /habits/today?date=YYYY-MM-DD`
- `GET /habits/:id`
- `PATCH /habits/:id`
- `POST /habits/:id/archive`
- `POST /habits/:id/restore`
- `DELETE /habits/:id`

### Habit Logs

- `PUT /habits/:id/logs/:localDate`
- `DELETE /habits/:id/logs/:localDate`
- `GET /habits/:id/logs`
- `GET /habit-logs?from=YYYY-MM-DD&to=YYYY-MM-DD`

### Analytics

- `GET /analytics/summary`
- `GET /analytics/habits/:id`
- `GET /analytics/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /analytics/mood-correlation`

### Mood

- `PUT /mood-logs/:localDate`
- `GET /mood-logs?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `DELETE /mood-logs/:localDate`

### Notes

- `POST /notes`
- `GET /notes`
- `PATCH /notes/:id`
- `DELETE /notes/:id`

### Reminders

- `POST /reminders`
- `GET /reminders`
- `PATCH /reminders/:id`
- `DELETE /reminders/:id`
- `POST /devices/register`

### Challenges

- `POST /challenges`
- `GET /challenges`
- `GET /challenges/:id`
- `POST /challenges/:id/join`
- `POST /challenges/:id/leave`
- `GET /challenges/:id/leaderboard`

### Integrations

- `GET /integrations`
- `POST /integrations/:provider/connect`
- `POST /integrations/:provider/disconnect`
- `POST /webhooks/:provider`

## Services

### Recurrence Service

Responsibilities:

- Determine whether a habit is due on a local date.
- Expand recurrence rules for calendar ranges.
- Handle archived habits correctly.
- Respect habit creation date.

Test cases:

- Daily habit across timezone changes.
- Weekday habit around Sunday/Monday boundaries.
- X times per week with partial completion.
- Habit archived mid-period.

### Streak Service

Responsibilities:

- Compute current streak.
- Compute longest streak.
- Handle missed days.
- Handle skipped days if skip is supported.
- Avoid counting dates before habit creation.

### Analytics Service

Responsibilities:

- Completion rate.
- Weekly/monthly/yearly aggregates.
- Habit rankings.
- Mood correlations.

### Notification Service

Responsibilities:

- Schedule reminders.
- Send push notifications.
- Handle disabled reminders.
- Handle timezone changes.
- Track notification delivery and open events.

### Integration Service

Responsibilities:

- Import health/calendar data.
- Auto-complete eligible habits.
- Prevent duplicate imports.
- Map external events to habit logs.

## Background Jobs

- Send scheduled reminders.
- Recalculate cached analytics.
- Sync integrations.
- Expire challenge windows.
- Process subscription status updates.
- Delete data after account deletion grace period.

## Timezone Rules

- User profile owns default timezone.
- Device timezone updates should be tracked.
- Habit completion uses local date in the user's active timezone at the time of action.
- All timestamps are stored in UTC.
- API responses should include localDate where user-facing date matters.

## Security And Privacy

- User can only access owned data.
- Sensitive note content should be encrypted if feasible.
- Access tokens should be short-lived.
- Refresh tokens should be revocable.
- Account deletion must delete or anonymize user-owned data.
- Export must include habits, logs, notes, moods, and challenges.

## Backend Acceptance Criteria

- Habit CRUD is user-scoped.
- Today endpoint returns correct habits for a local date.
- Completion write is idempotent.
- Streak service is covered with unit tests.
- Recurrence service is covered with edge-case tests.
- Reminder jobs do not send disabled reminders.
- Analytics numbers match completion logs.
- Deleted users cannot authenticate.
- Data export includes all user-owned core data.
