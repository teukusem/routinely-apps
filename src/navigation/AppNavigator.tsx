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
import { BottomNav } from './BottomNav';
import { formatLocalDateLabel, toLocalDate } from '../utils/local-date';
import type { AppTab, DatePillOption, HabitLog, LocalDate, MoodLog } from '../types/routinely';

type DateViewState = {
  currentLocalDate: LocalDate;
  selectedDate: LocalDate;
};

export function AppNavigator() {
  const [activeTab, setActiveTab] = useState<AppTab>('Dashboard');
  const [habits] = useState(initialHabits);
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
          scheduleTitle,
          selectedDate,
          selectedDateLabel,
          selectedMood,
        })}
      </View>
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
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
      return <HabitsScreen habits={habits} />;
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

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
