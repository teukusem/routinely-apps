# Finish Daily Habit Interactions And Rollover

## Summary

The frontend domain-model stabilization is implemented: habit configuration is
separate from daily projections, logs are keyed by `habitId + localDate`,
date-safe helpers exist, mood logs are date-keyed, and automated tests pass.

This follow-up closes the remaining behavior and consistency gaps before the
refactor is treated as complete.

## Findings

### High

1. Completed numeric and duration habits cannot be undone.
   `src/domain/daily-habits.ts` always increments numeric and duration logs.
   Once a target is reached, repeated taps remain capped at the target.

### Medium

2. Foreground rollover can leave no selected date pill visible.
   `src/navigation/AppNavigator.tsx` refreshes `currentLocalDate` when the app
   becomes active but does not reconcile `selectedDate`. After a multi-day gap,
   the selected date can fall outside yesterday, today, and tomorrow.

3. The analytics chart bypasses screen input.
   `AnalyticsBars` reads `analyticsSummary.bars` directly from the fixture
   module instead of receiving bars from `AnalyticsScreen`.

### Low

4. Numeric and duration accessibility labels describe the wrong action.
   The habit action button announces `Complete` even when it increments a count
   or adds duration.

5. Supporting mood copy remains static fixture text.
   Energy, stress, and summary copy do not change with selected date or mood
   value.

## Implementation Plan

### 1. Daily Habit Undo Behavior

Update `src/domain/daily-habits.ts`.

- Add a helper to remove the existing log for `habitId + localDate`.
- In `applyHabitAction()`, inspect the existing log before updating.
- If a numeric or duration habit is already complete, reset its daily log so
  the user can undo completion from Today.
- If it is incomplete, keep the current increment behavior:
  - Numeric habits add `1`.
  - Duration habits add `15`.
- Keep `setHabitLogValue()` as the explicit value path for future steppers and
  timers.

### 2. Foreground Date Rollover

Extract a pure reconciliation helper, for example:

```ts
reconcileSelectedDateAfterRollover({
  previousCurrentDate,
  nextCurrentDate,
  selectedDate,
}): LocalDate
```

Rules:

- If `selectedDate === previousCurrentDate`, move selection to
  `nextCurrentDate`.
- If the user intentionally selected another date and it is still visible in
  the new date strip, preserve it.
- If the selected date is outside yesterday, today, and tomorrow after
  rollover, fall back to `nextCurrentDate`.

Use the helper inside the `AppState` foreground refresh path in
`src/navigation/AppNavigator.tsx`.

### 3. Analytics Data Flow

Update `AnalyticsBars` in `src/components/RoutinelyUI.tsx`.

- Remove the direct `analyticsSummary` import.
- Add a `bars: AnalyticsBar[]` prop.
- Render bars from the prop.
- Pass `analytics.bars` from `src/screens/AnalyticsScreen.tsx`.
- Pass the same fixture bars from `src/screens/MoodScreen.tsx` until mood trend
  has a dedicated mock dataset.

### 4. Accessibility Labels

Update `src/components/habits/HabitCard.tsx`.

- Checkbox:
  - Incomplete: `Complete <habit>`.
  - Completed: `Undo completion for <habit>`.
- Numeric:
  - Incomplete: `Add one <unit> to <habit>`.
  - Completed: `Reset progress for <habit>`.
- Duration:
  - Incomplete: `Add 15 minutes to <habit>`.
  - Completed: `Reset progress for <habit>`.

### 5. Mood Fixture Copy

Keep fixture behavior explicit and internally consistent.

- Replace free-floating hardcoded strings with a small mood fixture read model.
- Key it by `localDate`, alongside `MoodLog`.
- For dates without detail fixtures, render neutral fallback copy instead of
  reusing today's energy, stress, and note text.
- Keep backend integration out of scope.

## Test Plan

Add unit tests:

- Completed numeric habit resets when action is triggered again.
- Completed duration habit resets when action is triggered again.
- Numeric habit still increments by `1` before completion.
- Duration habit still increments by `15` before completion.
- Foreground rollover moves selection when it followed the previous current
  date.
- Foreground rollover preserves an intentionally selected visible date.
- Foreground rollover falls back to the new current date when selection becomes
  invisible.
- Analytics bars render from the supplied prop.

Run:

```bash
npm run typecheck
npm test -- --runInBand
```

Perform simulator verification:

- Increment and reset numeric and duration habits.
- Complete a habit on one date, switch dates, then return.
- Verify Today remains centered after foreground rollover.
- Verify analytics metrics and chart bars use the same fixture object.
- Verify VoiceOver labels match checkbox, numeric, and duration actions.
- Verify dashboard mood copy does not leak today's details into another date.

## Acceptance Criteria

- Completed numeric and duration habits can be reset from Today.
- Daily progress remains isolated by `habitId + localDate`.
- Foreground rollover always leaves a visible selected date.
- Analytics chart uses its input instead of importing global fixture state.
- Habit action accessibility labels accurately describe the action.
- Mood detail copy is date-aware or uses a neutral fallback.
- Typecheck, automated tests, and simulator verification pass.

## Assumptions

- Backend integration remains out of scope.
- Resetting a completed numeric or duration habit removes its local daily log.
- Increment sizes remain `1` for numeric habits and `15` for duration habits.
