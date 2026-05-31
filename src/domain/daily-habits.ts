import type {
  DailyHabitView,
  Habit,
  HabitLog,
  HabitStatus,
  LocalDate,
  MockDailyStatusHint,
} from '../types/routinely';

type BuildDailyHabitViewsArgs = {
  habits: Habit[];
  logs: HabitLog[];
  selectedDate: LocalDate;
  currentLocalDate: LocalDate;
  statusHints?: MockDailyStatusHint[];
};

function logKey(habitId: string, localDate: LocalDate) {
  return `${habitId}:${localDate}`;
}

function resolveProgress(habit: Habit, log: HabitLog | undefined): number {
  if (!log) {
    return 0;
  }

  if (habit.goalType === 'checkbox') {
    return log.status === 'completed' || (log.value ?? 0) >= 1 ? 1 : 0;
  }

  return log.value ?? 0;
}

function resolveStatus({
  habit,
  log,
  progress,
  selectedDate,
  currentLocalDate,
  hint,
}: {
  habit: Habit;
  log: HabitLog | undefined;
  progress: number;
  selectedDate: LocalDate;
  currentLocalDate: LocalDate;
  hint: HabitStatus | undefined;
}): HabitStatus {
  const target = Math.max(1, habit.target);
  const isComplete = progress >= target || log?.status === 'completed';

  if (isComplete) {
    return 'completed';
  }

  if (log?.status === 'skipped') {
    return 'skipped';
  }

  if (hint) {
    return hint;
  }

  if (selectedDate > currentLocalDate) {
    return 'upcoming';
  }

  if (selectedDate < currentLocalDate) {
    return 'missed';
  }

  return 'due';
}

export function buildDailyHabitViews({
  habits,
  logs,
  selectedDate,
  currentLocalDate,
  statusHints = [],
}: BuildDailyHabitViewsArgs): DailyHabitView[] {
  const logsByKey = new Map(
    logs
      .filter((log) => log.localDate === selectedDate)
      .map((log) => [logKey(log.habitId, log.localDate), log]),
  );

  const hintsByHabitId = new Map(
    statusHints
      .filter((hint) => hint.localDate === selectedDate)
      .map((hint) => [hint.habitId, hint.status]),
  );

  return habits.map((habit) => {
    const log = logsByKey.get(logKey(habit.id, selectedDate));
    const progress = resolveProgress(habit, log);
    const status = resolveStatus({
      habit,
      log,
      progress,
      selectedDate,
      currentLocalDate,
      hint: hintsByHabitId.get(habit.id),
    });

    return {
      ...habit,
      progress,
      status,
    };
  });
}

export function findHabitLog(
  logs: HabitLog[],
  habitId: string,
  localDate: LocalDate,
): HabitLog | undefined {
  return logs.find((log) => log.habitId === habitId && log.localDate === localDate);
}

export function removeHabitLog(
  logs: HabitLog[],
  habitId: string,
  localDate: LocalDate,
): HabitLog[] {
  return logs.filter((log) => !(log.habitId === habitId && log.localDate === localDate));
}

function isLogComplete(habit: Habit, log: HabitLog): boolean {
  const target = Math.max(1, habit.target);
  const progress = resolveProgress(habit, log);
  return progress >= target || log.status === 'completed';
}

function upsertLog(
  logs: HabitLog[],
  habitId: string,
  localDate: LocalDate,
  updater: (current: HabitLog | undefined) => HabitLog | null,
): HabitLog[] {
  const index = logs.findIndex((log) => log.habitId === habitId && log.localDate === localDate);

  if (index === -1) {
    const nextLog = updater(undefined);
    return nextLog ? [...logs, nextLog] : logs;
  }

  const nextLog = updater(logs[index]);
  if (!nextLog) {
    return logs.filter((_, logIndex) => logIndex !== index);
  }

  const nextLogs = [...logs];
  nextLogs[index] = nextLog;
  return nextLogs;
}

export function toggleCheckboxLog(
  logs: HabitLog[],
  habit: Habit,
  localDate: LocalDate,
): HabitLog[] {
  return upsertLog(logs, habit.id, localDate, (current) => {
    const completed = current?.status === 'completed';

    if (completed) {
      return null;
    }

    return {
      habitId: habit.id,
      localDate,
      status: 'completed',
      value: 1,
      completedAt: new Date().toISOString(),
    };
  });
}

export function incrementHabitLog(
  logs: HabitLog[],
  habit: Habit,
  localDate: LocalDate,
  step = 1,
): HabitLog[] {
  const target = Math.max(1, habit.target);

  return upsertLog(logs, habit.id, localDate, (current) => {
    const nextValue = Math.min(target, (current?.value ?? 0) + step);
    const completed = nextValue >= target;

    if (nextValue <= 0) {
      return null;
    }

    return {
      habitId: habit.id,
      localDate,
      status: completed ? 'completed' : 'in_progress',
      value: nextValue,
      completedAt: completed ? new Date().toISOString() : current?.completedAt,
    };
  });
}

export function setHabitLogValue(
  logs: HabitLog[],
  habit: Habit,
  localDate: LocalDate,
  value: number,
): HabitLog[] {
  const target = Math.max(1, habit.target);
  const nextValue = Math.max(0, Math.min(target, value));

  return upsertLog(logs, habit.id, localDate, () => {
    if (nextValue <= 0) {
      return null;
    }

    const completed = nextValue >= target;

    return {
      habitId: habit.id,
      localDate,
      status: completed ? 'completed' : 'in_progress',
      value: nextValue,
      completedAt: completed ? new Date().toISOString() : undefined,
    };
  });
}

export function applyHabitAction(
  logs: HabitLog[],
  habit: Habit,
  localDate: LocalDate,
): HabitLog[] {
  switch (habit.goalType) {
    case 'checkbox':
      return toggleCheckboxLog(logs, habit, localDate);
    case 'numeric': {
      const currentLog = findHabitLog(logs, habit.id, localDate);
      if (currentLog && isLogComplete(habit, currentLog)) {
        return removeHabitLog(logs, habit.id, localDate);
      }
      return incrementHabitLog(logs, habit, localDate);
    }
    case 'duration': {
      const currentLog = findHabitLog(logs, habit.id, localDate);
      if (currentLog && isLogComplete(habit, currentLog)) {
        return removeHabitLog(logs, habit.id, localDate);
      }
      return incrementHabitLog(logs, habit, localDate, 15);
    }
    default:
      return logs;
  }
}

export function findFirstActionableHabit(habits: DailyHabitView[]): DailyHabitView | undefined {
  return habits.find((habit) => habit.status === 'due' || habit.status === 'missed');
}

export function completionRate(habits: DailyHabitView[]): number {
  if (habits.length === 0) {
    return 0;
  }

  const completedCount = habits.filter((habit) => habit.status === 'completed').length;
  return Math.round((completedCount / habits.length) * 100);
}
