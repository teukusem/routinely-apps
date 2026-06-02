import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DashboardEmptyState } from '../components/dashboard/DashboardEmptyState';
import { DateSelector } from '../components/dashboard/DateSelector';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { MoodCheckInCard } from '../components/dashboard/MoodCheckInCard';
import { RecentReflectionsCard } from '../components/dashboard/RecentReflectionsCard';
import { UpcomingRemindersCard } from '../components/dashboard/UpcomingRemindersCard';
import { HabitCard } from '../components/habits/HabitCard';
import { Icon, IconBadge } from '../components/shared/Icon';
import { timePeriodIconPresets } from '../components/shared/iconPresets';
import { MetricCard } from '../components/shared/MetricCard';
import { NoteDetailContent } from '../components/shared/NoteDetailContent';
import { Panel } from '../components/shared/Panel';
import { RoutinelySheetModal } from '../components/shared/RoutinelySheetModal';
import { SectionHeader } from '../components/shared/SectionHeader';
import {
  AppHeader,
  sharedStyles,
} from '../components/RoutinelyUI';
import { timePeriods } from '../data/routinely';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type {
  DailyHabitView,
  DatePillOption,
  LocalDate,
  MoodDetailView,
  NotePreview,
} from '../types/routinely';

type DashboardScreenProps = {
  completionRate: number;
  dailyHabits: DailyHabitView[];
  datePills: DatePillOption[];
  headerSubcopy: string;
  moodDetail: MoodDetailView;
  nextHabitName?: string;
  notes: NotePreview[];
  onSelectDate: (localDate: LocalDate) => void;
  onSelectMood: (mood: number) => void;
  onOpenProfile: () => void;
  onCreateHabitRequest: () => void;
  onToggleHabit: (habitId: string) => void;
  onOverlayOpenChange?: (isOpen: boolean) => void;
  scheduleTitle: string;
  selectedDate: LocalDate;
  selectedDateLabel: string;
  selectedMood: number;
};

export function DashboardScreen({
  completionRate,
  dailyHabits,
  datePills,
  headerSubcopy,
  moodDetail,
  nextHabitName,
  notes,
  onCreateHabitRequest,
  onSelectDate,
  onSelectMood,
  onOpenProfile,
  onOverlayOpenChange,
  onToggleHabit,
  scheduleTitle,
  selectedDate,
  selectedDateLabel,
  selectedMood,
}: DashboardScreenProps) {
  const detailSheetRef = useRef<BottomSheetModal>(null);
  const [selectedNote, setSelectedNote] = useState<NotePreview | null>(null);

  const completedCount = dailyHabits.filter((habit) => habit.status === 'completed').length;
  const dueCount = dailyHabits.filter((habit) => habit.status === 'due').length;
  const missedCount = dailyHabits.filter((habit) => habit.status === 'missed').length;
  const reminderHabits = dailyHabits.filter(
    (habit) => habit.status === 'due' || habit.status === 'upcoming',
  );
  const recentNotes = notes.slice(0, 3);

  function openNoteDetail(note: NotePreview) {
    setSelectedNote(note);
    detailSheetRef.current?.present();
    onOverlayOpenChange?.(true);
  }

  function closeNoteDetail() {
    detailSheetRef.current?.dismiss();
  }

  function handleDismissNoteDetail() {
    setSelectedNote(null);
    onOverlayOpenChange?.(false);
  }

  if (dailyHabits.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyContent}>
          <AppHeader onPressProfile={onOpenProfile} subcopy={headerSubcopy} />
          <DateSelector datePills={datePills} onSelectDate={onSelectDate} selectedDate={selectedDate} />
          <DashboardEmptyState onCreateHabit={onCreateHabitRequest} />
        </View>
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide, styles.screenSections]}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader onPressProfile={onOpenProfile} subcopy={headerSubcopy} />

        <View style={styles.metricRow}>
          <MetricCard
            accent="mint"
            icon="trophy"
            label="Progress"
            value={`${completedCount}/${dailyHabits.length}`}
          />
          <MetricCard accent="amber" icon="alarm-outline" label="Due" value={`${dueCount}`} />
          <MetricCard accent="coral" icon="warning-outline" label="Missed" value={`${missedCount}`} />
        </View>

        <DashboardHero
          completionRate={completionRate}
          dueCount={dueCount}
          missedCount={missedCount}
          nextHabitName={nextHabitName}
          selectedDateLabel={selectedDateLabel}
        />

        <DateSelector datePills={datePills} onSelectDate={onSelectDate} selectedDate={selectedDate} />

        <Panel>
          <SectionHeader title={scheduleTitle} meta="Grouped by when you usually do them" compact />
          {timePeriods.map((period) => {
            const periodHabits = dailyHabits.filter((habit) => habit.timePeriod === period);
            if (periodHabits.length === 0) {
              return null;
            }

            const periodPreset = timePeriodIconPresets[period];

            return (
              <View key={period} style={styles.periodSection}>
                <View style={styles.periodHeader}>
                  <IconBadge accent={periodPreset.accent} badgeSize={28} name={periodPreset.name} size="sm" />
                  <SectionHeader title={period} meta={`${periodHabits.length} habits`} compact />
                </View>
                {periodHabits.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} onToggle={onToggleHabit} />
                ))}
              </View>
            );
          })}
        </Panel>

        <View style={styles.sideGrid}>
          <Panel>
            <SectionHeader title="Mood check-in" meta="Logged for this date" compact />
            <MoodCheckInCard
              moodDetail={moodDetail}
              onSelectMood={onSelectMood}
              selectedMood={selectedMood}
            />
          </Panel>

          <Panel>
            <SectionHeader title="Upcoming reminders" meta="Quiet nudges, not noise" compact />
            <UpcomingRemindersCard habits={reminderHabits.slice(0, 3)} />
          </Panel>
        </View>

        <Panel>
          <SectionHeader
            title="Recent reflections"
            meta={`${recentNotes.length} recent note${recentNotes.length === 1 ? '' : 's'}`}
            compact
          />
          <RecentReflectionsCard notes={recentNotes} onNotePress={openNoteDetail} />
        </Panel>
      </ScrollView>

      <RoutinelySheetModal
        ref={detailSheetRef}
        contentKey={selectedNote?.id}
        contentStyle={styles.sheetContent}
        footer={
          <Pressable
            accessibilityLabel="Close note detail"
            accessibilityRole="button"
            onPress={closeNoteDetail}
            style={styles.closeDetailButton}
          >
            <Text style={styles.closeDetailButtonText}>Close</Text>
          </Pressable>
        }
        onDismiss={handleDismissNoteDetail}
      >
        {selectedNote ? <NoteDetailContent note={selectedNote} /> : null}
      </RoutinelySheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  emptyContent: {
    gap: spacing.md,
    width: '100%',
  },
  screenSections: {
    gap: spacing.lg,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  periodSection: {
    gap: spacing.sm,
  },
  periodHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sideGrid: {
    gap: spacing.lg,
  },
  sheetContent: {
    gap: spacing.md,
  },
  closeDetailButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  closeDetailButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
});
