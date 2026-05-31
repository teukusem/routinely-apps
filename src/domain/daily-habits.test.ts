import {
  applyHabitAction,
  buildDailyHabitViews,
  completionRate,
  incrementHabitLog,
  toggleCheckboxLog,
} from '../domain/daily-habits';
import { buildInitialDailyStatusHints, buildInitialHabitLogs, initialHabits } from '../data/routinely';

const currentLocalDate = '2026-05-31';

describe('daily-habits projection', () => {
  it('preserves due, upcoming, missed, partial, and completed states', () => {
    const views = buildDailyHabitViews({
      habits: initialHabits,
      logs: buildInitialHabitLogs(currentLocalDate),
      selectedDate: currentLocalDate,
      currentLocalDate,
      statusHints: buildInitialDailyStatusHints(currentLocalDate),
    });

    expect(views.find((habit) => habit.id === 'reading')).toMatchObject({
      progress: 18,
      status: 'due',
    });
    expect(views.find((habit) => habit.id === 'workout')).toMatchObject({
      progress: 40,
      status: 'completed',
    });
    expect(views.find((habit) => habit.id === 'journal')).toMatchObject({
      progress: 0,
      status: 'upcoming',
    });
    expect(views.find((habit) => habit.id === 'water')).toMatchObject({
      progress: 3,
      status: 'missed',
    });
  });

  it('does not mutate habit configuration when logs are missing', () => {
    const views = buildDailyHabitViews({
      habits: initialHabits,
      logs: [],
      selectedDate: '2026-06-01',
      currentLocalDate,
      statusHints: [],
    });

    views.forEach((view, index) => {
      expect(view.name).toBe(initialHabits[index].name);
      expect(view.target).toBe(initialHabits[index].target);
      expect(view.progress).toBe(0);
    });
  });

  it('returns 0% for empty lists', () => {
    expect(completionRate([])).toBe(0);
  });

  it('projects skipped logs without turning them into missed days', () => {
    const views = buildDailyHabitViews({
      habits: initialHabits,
      logs: [
        {
          habitId: 'journal',
          localDate: '2026-05-30',
          status: 'skipped',
        },
      ],
      selectedDate: '2026-05-30',
      currentLocalDate,
    });

    expect(views.find((habit) => habit.id === 'journal')).toMatchObject({
      progress: 0,
      status: 'skipped',
    });
  });
});

describe('daily-habits updates', () => {
  const checkboxHabit = initialHabits.find((habit) => habit.id === 'journal')!;
  const numericHabit = initialHabits.find((habit) => habit.id === 'reading')!;
  const localDate = '2026-05-30';

  it('persists checkbox completion independently per local date', () => {
    const completed = toggleCheckboxLog([], checkboxHabit, localDate);
    const otherDay = toggleCheckboxLog(completed, checkboxHabit, '2026-05-29');

    expect(completed).toHaveLength(1);
    expect(otherDay).toHaveLength(2);
    expect(toggleCheckboxLog(completed, checkboxHabit, localDate)).toHaveLength(0);
  });

  it('increments numeric progress and caps at target', () => {
    let logs = incrementHabitLog([], numericHabit, localDate, 10);
    logs = incrementHabitLog(logs, numericHabit, localDate, 20);

    expect(logs[0]).toMatchObject({
      value: 25,
      status: 'completed',
    });
  });

  it('uses distinct update paths by goal type', () => {
    const durationHabit = initialHabits.find((habit) => habit.id === 'deep-work')!;
    const durationLogs = applyHabitAction([], durationHabit, localDate);
    const numericLogs = applyHabitAction([], numericHabit, localDate);

    expect(durationLogs[0]?.value).toBe(15);
    expect(numericLogs[0]?.value).toBe(1);
  });

  it('increments numeric progress by 1 before completion', () => {
    let logs = applyHabitAction([], numericHabit, localDate);
    logs = applyHabitAction(logs, numericHabit, localDate);

    expect(logs[0]?.value).toBe(2);
    expect(logs[0]?.status).toBe('in_progress');
  });

  it('increments duration progress by 15 before completion', () => {
    const durationHabit = initialHabits.find((habit) => habit.id === 'deep-work')!;
    let logs = applyHabitAction([], durationHabit, localDate);
    logs = applyHabitAction(logs, durationHabit, localDate);

    expect(logs[0]?.value).toBe(30);
    expect(logs[0]?.status).toBe('in_progress');
  });

  it('resets a completed numeric habit when action is triggered again', () => {
    let logs = incrementHabitLog([], numericHabit, localDate, 25);
    logs = applyHabitAction(logs, numericHabit, localDate);

    expect(logs).toHaveLength(0);
  });

  it('resets a completed duration habit when action is triggered again', () => {
    const durationHabit = initialHabits.find((habit) => habit.id === 'workout')!;
    let logs = incrementHabitLog([], durationHabit, localDate, 40);
    logs = applyHabitAction(logs, durationHabit, localDate);

    expect(logs).toHaveLength(0);
  });
});
