import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DateSelector } from '../components/dashboard/DateSelector';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { HabitCard } from '../components/habits/HabitCard';
import { MetricCard } from '../components/shared/MetricCard';
import { Panel } from '../components/shared/Panel';
import { SectionHeader } from '../components/shared/SectionHeader';
import {
  AppHeader,
  MoodSelector,
  NoteCard,
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
  onToggleHabit: (habitId: string) => void;
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
  onSelectDate,
  onSelectMood,
  onToggleHabit,
  scheduleTitle,
  selectedDate,
  selectedDateLabel,
  selectedMood,
}: DashboardScreenProps) {
  const completedCount = dailyHabits.filter((habit) => habit.status === 'completed').length;
  const dueCount = dailyHabits.filter((habit) => habit.status === 'due').length;
  const missedCount = dailyHabits.filter((habit) => habit.status === 'missed').length;
  const reminderHabits = dailyHabits.filter(
    (habit) => habit.status === 'due' || habit.status === 'upcoming',
  );

  if (dailyHabits.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide]}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader subcopy={headerSubcopy} />
        <DateSelector datePills={datePills} onSelectDate={onSelectDate} selectedDate={selectedDate} />
        <Panel>
          <SectionHeader
            title="No habits yet"
            meta="Create your first routine to start tracking progress."
            compact
          />
          <Pressable accessibilityLabel="Create habit" accessibilityRole="button" style={styles.createButton}>
            <Ionicons color={colors.onAccent} name="add" size={18} />
            <Text style={styles.createButtonText}>Create habit</Text>
          </Pressable>
        </Panel>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide]}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader subcopy={headerSubcopy} />
      <DashboardHero
        completionRate={completionRate}
        dueCount={dueCount}
        missedCount={missedCount}
        nextHabitName={nextHabitName}
        selectedDateLabel={selectedDateLabel}
      />

      <DateSelector datePills={datePills} onSelectDate={onSelectDate} selectedDate={selectedDate} />

      <View style={styles.metricRow}>
        <MetricCard
          icon="radio-button-on"
          label="Daily progress"
          tone={colors.primary}
          value={`${completedCount}/${dailyHabits.length}`}
        />
        <MetricCard icon="flash" label="Due now" tone={colors.focus} value={`${dueCount}`} />
        <MetricCard icon="alert-circle" label="Missed" tone={colors.warning} value={`${missedCount}`} />
      </View>

      <Panel>
        <SectionHeader title={scheduleTitle} meta="Grouped by when you usually do them" />
        {timePeriods.map((period) => {
          const periodHabits = dailyHabits.filter((habit) => habit.timePeriod === period);
          if (periodHabits.length === 0) {
            return null;
          }

          return (
            <View key={period} style={styles.periodSection}>
              <SectionHeader title={period} meta={`${periodHabits.length} habits`} compact />
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
          <MoodSelector selectedMood={selectedMood} onSelectMood={onSelectMood} />
          <Text style={styles.caption}>
            {moodDetail.summary} Energy {moodDetail.energyLabel}, stress {moodDetail.stressLabel}.
          </Text>
        </Panel>

        <Panel>
          <SectionHeader title="Upcoming reminders" meta="Quiet nudges, not noise" compact />
          {reminderHabits.slice(0, 3).map((habit) => (
            <View key={habit.id} style={styles.reminderRow}>
              <View style={[styles.reminderDot, { backgroundColor: habit.accent }]} />
              <View style={styles.reminderCopy}>
                <Text style={styles.reminderTitle}>{habit.name}</Text>
                <Text style={styles.caption}>
                  {habit.scheduleLabel} · {habit.reminderLabel}
                </Text>
              </View>
            </View>
          ))}
        </Panel>
      </View>

      <Panel>
        <SectionHeader title="Recent reflections" meta="Small notes tied to real behavior" compact />
        {notes.slice(0, 2).map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </Panel>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  periodSection: {
    gap: spacing.sm,
  },
  sideGrid: {
    gap: spacing.md,
  },
  caption: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  reminderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  reminderDot: {
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  reminderCopy: {
    flex: 1,
    gap: 2,
  },
  reminderTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  createButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  createButtonText: {
    color: colors.onAccent,
    fontSize: 12,
    fontWeight: '800',
  },
});
