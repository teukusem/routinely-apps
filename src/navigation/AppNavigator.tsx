import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, AppState, StyleSheet, View } from 'react-native';

import { Screen } from '../components/Screen';
import { completionRate, findFirstActionableHabit } from '../domain/daily-habits';
import { reconcileSelectedDateAfterRollover } from '../domain/date-selection';
import { buildDatePills, getMoodDetailView } from '../data/routinely';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HabitsScreen } from '../screens/HabitsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MoodScreen } from '../screens/MoodScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/colors';
import { BottomNav } from './BottomNav';
import { formatLocalDateLabel, toLocalDate } from '../utils/local-date';

import { useAuthStore } from '../data/stores/auth-store';
import { useDashboard } from '../data/hooks/use-dashboard';
import { useUpsertHabitLog } from '../data/hooks/use-habit-logs';
import { useCreateHabit, useArchiveHabit, useUpdateHabit } from '../data/hooks/use-habits';
import { useUpsertMoodLog } from '../data/hooks/use-mood-logs';
import { useCreateNote, useNotes } from '../data/hooks/use-notes';
import { useWeeklyAnalytics } from '../data/hooks/use-analytics';

import type {
  AppTab,
  DailyHabitView,
  DatePillOption,
  LocalDate,
  MoodDetailView,
  NotePreview,
  TimePeriod,
} from '../types/routinely';
import type { DashboardHabit } from '../types/api';

type DateViewState = {
  currentLocalDate: LocalDate;
  selectedDate: LocalDate;
};

// ─── Helpers ────────────────────────────────────────────────────────────────────
function getCategoryAccent(category: string) {
  switch (category.toLowerCase()) {
    case 'health':
      return colors.success;
    case 'learning':
      return colors.focus;
    case 'productivity':
      return colors.primary;
    case 'mindfulness':
      return colors.wellness;
    default:
      return colors.primarySoft;
  }
}

/** Convert a backend DashboardHabit into the frontend DailyHabitView shape. */
function toDailyHabitView(habit: DashboardHabit): DailyHabitView {
  return {
    id: habit.id,
    name: habit.name,
    category: habit.category,
    timePeriod: habit.timePeriod,
    scheduleLabel: habit.scheduleLabel ?? habit.scheduleTime ?? 'Anytime',
    reminderLabel: '',
    goalType: habit.goalType,
    target: habit.target,
    unit: habit.unit,
    streak: habit.currentStreakDays,
    accent: getCategoryAccent(habit.category),
    progress: habit.progress,
    status: habit.status,
  };
}

