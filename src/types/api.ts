// ─── API response types matching the backend Prisma schema & DTOs ─────────────
// These map directly to what the backend returns in { data: ... } wrappers.

// ─── Habit ──────────────────────────────────────────────────────────────────────
export type HabitFrequencyRule =
  | { type: 'daily' }
  | { type: 'weekdays'; daysOfWeek: number[] };

export type ApiHabit = {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  timePeriod: 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';
  goalType: 'checkbox' | 'numeric' | 'duration';
  target: number;
  unit: string;
  frequencyRule: HabitFrequencyRule;
  scheduleTime?: string | null;
  startDate: string;
  endDate?: string | null;
  archivedAt?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateHabitInput = {
  name: string;
  description?: string;
  category: string;
  timePeriod: 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';
  goalType: 'checkbox' | 'numeric' | 'duration';
  target: number;
  unit: string;
  frequencyRule: HabitFrequencyRule;
  scheduleTime?: string;
  startDate: string;
  endDate?: string;
};

export type UpdateHabitInput = {
  version: number;
  name?: string;
  description?: string;
  category?: string;
  timePeriod?: 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';
  goalType?: 'checkbox' | 'numeric' | 'duration';
  target?: number;
  unit?: string;
  frequencyRule?: HabitFrequencyRule;
  scheduleTime?: string;
  startDate?: string;
  endDate?: string;
};

// ─── Habit Log ──────────────────────────────────────────────────────────────────
export type ApiHabitLog = {
  id: string;
  habitId: string;
  localDate: string;
  status: 'in_progress' | 'completed' | 'skipped';
  value?: number | null;
  completedAt?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type UpsertHabitLogInput = {
  mutationId: string;
  status: 'in_progress' | 'completed' | 'skipped';
  value?: number;
};

// ─── Dashboard ──────────────────────────────────────────────────────────────────
export type DashboardHabit = {
  id: string;
  name: string;
  category: string;
  timePeriod: 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';
  scheduleTime?: string | null;
  scheduleLabel?: string;
  goalType: 'checkbox' | 'numeric' | 'duration';
  target: number;
  unit: string;
  progress: number;
  status: 'completed' | 'due' | 'upcoming' | 'missed' | 'skipped';
  currentStreakDays: number;
};

export type DashboardSummary = {
  completedCount: number;
  dueCount: number;
  missedCount: number;
  completionRate: number;
  nextHabitId?: string | null;
};

export type DashboardResponse = {
  localDate: string;
  timezone: string;
  summary: DashboardSummary;
  habits: DashboardHabit[];
  moodLog?: ApiMoodLog | null;
  upcomingReminders: unknown[];
  recentNotes: ApiNote[];
};

// ─── Mood Log ───────────────────────────────────────────────────────────────────
export type ApiMoodLog = {
  id: string;
  localDate: string;
  moodScore: number;
  energyScore?: number | null;
  stressScore?: number | null;
  note?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type UpsertMoodLogInput = {
  moodScore: number;
  energyScore?: number;
  stressScore?: number;
  note?: string;
};

// ─── Note ───────────────────────────────────────────────────────────────────────
export type ApiNote = {
  id: string;
  title: string;
  body: string;
  localDate?: string | null;
  linkType?: 'habit' | 'habit_log' | 'mood_log' | null;
  habitId?: string | null;
  habitLogId?: string | null;
  moodLogId?: string | null;
  linkedToLabel?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateNoteInput = {
  title: string;
  body: string;
  localDate?: string;
  link?: {
    type: 'habit' | 'habit_log' | 'mood_log';
    id: string;
  };
};

export type UpdateNoteInput = {
  version: number;
  title?: string;
  body?: string;
};

// ─── Analytics ──────────────────────────────────────────────────────────────────
export type WeeklyAnalyticsResponse = {
  from: string;
  to: string;
  completionRate: number;
  currentStreakDays: number;
  longestStreakDays: number;
  bars: { localDate: string; label: string; value: number }[];
  topHabits: { habitId: string; name: string; completionRate: number }[];
};

// ─── User Profile ───────────────────────────────────────────────────────────────
export type ApiUserProfile = {
  id: string;
  email: string;
  name?: string | null;
  timezone: string;
  notificationsEnabled: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  deletionRequestedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileInput = {
  name?: string;
  timezone?: string;
};

export type UpdateEmailInput = {
  email: string;
  currentPassword: string;
};

export type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
};
