# Stabilize HabitFlow Frontend Domain Model

## Summary

The current UI prototype has a solid visual direction, but habit configuration,
daily execution state, and selected-date state are still mixed together. This
causes recurring bugs whenever date navigation, completion toggles, analytics,
or mood behavior are changed.

This task establishes a stable frontend model around three concepts:

- `Habit`: stable configuration.
- `HabitLog`: user-entered daily progress keyed by `habitId + localDate`.
- `DailyHabitView`: a selected-day read model for rendering.

The implementation remains mock-backed until backend integration exists, but
the frontend model should match the documented API direction closely enough to
avoid another rewrite.

## Findings

### Critical

1. Habit configuration and daily state are mixed together.
   `Habit` currently stores configuration such as name, target, and schedule
   alongside daily fields such as progress and status. It is unclear which
   values belong to the habit versus one calendar date.

2. Daily derivation overwrites valid states.
   `AppNavigator` maps every missing log to `due` with zero progress. This
   erases useful completed, upcoming, missed, and partial-progress fixtures.

3. The log model cannot represent count or duration progress.
   `HabitLog` currently stores only `completed: boolean`. Habits such as
   `18/25 pages` and `55/90 min` need a numeric value.

4. Selected-day execution data leaks into unrelated screens.
   Habits management and Analytics currently receive the selected-day habit
   projection. Selecting yesterday can change what those screens show and
   which date a completion action mutates.

### High

5. `AppNavigator` owns too much domain behavior.
   Navigation, mock persistence, daily projection, selected date, mood state,
   and completion behavior are bundled together.

6. Toggle behavior is incorrect for non-checkbox habits.
   A single action currently jumps count and duration habits directly to their
   target. Checkbox, numeric, and duration habits need distinct update paths.

7. Missed and upcoming status must not become trusted client business logic.
   Status depends on recurrence, selected local date, schedule time, timezone,
   and logs. The backend should own trustworthy evaluation long term.

8. The current local-date anchor becomes stale after midnight.
   A long-running app can keep yesterday labeled as `Today` until restart.

### Medium

9. Date context is inconsistent in the UI.
   Hero and schedule headings follow the selected date, but header, mood, and
   reminder copy still contain today-specific wording.

10. Analytics can render `NaN%` for an empty habit list.

11. Today does not render the documented no-habits empty state.

12. Empty schedule periods render even when they have no habits.

13. The Today domain model lacks the documented `Anytime` period.

14. Hero `Next` content is hardcoded instead of derived from the first
    actionable habit.

15. Mood state is global instead of keyed by local date.

### Low / Structural Debt

16. `RoutinelyUI.tsx` is becoming a broad component bucket.

17. Public date callbacks still use plain `string` instead of `LocalDate`.

18. Local-date parsing lacks runtime `YYYY-MM-DD` validation.

19. Glass surface clipping is structurally fixed but still needs simulator
    verification for `card`, `nested`, `panel`, and `nav`.

20. Date rollover, log independence, and daily projection logic have no
    automated tests.

## Implementation Plan

### Phase 1: Domain Types And Date Safety

Refactor types so configuration and daily read state are separate:

```ts
type LocalDate = string;

type Habit = {
  id: string;
  name: string;
  category: string;
  timePeriod: 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';
  scheduleLabel: string;
  reminderLabel: string;
  goalType: 'checkbox' | 'numeric' | 'duration';
  target: number;
  unit: string;
  streak: number;
  accent: ColorValue;
};

type HabitLog = {
  habitId: string;
  localDate: LocalDate;
  status: 'completed' | 'skipped' | 'in_progress';
  value?: number;
  completedAt?: string;
};

type DailyHabitView = Habit & {
  progress: number;
  status: 'completed' | 'due' | 'upcoming' | 'missed';
};
```

Update `src/utils/local-date.ts`:

- Keep local parsing via `new Date(year, monthIndex, day)`.
- Add strict `YYYY-MM-DD` validation.
- Keep day shifting and display-label formatting.
- Use `LocalDate` consistently in public props and callbacks.

### Phase 2: Daily Projection Layer

Create `src/domain/daily-habits.ts`.

Add a pure projection function:

```ts
buildDailyHabitViews({
  habits,
  logs,
  selectedDate,
  currentLocalDate,
}): DailyHabitView[]
```

Behavior:

- Checkbox progress is `0` or `1`.
- Numeric and duration progress comes from `log.value`.
- Completed state is true when progress reaches target or log status is
  `completed`.
- Missing logs do not mutate habit configuration.
- Mock mode uses explicit fixture logs to preserve completed, partial,
  upcoming, and missed visual states.
- Future recurrence evaluation remains isolated so backend response mapping can
  replace it later.

Add pure update helpers:

```ts
toggleCheckboxLog(...)
incrementHabitLog(...)
setHabitLogValue(...)
```

Rules:

- Checkbox toggles complete or incomplete.
- Numeric increments without exceeding target.
- Duration uses an explicit value update path.
- Every update is scoped to `habitId + selectedDate`.

### Phase 3: State Ownership

Refactor `AppNavigator`:

- Keep only navigation-level state and mock stores.
- Store stable habits, habit logs, and mood logs.
- Keep `currentLocalDate` separate from `selectedDate`.
- Refresh `currentLocalDate` when the app returns to foreground.
- Pass selected-day projection only into Dashboard.
- Pass stable configuration into Habits management.
- Pass aggregated mock analytics into Analytics.

