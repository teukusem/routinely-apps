import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

import { Screen } from '../components/Screen';
import {
  applyHabitAction,
  buildDailyHabitViews,
  completionRate,
  findFirstActionableHabit,
} from '../domain/daily-habits';
import { reconcileSelectedDateAfterRollover } from '../domain/date-selection';
import {
  analyticsSummary,
  buildDatePills,
  buildInitialDailyStatusHints,
  buildInitialHabitLogs,
  buildInitialMoodDetailFixtures,
  buildInitialMoodLogs,
  getMoodDetailView,
  initialHabits,
  notes,
} from '../data/routinely';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HabitsScreen } from '../screens/HabitsScreen';
import { MoodScreen } from '../screens/MoodScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { colors } from '../theme/colors';
import { BottomNav } from './BottomNav';
import { formatLocalDateLabel, toLocalDate } from '../utils/local-date';
import type { AppTab, DatePillOption, Habit, HabitLog, LocalDate, MoodLog, TimePeriod } from '../types/routinely';

type DateViewState = {
  currentLocalDate: LocalDate;
  selectedDate: LocalDate;
};

export function AppNavigator() {
  const [activeTab, setActiveTab] = useState<AppTab>('Dashboard');
  const [isHabitCreateSheetOpen, setIsHabitCreateSheetOpen] = useState(false);
  const [habits, setHabits] = useState(initialHabits);
  const [dateView, setDateView] = useState<DateViewState>(() => {
    const localDate = toLocalDate(new Date());
    return {
      currentLocalDate: localDate,
      selectedDate: localDate,
    };
  });
  const { currentLocalDate, selectedDate } = dateView;
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() => buildInitialHabitLogs(currentLocalDate));
  const [dailyStatusHints] = useState(() => buildInitialDailyStatusHints(currentLocalDate));
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(() => buildInitialMoodLogs(currentLocalDate));
  const [moodDetailFixtures] = useState(() => buildInitialMoodDetailFixtures(currentLocalDate));

  const refreshCurrentLocalDate = useCallback(() => {
    const nextCurrentDate = toLocalDate(new Date());

    setDateView(({ currentLocalDate: previousCurrentDate, selectedDate }) => {
      if (previousCurrentDate !== nextCurrentDate) {
        return {
          currentLocalDate: nextCurrentDate,
          selectedDate: reconcileSelectedDateAfterRollover({
            previousCurrentDate,
            nextCurrentDate,
            selectedDate,
          }),
        };
      }

      return {
        currentLocalDate: previousCurrentDate,
        selectedDate,
      };
    });
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refreshCurrentLocalDate();
      }
    });

    return () => subscription.remove();
  }, [refreshCurrentLocalDate]);

  const datePills = useMemo<DatePillOption[]>(
    () => buildDatePills(currentLocalDate),
    [currentLocalDate],
  );

  const dailyHabits = useMemo(
    () =>
      buildDailyHabitViews({
        habits,
        logs: habitLogs,
        selectedDate,
        currentLocalDate,
        statusHints: dailyStatusHints,
      }),
    [habits, habitLogs, selectedDate, currentLocalDate, dailyStatusHints],
  );

  const selectedDateLabel = useMemo(
    () => formatLocalDateLabel(selectedDate),
    [selectedDate],
  );

  const selectedMood = useMemo(() => {
    return moodLogs.find((log) => log.localDate === selectedDate)?.moodScore ?? 0;
  }, [moodLogs, selectedDate]);

  const moodDetail = useMemo(
    () => getMoodDetailView(selectedDate, moodDetailFixtures, selectedMood),
    [selectedDate, moodDetailFixtures, selectedMood],
  );

  const scheduleTitle =
    selectedDate === currentLocalDate ? 'Today schedule' : `${selectedDateLabel} schedule`;

  const headerSubcopy =
    selectedDate === currentLocalDate ? 'Today plan' : `${selectedDateLabel} plan`;

  const nextHabit = findFirstActionableHabit(dailyHabits);

  function handleSelectDate(nextDate: LocalDate) {
    setDateView((currentDateView) => ({
      ...currentDateView,
      selectedDate: nextDate,
    }));
  }

  function handleToggleHabit(habitId: string) {
    const habit = habits.find((item) => item.id === habitId);
    if (!habit) {
      return;
    }

    setHabitLogs((currentLogs) => applyHabitAction(currentLogs, habit, selectedDate));
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
    const trimmedCategory = category.trim();
    const nextCategory = trimmedCategory.length > 0 ? trimmedCategory : 'General';
    const trimmedName = name.trim();
    const nextName = trimmedName.length > 0 ? trimmedName : `New ${nextCategory} habit`;
    const now = Date.now();
    const countForCategory = habits.filter((habit) => habit.category === nextCategory).length;
    const accent = getCategoryAccent(nextCategory);

    const newHabit: Habit = {
      id: `${nextCategory.toLowerCase().replace(/\s+/g, '-')}-${now}`,
      name: nextName,
      category: nextCategory,
      timePeriod,
      scheduleLabel: 'Anytime',
      reminderLabel: 'Reminder off',
      goalType: 'checkbox',
      target: 1,
      unit: 'check-in',
      streak: 0,
      accent,
    };

    setHabits((currentHabits) => [...currentHabits, newHabit]);
  }

  function handleSelectMood(moodScore: number) {
    setMoodLogs((currentLogs) => {
      const index = currentLogs.findIndex((log) => log.localDate === selectedDate);

      if (index === -1) {
        return [...currentLogs, { localDate: selectedDate, moodScore }];
      }

      const nextLogs = [...currentLogs];
      nextLogs[index] = { localDate: selectedDate, moodScore };
      return nextLogs;
    });
  }

  function handleArchiveHabit(habitId: string) {
    setHabits((currentHabits) => currentHabits.filter((habit) => habit.id !== habitId));
    setHabitLogs((currentLogs) => currentLogs.filter((log) => log.habitId !== habitId));
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

    setHabits((currentHabits) =>
      currentHabits.map((habit) => {
        if (habit.id !== habitId) {
          return habit;
        }

        return {
          ...habit,
          accent: getCategoryAccent(trimmedCategory.length > 0 ? trimmedCategory : habit.category),
          category: trimmedCategory.length > 0 ? trimmedCategory : habit.category,
          name: trimmedName.length > 0 ? trimmedName : habit.name,
          timePeriod,
        };
      }),
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.content}>
        {renderScreen({
          activeTab,
          analytics: analyticsSummary,
          completionRate: completionRate(dailyHabits),
          dailyHabits,
          datePills,
          habits,
          headerSubcopy,
          moodDetail,
          nextHabitName: nextHabit?.name,
          notes,
          onSelectDate: handleSelectDate,
          onSelectMood: handleSelectMood,
          onToggleHabit: handleToggleHabit,
          onCreateHabit: handleCreateHabit,
          onArchiveHabit: handleArchiveHabit,
          onEditHabit: handleEditHabit,
          onOverlayOpenChange: setIsHabitCreateSheetOpen,
          scheduleTitle,
          selectedDate,
          selectedDateLabel,
          selectedMood,
        })}
      </View>
      {!isHabitCreateSheetOpen ? <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} /> : null}
    </Screen>
  );
}

