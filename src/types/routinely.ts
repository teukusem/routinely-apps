import type { ColorValue } from 'react-native';

export type AppTab = 'Dashboard' | 'Habits' | 'Mood' | 'Notes' | 'Analytics';
export type HabitStatus = 'completed' | 'due' | 'upcoming' | 'missed' | 'skipped';
export type GoalType = 'checkbox' | 'numeric' | 'duration';
export type TimePeriod = 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';
export type LogStatus = 'completed' | 'skipped' | 'in_progress';

export type LocalDate = string;

export type Habit = {
  id: string;
  name: string;
  category: string;
  timePeriod: TimePeriod;
  scheduleLabel: string;
  reminderLabel: string;
  goalType: GoalType;
  target: number;
  unit: string;
  streak: number;
  accent: ColorValue;
};

export type HabitLog = {
  habitId: string;
  localDate: LocalDate;
  status: LogStatus;
  value?: number;
  completedAt?: string;
};

export type DailyHabitView = Habit & {
  progress: number;
  status: HabitStatus;
};

export type MoodLog = {
  localDate: LocalDate;
  moodScore: number;
};

export type MoodDetailFixture = {
  localDate: LocalDate;
  summary: string;
  energyScore: number;
  stressScore: number;
  note: string;
};

export type MoodDetailView = {
  summary: string;
  energyLabel: string;
  stressLabel: string;
  note: string;
  hasFixture: boolean;
};

export type MockDailyStatusHint = {
  habitId: string;
  localDate: LocalDate;
  status: HabitStatus;
};

export type NotePreview = {
  id: string;
  title: string;
  body: string;
  linkedTo: string;
};

export type AnalyticsBar = {
  label: string;
  value: number;
};

export type AnalyticsSummary = {
  bars: AnalyticsBar[];
  completionRate: number;
  currentStreakDays: number;
  longestStreakDays: number;
  topHabits: { id: string; name: string; tone: ColorValue; value: string }[];
};

export type DatePillOption = {
  isoDate: LocalDate;
  label: string;
  value: string;
};