Do not let Habits management mutate a selected dashboard date log.

### Phase 4: Dashboard Behavior

Update Dashboard:

- Consume `DailyHabitView[]`.
- Filter empty schedule periods.
- Add `Anytime`.
- Render the documented empty state when no habits exist.
- Derive hero `Next` from the first actionable habit.
- Use selected-date-aware copy.

Copy rules:

- Use `Today schedule` for current date.
- Use `<Weekday> schedule` for other dates.
- Use `Logged for this date` instead of `Logged once today`.
- Avoid reminder strings that incorrectly hardcode `today`.

Keep the visible date strip anchored to the true current local date:

- Yesterday.
- Today.
- Tomorrow.
- Only the true current date is labeled `Today`.
- Selecting another date changes active state without shifting labels.

### Phase 5: Analytics And Mood Safety

Update Analytics:

- Guard empty lists so completion rate is always a valid percentage.
- Stop using selected-day habits as weekly analytics input.
- Use a separate aggregated mock analytics fixture until backend integration.

Update mood:

- Replace the global mood value with `MoodLog[]` keyed by `localDate`.
- Reading and editing mood affects only the selected date.

### Phase 6: Component Structure

Split `RoutinelyUI.tsx` gradually:

- Move `DashboardHero` into `src/components/dashboard/DashboardHero.tsx`.
- Move `HabitCard` into `src/components/habits/HabitCard.tsx`.
- Move `MetricCard`, `Panel`, and `SectionHeader` into focused shared files.
- Keep `GlassSurface` as the shared primitive.
- Preserve rounded clipping behavior for every glass variant.

Move one component group at a time and typecheck after each move.

## Test Plan

Add unit tests for pure logic:

- `toLocalDate()` formats local dates correctly.
- `parseLocalDate()` rejects malformed dates.
- `addDays()` handles May 31 to June 1 and year rollover.
- Date pills remain anchored to current date after selecting yesterday.
- Only the real current date receives `Today`.
- Checkbox completion persists independently per local date.
- Numeric progress increments and caps at target.
- Missing logs do not erase habit configuration.
- Empty lists produce `0%`.
- Daily projection preserves due, upcoming, missed, partial, and completed
  states.

Run:

```bash
npm run typecheck
npm test
```

Perform simulator verification:

- Tap yesterday, today, and tomorrow.
- Complete a habit on yesterday, switch away, then return.
- Confirm `Today` label never moves.
- Confirm hero, mood, reminders, metrics, and schedule share selected-date
  context.
- Confirm every `GlassSurface` variant clips correctly at rounded corners.

## Acceptance Criteria

- Habit configuration never contains selected-day execution state.
- Logs are keyed by `habitId + localDate`.
- Count and duration habits preserve partial progress.
- Dashboard date selection is coherent and timezone-safe.
- Habits management is independent from selected Dashboard date.
- Analytics never renders `NaN`.
- Empty and non-today states have accurate copy.
- Typecheck, tests, and simulator verification pass.

## Assumptions

- Backend integration is not part of this task.
- Recurrence and trustworthy status evaluation remain backend responsibilities.
- Mock fixtures should model backend-shaped data closely enough to support
  frontend development without introducing fake business rules.

## Post-Implementation Review

The main domain-model refactor has been executed and verified with:

```bash
npm run typecheck
npm test -- --runInBand
```

Current result: typecheck passes and all 10 automated tests pass.

The following findings remain before this task should be considered complete.

### Remaining Findings

1. **High: completed numeric and duration habits cannot be undone.**
   `applyHabitAction()` always increments numeric and duration logs. Once the
   target is reached, repeated taps stay capped at the target. Add an explicit
   reset or decrement path so completion can be undone from Today.

2. **Medium: rollover refresh can leave no selected date pill visible.**
   `AppNavigator` refreshes `currentLocalDate` when the app becomes active but
   does not reconcile `selectedDate`. If the user was following the previous
   current date, advance the selection to the new current date after rollover.

3. **Medium: analytics chart bypasses the screen input.**
   `AnalyticsBars` reads `analyticsSummary.bars` directly from the fixture
   module instead of receiving bars from `AnalyticsScreen`. Pass `bars` as a
   prop so chart data and metric data cannot drift apart.

4. **Low: numeric and duration accessibility labels describe the wrong action.**
   The habit-card button announces `Complete` even when it increments a count
   or adds duration. Use goal-specific labels such as `Add one` and
   `Add 15 minutes`.

5. **Low: supporting mood copy remains static fixture text.**
   Energy, stress, and supporting summary copy do not change with selected date
   or mood value. Either mark the content clearly as fixture data or derive it
   from date-keyed mood logs before backend integration.

### Follow-Up Checklist

- Add undo behavior for completed numeric and duration habits.
- Add tests for numeric and duration undo behavior.
- Reconcile `selectedDate` during foreground date rollover.
- Add a rollover test covering a selection that followed the previous current
  date.
- Pass analytics bars through component props.
- Add goal-specific accessibility labels in `HabitCard`.
- Decide whether static energy and stress fixture text should remain visible.
- Run simulator verification for dashboard date switching and all
  `GlassSurface` variants.