type RenderScreenArgs = {
  activeTab: AppTab;
  analytics: typeof analyticsSummary;
  completionRate: number;
  dailyHabits: ReturnType<typeof buildDailyHabitViews>;
  datePills: DatePillOption[];
  habits: typeof initialHabits;
  headerSubcopy: string;
  moodDetail: ReturnType<typeof getMoodDetailView>;
  nextHabitName?: string;
  notes: typeof notes;
  onSelectDate: (localDate: LocalDate) => void;
  onSelectMood: (mood: number) => void;
  onToggleHabit: (habitId: string) => void;
  onCreateHabit: (draft: { name: string; category: string; timePeriod: TimePeriod }) => void;
  onArchiveHabit: (habitId: string) => void;
  onEditHabit: (draft: { habitId: string; name: string; category: string; timePeriod: TimePeriod }) => void;
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
  habits,
  headerSubcopy,
  moodDetail,
  nextHabitName,
  notes: noteItems,
  onSelectDate,
  onSelectMood,
  onToggleHabit,
  onCreateHabit,
  onArchiveHabit,
  onEditHabit,
  onOverlayOpenChange,
  scheduleTitle,
  selectedDate,
  selectedDateLabel,
  selectedMood,
}: RenderScreenArgs) {
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
          dailyHabits={dailyHabits}
          onArchiveHabit={onArchiveHabit}
          onCreateHabit={onCreateHabit}
          onOverlayOpenChange={onOverlayOpenChange}
          onEditHabit={onEditHabit}
        />
      );
    case 'Mood':
      return (
        <MoodScreen
          moodDetail={moodDetail}
          moodTrendBars={analytics.bars}
          onSelectMood={onSelectMood}
          selectedDateLabel={selectedDateLabel}
          selectedMood={selectedMood}
        />
      );
    case 'Notes':
      return <NotesScreen notes={noteItems} />;
    case 'Analytics':
      return <AnalyticsScreen analytics={analytics} />;
  }
}

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

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
