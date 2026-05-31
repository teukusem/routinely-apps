import { colors } from '../theme/colors';
import { addDays, formatDayNumber, formatWeekdayShort } from '../utils/local-date';
import type {
  AnalyticsSummary,
  AppTab,
  DatePillOption,
  Habit,
  HabitLog,
  LocalDate,
  MockDailyStatusHint,
  MoodLog,
  MoodDetailFixture,
  MoodDetailView,
  NotePreview,
  TimePeriod,
} from '../types/routinely';

export const appTabs: AppTab[] = ['Dashboard', 'Habits', 'Mood', 'Notes', 'Analytics'];

export const timePeriods: TimePeriod[] = ['Morning', 'Afternoon', 'Evening', 'Anytime'];

export const initialHabits: Habit[] = [
  {
    id: 'reading',
    name: 'Read engineering book',
    category: 'Learning',
    timePeriod: 'Morning',
    scheduleLabel: '07:20',
    reminderLabel: 'Reminder 10 min before',
    goalType: 'numeric',
    target: 25,
    unit: 'pages',
    streak: 9,
    accent: colors.focus,
  },
  {
    id: 'workout',
    name: 'Strength training',
    category: 'Health',
    timePeriod: 'Morning',
    scheduleLabel: '08:00',
    reminderLabel: 'Smart reminder on',
    goalType: 'duration',
    target: 40,
    unit: 'min',
    streak: 14,
    accent: colors.success,
  },
  {
    id: 'deep-work',
    name: 'Deep work session',
    category: 'Productivity',
    timePeriod: 'Afternoon',
    scheduleLabel: '13:30',
    reminderLabel: 'Upcoming nudge enabled',
    goalType: 'duration',
    target: 90,
    unit: 'min',
    streak: 6,
    accent: colors.primary,
  },
  {
    id: 'journal',
    name: 'Evening reflection',
    category: 'Mindfulness',
    timePeriod: 'Evening',
    scheduleLabel: '21:15',
    reminderLabel: 'Reminder enabled',
    goalType: 'checkbox',
    target: 1,
    unit: 'check-in',
    streak: 4,
    accent: colors.wellness,
  },
  {
    id: 'water',
    name: 'Hydration target',
    category: 'Health',
    timePeriod: 'Anytime',
    scheduleLabel: 'Anytime',
    reminderLabel: 'Missed by 2 hours',
    goalType: 'numeric',
    target: 8,
    unit: 'glasses',
    streak: 2,
    accent: colors.warning,
  },
];

export function buildInitialHabitLogs(currentLocalDate: LocalDate): HabitLog[] {
  return [
    {
      habitId: 'reading',
      localDate: currentLocalDate,
      status: 'in_progress',
      value: 18,
    },
    {
      habitId: 'workout',
      localDate: currentLocalDate,
      status: 'completed',
      value: 40,
      completedAt: new Date().toISOString(),
    },
    {
      habitId: 'deep-work',
      localDate: currentLocalDate,
      status: 'in_progress',
      value: 55,
    },
    {
      habitId: 'water',
      localDate: currentLocalDate,
      status: 'in_progress',
      value: 3,
    },
  ];
}

export function buildInitialDailyStatusHints(currentLocalDate: LocalDate): MockDailyStatusHint[] {
  return [
    { habitId: 'journal', localDate: currentLocalDate, status: 'upcoming' },
    { habitId: 'water', localDate: currentLocalDate, status: 'missed' },
  ];
}

export function buildInitialMoodLogs(currentLocalDate: LocalDate): MoodLog[] {
  return [{ localDate: currentLocalDate, moodScore: 4 }];
}

export function buildInitialMoodDetailFixtures(currentLocalDate: LocalDate): MoodDetailFixture[] {
  return [
    {
      localDate: currentLocalDate,
      summary: 'Calm, focused.',
      energyScore: 7,
      stressScore: 3,
      note: 'Energy is better when workout happens before deep work.',
    },
  ];
}

export function getMoodDetailView(
  localDate: LocalDate,
  fixtures: MoodDetailFixture[],
  moodScore?: number,
): MoodDetailView {
  const fixture = fixtures.find((item) => item.localDate === localDate);

  if (!fixture) {
    const hasMoodScore = typeof moodScore === 'number' && moodScore > 0;

    return {
      summary: hasMoodScore
        ? `Mood score ${moodScore}/5 logged. No extra details added yet.`
        : 'No mood details logged for this date yet.',
      energyLabel: '—',
      stressLabel: '—',
      note: hasMoodScore
        ? 'Add an optional note when you want more context for this day.'
        : 'Add a mood score to capture how this day felt.',
      hasFixture: false,
    };
  }

  return {
    summary: fixture.summary,
    energyLabel: `${fixture.energyScore}/10`,
    stressLabel: `${fixture.stressScore}/10`,
    note: fixture.note,
    hasFixture: true,
  };
}

export const notes: NotePreview[] = [
  {
    id: 'note-1',
    title: 'Why reading slipped yesterday',
    body: 'Started too late after work. Move reading before checking messages.',
    linkedTo: 'Read engineering book',
  },
  {
    id: 'note-2',
    title: 'Workout energy was higher',
    body: 'Strength session felt easier after sleeping before midnight.',
    linkedTo: 'Mood log',
  },
  {
    id: 'note-3',
    title: 'Hydration recovery plan',
    body: 'Put bottle near laptop before the first deep work block.',
    linkedTo: 'Hydration target',
  },
];

export const analyticsSummary: AnalyticsSummary = {
  bars: [
    { label: 'Mon', value: 0.82 },
    { label: 'Tue', value: 0.64 },
    { label: 'Wed', value: 0.9 },
    { label: 'Thu', value: 0.72 },
    { label: 'Fri', value: 0.58 },
    { label: 'Sat', value: 0.44 },
    { label: 'Sun', value: 0.68 },
  ],
  completionRate: 68,
  currentStreakDays: 14,
  longestStreakDays: 32,
  topHabits: [
    { name: 'Strength training', tone: colors.success, value: '92%' },
    { name: 'Read engineering book', tone: colors.focus, value: '76%' },
    { name: 'Hydration target', tone: colors.warning, value: '38%' },
  ],
};

export function buildDatePills(currentLocalDate: LocalDate): DatePillOption[] {
  const options: DatePillOption[] = [];
  for (let offset = -1; offset <= 1; offset += 1) {
    const isoDate = addDays(currentLocalDate, offset);
    const label = isoDate === currentLocalDate ? 'Today' : formatWeekdayShort(isoDate);
    const value = formatDayNumber(isoDate);
    options.push({ isoDate, label, value });
  }
  return options;
}