// ─── Auth Gate ──────────────────────────────────────────────────────────────────
export function AppNavigator() {
  const { isAuthenticated, isLoading, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isLoading) {
    return (
      <Screen padded={false} safeAreaEdges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return <AuthFlow />;
  }

  return <MainApp />;
}

// ─── Auth Flow ──────────────────────────────────────────────────────────────────
function AuthFlow() {
  const [screen, setScreen] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuthStore();

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setIsLoading(true);
      try {
        await login(email, password);
      } catch (err: any) {
        setError(err?.message ?? 'Login failed. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
    },
    [login],
  );

  const handleRegister = useCallback(
    async (email: string, password: string, name?: string) => {
      setError(null);
      setIsLoading(true);
      try {
        await register(email, password, name);
      } catch (err: any) {
        setError(err?.message ?? 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [register],
  );

  if (screen === 'register') {
    return (
      <RegisterScreen
        error={error}
        isLoading={isLoading}
        onNavigateToLogin={() => {
          setError(null);
          setScreen('login');
        }}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <LoginScreen
      error={error}
      isLoading={isLoading}
      onNavigateToRegister={() => {
        setError(null);
        setScreen('register');
      }}
      onLogin={handleLogin}
    />
  );
}

// ─── Main App (authenticated) ──────────────────────────────────────────────────
function MainApp() {
  const [activeTab, setActiveTab] = useState<AppTab>('Dashboard');
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dateView, setDateView] = useState<DateViewState>(() => {
    const localDate = toLocalDate(new Date());
    return { currentLocalDate: localDate, selectedDate: localDate };
  });

  const { currentLocalDate, selectedDate } = dateView;

  // ─── Refresh date on app foreground ────────────────────────────────────────
  const refreshCurrentLocalDate = useCallback(() => {
    const nextCurrentDate = toLocalDate(new Date());
    setDateView(({ currentLocalDate: previousCurrentDate, selectedDate: sel }) => {
      if (previousCurrentDate !== nextCurrentDate) {
        return {
          currentLocalDate: nextCurrentDate,
          selectedDate: reconcileSelectedDateAfterRollover({
            previousCurrentDate,
            nextCurrentDate,
            selectedDate: sel,
          }),
        };
      }
      return { currentLocalDate: previousCurrentDate, selectedDate: sel };
    });
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') refreshCurrentLocalDate();
    });
    return () => subscription.remove();
  }, [refreshCurrentLocalDate]);

  // ─── API Queries ──────────────────────────────────────────────────────────
  const dashboardQuery = useDashboard(selectedDate);
  const notesQuery = useNotes();
  const analyticsQuery = useWeeklyAnalytics(selectedDate);

  // ─── API Mutations ────────────────────────────────────────────────────────
  const upsertHabitLog = useUpsertHabitLog();
  const createHabitMutation = useCreateHabit();
  const archiveHabitMutation = useArchiveHabit();
  const updateHabitMutation = useUpdateHabit();
  const upsertMoodLog = useUpsertMoodLog();
  const createNoteMutation = useCreateNote();
  const { logout } = useAuthStore();

  // ─── Derived data ─────────────────────────────────────────────────────────
  const datePills = useMemo<DatePillOption[]>(
    () => buildDatePills(currentLocalDate),
    [currentLocalDate],
  );

  const dailyHabits = useMemo<DailyHabitView[]>(() => {
    if (!dashboardQuery.data?.habits) return [];
    return dashboardQuery.data.habits.map(toDailyHabitView);
  }, [dashboardQuery.data?.habits]);

  const selectedDateLabel = useMemo(
    () => formatLocalDateLabel(selectedDate),
    [selectedDate],
  );

  const selectedMood = useMemo(
    () => dashboardQuery.data?.moodLog?.moodScore ?? 0,
    [dashboardQuery.data?.moodLog],
  );

  const moodDetail = useMemo<MoodDetailView>(() => {
    const moodLog = dashboardQuery.data?.moodLog;
    if (!moodLog) {
      return getMoodDetailView(selectedDate, [], selectedMood);
    }
    return {
      summary: moodLog.note ?? `Mood score ${moodLog.moodScore}/5 logged.`,
      energyLabel: moodLog.energyScore != null ? `${moodLog.energyScore}/10` : '—',
      stressLabel: moodLog.stressScore != null ? `${moodLog.stressScore}/10` : '—',
      note: moodLog.note ?? '',
      hasFixture: true,
    };
  }, [dashboardQuery.data?.moodLog, selectedDate, selectedMood]);

  const notes = useMemo<NotePreview[]>(() => {
    if (!notesQuery.data?.data) return [];
    return notesQuery.data.data.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      linkedTo: n.linkedToLabel ?? 'Manual note',
    }));
  }, [notesQuery.data?.data]);

  const analyticsSummary = useMemo(() => {
    const data = analyticsQuery.data;
    if (!data) {
      return {
        bars: [],
        completionRate: 0,
        currentStreakDays: 0,
        longestStreakDays: 0,
        topHabits: [],
      };
    }
    return {
      bars: data.bars.map((b) => ({ label: b.label, value: b.value })),
      completionRate: data.completionRate,
      currentStreakDays: data.currentStreakDays,
      longestStreakDays: data.longestStreakDays,
      topHabits: data.topHabits.map((h) => ({
        id: h.habitId,
        name: h.name,
        tone: colors.primary,
        value: `${Math.round(h.completionRate * 100)}%`,
      })),
    };
  }, [analyticsQuery.data]);

  const scheduleTitle =
    selectedDate === currentLocalDate ? 'Today schedule' : `${selectedDateLabel} schedule`;
  const headerSubcopy =
    selectedDate === currentLocalDate ? 'Today plan' : `${selectedDateLabel} plan`;
  const nextHabit = findFirstActionableHabit(dailyHabits);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  function handleSelectDate(nextDate: LocalDate) {
    setDateView((current) => ({ ...current, selectedDate: nextDate }));
  }

  function handleToggleHabit(habitId: string) {
    const habit = dailyHabits.find((h) => h.id === habitId);
    if (!habit) return;

    if (habit.goalType === 'checkbox') {
      const isCompleted = habit.status === 'completed';
      if (isCompleted) {
        // Reset: delete the log
        const { useResetHabitLog } = require('../data/hooks/use-habit-logs');
        // Simplified: toggle checkbox via upsert
        upsertHabitLog.mutate({
          habitId,
          localDate: selectedDate,
          status: 'completed',
          value: 1,
        });
      } else {
        upsertHabitLog.mutate({
          habitId,
          localDate: selectedDate,
          status: 'completed',
          value: 1,
        });
      }
    } else {
      // For numeric/duration, increment by step
      const step = habit.goalType === 'duration' ? 15 : 1;
      const nextValue = Math.min(habit.target, habit.progress + step);
      const isComplete = nextValue >= habit.target;
      upsertHabitLog.mutate({
        habitId,
        localDate: selectedDate,
        status: isComplete ? 'completed' : 'in_progress',
        value: nextValue,
      });
    }
  }

  function handleCreateHabit({
    category,
    name,
    timePeriod,
  }: {
    name: string;
    category: string;
    timePeriod: TimePeriod;
  }) {
    const trimmedCategory = category.trim() || 'General';
    const trimmedName = name.trim() || `New ${trimmedCategory} habit`;

    createHabitMutation.mutate({
      name: trimmedName,
      category: trimmedCategory,
      timePeriod,
      goalType: 'checkbox',
      target: 1,
      unit: 'check-in',
      frequencyRule: { type: 'daily' },
      startDate: currentLocalDate,
    });
  }

  function handleEditHabit({
    category,
    habitId,
    name,
    timePeriod,
  }: {
    habitId: string;
    name: string;
    category: string;
    timePeriod: TimePeriod;
  }) {
    const trimmedName = name.trim();
    const trimmedCategory = category.trim();

    // We need the habit version for optimistic locking
    const habit = dashboardQuery.data?.habits.find((h) => h.id === habitId);
    // The dashboard doesn't return version, so we use 1 as default for now
    // In a future iteration we can fetch the full habit first

    updateHabitMutation.mutate({
      id: habitId,
      input: {
        version: 1, // TODO: track version properly
        ...(trimmedName ? { name: trimmedName } : {}),
        ...(trimmedCategory ? { category: trimmedCategory } : {}),
        timePeriod,
      },
    });
  }

  function handleArchiveHabit(habitId: string) {
    archiveHabitMutation.mutate(habitId);
  }

  function handleSelectMood(moodScore: number) {
    upsertMoodLog.mutate({
      localDate: selectedDate,
      input: { moodScore },
    });
  }

  function handleCreateNote({ body, title }: { title: string; body: string }) {
    createNoteMutation.mutate({
      title: title.trim(),
      body: body.trim(),
      localDate: selectedDate,
    });
  }

  const handleOpenProfile = useCallback(() => {
    setIsSettingsOpen(true);
    setIsOverlayOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
    setIsOverlayOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    handleCloseSettings();
    logout();
  }, [handleCloseSettings, logout]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Screen padded={false} safeAreaEdges={['top', 'left', 'right']}>
      <View style={styles.content}>
        {isSettingsOpen ? (
          <SettingsScreen onClose={handleCloseSettings} onLogout={handleLogout} />
        ) : (
          renderScreen({
            activeTab,
            analytics: analyticsSummary,
            completionRate: dashboardQuery.data?.summary?.completionRate ?? completionRate(dailyHabits),
            dailyHabits,
            datePills,
            headerSubcopy,
            isLoading: dashboardQuery.isLoading,
            moodDetail,
            nextHabitName: nextHabit?.name,
            notes,
            onArchiveHabit: handleArchiveHabit,
            onCreateHabit: handleCreateHabit,
            onCreateHabitRequest: () => setActiveTab('Habits'),
            onCreateNote: handleCreateNote,
            onEditHabit: handleEditHabit,
            onOpenProfile: handleOpenProfile,
            onOverlayOpenChange: setIsOverlayOpen,
            onSelectDate: handleSelectDate,
            onSelectMood: handleSelectMood,
            onToggleHabit: handleToggleHabit,
            scheduleTitle,
            selectedDate,
            selectedDateLabel,
            selectedMood,
          })
        )}
      </View>
      {!isOverlayOpen ? <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} /> : null}
    </Screen>
  );
}

