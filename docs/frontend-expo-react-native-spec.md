# Frontend Spec: Expo React Native

## Purpose

This document defines the mobile frontend for HabitFlow using Expo, React
Native, and TypeScript. It covers the app structure, screen behavior, state
ownership, navigation, offline behavior, and frontend acceptance criteria.

## Target Platform

Primary:

- iOS.

Secondary:

- Android after the core mobile experience is stable.

Expo should stay the default path unless a native integration forces a custom
development build.

## Recommended Stack

- Expo.
- React Native.
- TypeScript.
- Expo Router for routing.
- TanStack Query for server state after backend integration.
- Zustand or plain React state for client UI state.
- React Hook Form plus Zod for forms.
- MMKV for local cache/preferences.
- SQLite only if offline-first relational sync becomes required.
- Expo Notifications for local notifications and initial push integration.
- Sentry for runtime error monitoring.

## App Information Architecture

Main tabs:

- Today.
- Calendar.
- Analytics.
- Challenges.
- Settings.

Secondary screens:

- Add Habit.
- Edit Habit.
- Habit Detail.
- Mood Check-in.
- Note Editor.
- Challenge Detail.
- Integrations.
- App Lock.
- Subscription.

## Navigation Rules

- App opens to Today after onboarding/auth.
- Habit creation is accessible from Today and empty states.
- Habit Detail is opened from habit cards.
- Mood Check-in should be accessible from Today but not block habit completion.
- Settings owns preferences, reminders, integrations, privacy, and account.
- Avoid deep nested navigation in early versions.

## Screen Specs

### Onboarding

Purpose:

- Explain the app promise.
- Let user select initial goals.
- Request notification permission with context.

Required states:

- First run.
- Permission accepted.
- Permission denied.
- Skip onboarding.

### Auth

Purpose:

- Support account-based sync.

Fields:

- Email.
- Password.
- OAuth later.

Behavior:

- Persist session securely.
- Redirect authenticated user to Today.
- Redirect unauthenticated user to onboarding/login.

### Today

Purpose:

- Give the user a fast daily execution surface.

Content:

- Date header.
- Daily completion summary.
- Chronological habit sections: Morning, Afternoon, Evening, Anytime.
- Habit cards.
- Quick add button.
- Optional mood check-in prompt.

Habit card requirements:

- Habit name.
- Schedule time or "Anytime".
- Goal progress.
- Current streak.
- Complete action.
- Overflow menu for edit/archive.

States:

- No habits.
- Loading.
- Offline with cached data.
- All habits completed.
- Error loading synced data.

### Add/Edit Habit

Purpose:

- Create or update habit configuration.

Fields:

- Name.
- Description.
- Category.
- Icon.
- Color.
- Goal type.
- Target value.
- Frequency rule.
- Schedule time.
- Reminder rules.

Validation:

- Name is required.
- Target value is required for count and duration.
- At least one scheduled day is required for weekday recurrence.
- Reminder time cannot exist without reminder enabled.

### Habit Detail

Purpose:

- Show progress and manage one habit.

Content:

- Habit title.
- Current streak.
- Best streak.
- Completion rate.
- Weekly chart.
- Monthly calendar.
- Yearly heatmap.
- Recent notes.
- Edit/archive/delete actions.

### Calendar

Purpose:

- Show habit completion across dates.

Views:

- Month grid.
- Day detail.
- Habit filter.

### Analytics

Purpose:

- Help users understand consistency trends.

Widgets:

- Overall completion rate.
- Best habit.
- Weakest habit.
- Current streaks.
- Weekday performance.
- Mood correlation after mood feature exists.

### Mood Check-In

Purpose:

- Capture daily emotional state.

Fields:

- Mood score 1-5.
- Mood label.
- Optional note.

Behavior:

- One mood log per local date.
- User can edit today's mood.

### Challenges

Purpose:

- Create accountability loops.

Content:

- Active challenges.
- Public challenges.
- Private invites.
- Leaderboards.

### Settings

Sections:

- Account.
- Notifications.
- Integrations.
- Privacy.
- Data export.
- Subscription.
- Theme.
- Support.

## Frontend Domain Models

```ts
type HabitGoalType = 'checkbox' | 'count' | 'duration';

type Habit = {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  icon?: string;
  color?: string;
  goalType: HabitGoalType;
  targetValue?: number;
  frequencyRule: HabitFrequencyRule;
  scheduleTime?: string;
  reminderRules: ReminderRule[];
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
};

type HabitFrequencyRule =
  | { type: 'daily' }
  | { type: 'weekdays'; daysOfWeek: number[] }
  | { type: 'times_per_week'; count: number }
  | { type: 'times_per_month'; count: number };

type HabitLog = {
  id: string;
  habitId: string;
  localDate: string;
  status: 'completed' | 'skipped';
  value?: number;
  note?: string;
  completedAt: string;
};

type ReminderRule = {
  id: string;
  type: 'habit' | 'global';
  time: string;
  enabled: boolean;
};
```

## State Ownership

Server state:

- Habits.
- Habit logs.
- Mood logs.
- Notes.
- Challenges.
- Integrations.
- Subscription.

Client state:

- Active tab.
- Form drafts.
- Modal visibility.
- Permission prompt state.
- Theme preference.

Persistent local state:

- Auth token/session.
- Notification preference cache.
- Last successful sync timestamp.
- Offline queue if offline writes are supported.

## Offline And Sync

Initial behavior:

- Read cached data when offline.
- Disable integration-dependent actions offline.
- Queue habit completion writes once sync is supported.

Conflict strategy:

- Habit completion is keyed by `habitId + localDate`.
- Latest edit wins for habit configuration.
- Completion logs should prefer idempotent upsert behavior.

## Notification Behavior

Local notification cases:

- Per-habit reminders.
- Global daily reminder.

UX rules:

- Explain value before OS permission prompt.
- If permission is denied, show non-blocking settings hint.
- Do not nag for permission repeatedly.

## Accessibility

- WCAG 2.2 Level AA is the product baseline.
- Default iOS tap targets are at least 44 x 44 pt.
- Dynamic Type layouts remain readable with Larger Accessibility Text Sizes.
- Visible text is at least 11 pt. Small text meets 4.5:1 contrast and
  meaningful non-text boundaries meet 3:1.
- Screen reader labels, roles, and states are provided for interactive
  controls, progress bars, and chart data points.
- Charts include visible summaries and values.
- Color is never the only status indicator.
- Loading states show immediate placeholders or progress feedback instead of
  blank screens.
- All destructive actions require clear confirmation.
- Release verification includes Accessibility Inspector, VoiceOver, Full
  Keyboard Access, Switch Control, Increase Contrast, and Reduce Motion.

## Frontend Acceptance Criteria

- User can create and edit habits.
- Today shows the correct habits for the user's local date.
- User can complete a habit and see progress update immediately.
- Streak and completion state do not flicker after sync.
- Habit Detail shows trustworthy analytics.
- App handles offline cached reads gracefully.
- Notification permission flow does not block app usage.
- Empty, loading, error, and completed states are polished.
