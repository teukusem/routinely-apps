import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { ProgressBar } from '../shared/ProgressBar';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import type { DailyHabitView, Habit, HabitStatus } from '../../types/routinely';

type HabitCardProps = {
  habit: DailyHabitView | Habit;
  onToggle?: (habitId: string) => void;
  showManagement?: boolean;
};

function isDailyHabitView(habit: DailyHabitView | Habit): habit is DailyHabitView {
  return 'progress' in habit && 'status' in habit;
}

function getHabitActionLabel(habit: DailyHabitView | Habit, completed: boolean): string {
  switch (habit.goalType) {
    case 'checkbox':
      return completed ? `Undo completion for ${habit.name}` : `Complete ${habit.name}`;
    case 'numeric':
      return completed
        ? `Reset progress for ${habit.name}`
        : `Add one ${habit.unit} to ${habit.name}`;
    case 'duration':
      return completed
        ? `Reset progress for ${habit.name}`
        : `Add 15 minutes to ${habit.name}`;
    default:
      return completed ? `Undo completion for ${habit.name}` : `Complete ${habit.name}`;
  }
}

export function HabitCard({ habit, onToggle, showManagement = false }: HabitCardProps) {
  const dailyHabit = isDailyHabitView(habit);
  const completed = dailyHabit ? habit.status === 'completed' : false;
  const progress = dailyHabit ? habit.progress : 0;
  const status = dailyHabit ? habit.status : undefined;
  const progressText =
    habit.goalType === 'checkbox'
      ? completed
        ? 'Completed'
        : 'Not completed'
      : `${progress}/${habit.target} ${habit.unit}`;

  return (
    <View
      accessibilityLabel={`${habit.name}, ${progressText}, ${habit.streak} day streak`}
      style={styles.habitCardWrap}
    >
      <GlassSurface borderRadius={radius.md} noPadding overflowHidden variant="nested">
        <View style={styles.habitCard}>
          <View style={[styles.habitAccent, { backgroundColor: habit.accent }]} />
          <View style={styles.habitBody}>
            <View style={styles.habitTopRow}>
              <View style={styles.habitTitleGroup}>
                <View style={styles.habitTitleLine}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  {status ? <StatusBadge status={status} /> : null}
                </View>
                <Text style={styles.habitMeta}>
                  {habit.scheduleLabel} · {habit.category} · {habit.streak} day streak
                </Text>
                <Text style={styles.habitReminder}>{habit.reminderLabel}</Text>
              </View>
              {onToggle ? (
                <Pressable
                  accessibilityLabel={getHabitActionLabel(habit, completed)}
                  accessibilityRole="button"
                  onPress={() => onToggle(habit.id)}
                  style={({ pressed }) => [
                    styles.completeButton,
                    completed && styles.completeButtonDone,
                    pressed && styles.completeButtonPressed,
                  ]}
                >
                  <Ionicons
                    color={completed ? colors.onAccent : colors.text}
                    name={completed ? 'checkmark' : 'add'}
                    size={18}
                  />
                </Pressable>
              ) : null}
            </View>
            {dailyHabit ? (
              <View style={styles.habitBottomRow}>
                <ProgressBar
                  accent={completed ? colors.success : habit.accent}
                  value={progress / Math.max(1, habit.target)}
                />
                <Text style={styles.progressText}>{progressText}</Text>
              </View>
            ) : (
              <Text style={styles.progressText}>
                {habit.goalType === 'checkbox'
                  ? 'Checkbox goal'
                  : `Target ${habit.target} ${habit.unit}`}
              </Text>
            )}
            {showManagement ? (
              <View style={styles.managementRow}>
                <Text style={styles.managementAction}>Detail</Text>
                <Text style={styles.managementAction}>Edit</Text>
                <Text style={styles.managementDanger}>Archive</Text>
              </View>
            ) : null}
          </View>
        </View>
      </GlassSurface>
    </View>
  );
}

function StatusBadge({ status }: { status: HabitStatus }) {
  const badgeStyle = {
    completed: styles.badgeCompleted,
    due: styles.badgeDue,
    upcoming: styles.badgeUpcoming,
    missed: styles.badgeMissed,
    skipped: styles.badgeSkipped,
  }[status];

  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  habitCardWrap: {
    flex: 1,
    minWidth: 0,
  },
  habitCard: {
    flexDirection: 'row',
    minWidth: 0,
  },
  habitAccent: {
    width: 4,
  },
  habitBody: {
    flex: 1,
    gap: spacing.md,
    minWidth: 0,
    padding: spacing.md,
  },
  habitTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  habitTitleGroup: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  habitTitleLine: {
    alignItems: 'flex-start',
    gap: spacing.xs,
    minWidth: 0,
  },
  habitName: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  habitMeta: {
    color: colors.textMuted,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  habitReminder: {
    color: colors.textMuted,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeCompleted: {
    backgroundColor: colors.successSoft,
  },
  badgeDue: {
    backgroundColor: colors.focusSoft,
  },
  badgeUpcoming: {
    backgroundColor: colors.primarySoft,
  },
  badgeMissed: {
    backgroundColor: colors.warningSoft,
  },
  badgeSkipped: {
    backgroundColor: colors.surfaceMuted,
  },
  badgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 14,
    textTransform: 'capitalize',
  },
  completeButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexShrink: 0,
    height: 44,
    justifyContent: 'center',
    width: 50,
  },
  completeButtonDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  completeButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  habitBottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    flexShrink: 0,
    minWidth: 96,
    textAlign: 'right',
  },
  managementRow: {
    borderTopColor: colors.hairline,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  managementAction: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  managementDanger: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '800',
  },
});