// ─── Screen Router ──────────────────────────────────────────────────────────────
type RenderScreenArgs = {
  activeTab: AppTab;
  analytics: {
    bars: { label: string; value: number }[];
    completionRate: number;
    currentStreakDays: number;
    longestStreakDays: number;
    topHabits: { id: string; name: string; tone: string; value: string }[];
  };
  completionRate: number;
  dailyHabits: DailyHabitView[];
  datePills: DatePillOption[];
  headerSubcopy: string;
  isLoading: boolean;
  moodDetail: MoodDetailView;
  nextHabitName?: string;
  notes: NotePreview[];
  onSelectDate: (localDate: LocalDate) => void;
  onSelectMood: (mood: number) => void;
  onToggleHabit: (habitId: string) => void;
  onCreateHabit: (draft: { name: string; category: string; timePeriod: TimePeriod }) => void;
  onCreateHabitRequest: () => void;
  onArchiveHabit: (habitId: string) => void;
  onEditHabit: (draft: { habitId: string; name: string; category: string; timePeriod: TimePeriod }) => void;
  onCreateNote: (draft: { title: string; body: string }) => void;
  onOpenProfile: () => void;
  onOverlayOpenChange: (isOpen: boolean) => void;
  scheduleTitle: string;
  selectedDate: LocalDate;
  selectedDateLabel: string;
  selectedMood: number;
};

function renderScreen({
  activeTab,
  analytics,
  completionRate: dailyCompletionRate,
  dailyHabits,
  datePills,
  headerSubcopy,
  isLoading,
  moodDetail,
  nextHabitName,
  notes: noteItems,
  onSelectDate,
  onSelectMood,
  onToggleHabit,
  onCreateHabit,
  onCreateHabitRequest,
  onArchiveHabit,
  onEditHabit,
  onCreateNote,
  onOpenProfile,
  onOverlayOpenChange,
  scheduleTitle,
  selectedDate,
  selectedDateLabel,
  selectedMood,
}: RenderScreenArgs) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  switch (activeTab) {
    case 'Dashboard':
      return (
        <DashboardScreen
          completionRate={dailyCompletionRate}
          dailyHabits={dailyHabits}
          datePills={datePills}
          headerSubcopy={headerSubcopy}
          moodDetail={moodDetail}
          nextHabitName={nextHabitName}
          notes={noteItems}
          onSelectDate={onSelectDate}
          onSelectMood={onSelectMood}
          onCreateHabitRequest={onCreateHabitRequest}
          onOpenProfile={onOpenProfile}
          onOverlayOpenChange={onOverlayOpenChange}
          onToggleHabit={onToggleHabit}
          scheduleTitle={scheduleTitle}
          selectedDate={selectedDate}
          selectedDateLabel={selectedDateLabel}
          selectedMood={selectedMood}
        />
      );
    case 'Habits':
      return (
        <HabitsScreen
          onOverlayOpenChange={onOverlayOpenChange}
          onOpenProfile={onOpenProfile}
        />
      );
    case 'Mood':
      return (
        <MoodScreen
          moodDetail={moodDetail}
          moodTrendBars={analytics.bars}
          onOpenProfile={onOpenProfile}
          onSelectMood={onSelectMood}
          selectedDateLabel={selectedDateLabel}
          selectedMood={selectedMood}
        />
      );
    case 'Notes':
      return (
        <NotesScreen
          notes={noteItems}
          onCreateNote={onCreateNote}
          onOpenProfile={onOpenProfile}
          onOverlayOpenChange={onOverlayOpenChange}
        />
      );
    case 'Analytics':
      return <AnalyticsScreen analytics={analytics} onOpenProfile={onOpenProfile} />;
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
