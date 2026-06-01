import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type ColorValue } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { ProgressBar } from '../shared/ProgressBar';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import type { DailyHabitView, Habit, HabitStatus } from '../../types/routinely';

type HabitCardProps = {
  habit: DailyHabitView | Habit;
  onToggle?: (habitId: string) => void;
  onPressArchive?: (habitId: string) => void;
  onPressDetail?: (habitId: string) => void;
  onPressEdit?: (habitId: string) => void;
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

function getStatusAccent(status: HabitStatus, habitAccent: ColorValue): ColorValue {
  switch (status) {
    case 'completed':
      return colors.success;
    case 'due':
      return colors.focus;
    case 'missed':
      return colors.warning;
    case 'upcoming':
      return colors.primary;
    case 'skipped':
      return colors.textMuted;
    default:
      return habitAccent;
  }
}

function getStatusTint(status: HabitStatus): string {
  switch (status) {
    case 'completed':
      return colors.successSoft;
    case 'due':
      return colors.focusSoft;
    case 'missed':
      return colors.warningSoft;
    case 'upcoming':
      return colors.primarySoft;
    case 'skipped':
      return colors.surfaceMuted;
    default:
      return colors.surfaceMuted;
  }
}

function getStatusLabel(status: HabitStatus): string {
  switch (status) {
    case 'completed':
      return 'Done';
    case 'due':
      return 'Due now';
    case 'missed':
      return 'Missed';
    case 'upcoming':
      return 'Later';
    case 'skipped':
      return 'Skipped';
    default:
      return status;
  }
}

export function HabitCard({
  habit,
  onToggle,
  onPressArchive,
  onPressDetail,
  onPressEdit,
  showManagement = false,
}: HabitCardProps) {
  const dailyHabit = isDailyHabitView(habit);
  const completed = dailyHabit ? habit.status === 'completed' : false;
  const progress = dailyHabit ? habit.progress : 0;
  const status = dailyHabit ? habit.status : undefined;
  const statusAccent = status ? getStatusAccent(status, habit.accent) : habit.accent;
  const statusTint = status ? getStatusTint(status) : colors.surfaceMuted;
  const progressText =
    habit.goalType === 'checkbox'
      ? completed
        ? 'Completed'
        : 'Tap to complete'
      : `${progress}/${habit.target} ${habit.unit}`;
  const progressRatio = progress / Math.max(1, habit.target);
  const interactive = Boolean(onToggle) && !showManagement;

  const cardBody = (
    <GlassSurface borderRadius={radius.md} noPadding overflowHidden variant="nested">
      <View style={[styles.habitCard, { backgroundColor: statusTint }]}>
        <View style={[styles.habitAccent, { backgroundColor: statusAccent }]} />
        <View style={styles.habitBody}>
          <View style={styles.habitTopRow}>
            <View style={[styles.habitIcon, { backgroundColor: habit.accent }]}>
              <View style={styles.habitIconDot} />
            </View>
            <View style={styles.habitTitleGroup}>
              <View style={styles.habitTitleLine}>
                <Text
                  numberOfLines={2}
                  style={[styles.habitName, completed && styles.habitNameCompleted]}
                >
                  {habit.name}
                </Text>
                {status ? <StatusBadge status={status} /> : null}
              </View>
              <Text numberOfLines={1} style={styles.habitMeta}>
                {habit.scheduleLabel} · {habit.streak} day streak
              </Text>
              {status === 'due' || status === 'missed' ? (
                <Text numberOfLines={1} style={styles.habitReminder}>
                  {habit.reminderLabel}
                </Text>
              ) : null}
            </View>
            {onToggle ? (
              <View
                style={[
                  styles.actionButton,
                  completed && styles.actionButtonDone,
                  !completed && status === 'due' && styles.actionButtonDue,
                  !completed && status === 'missed' && styles.actionButtonMissed,
                ]}
              >
                <ActionContent completed={completed} goalType={habit.goalType} />
              </View>
            ) : null}
          </View>
          {dailyHabit ? (
            <View style={styles.habitBottomRow}>
              <ProgressBar
                accent={completed ? colors.success : statusAccent}
                value={progressRatio}
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
              <Pressable
                onPress={() => onPressDetail?.(habit.id)}
                style={({ pressed }) => [styles.managementActionWrap, pressed && styles.managementPressed]}
              >
                <Text style={styles.managementAction}>Detail</Text>
              </Pressable>
              <Pressable
                onPress={() => onPressEdit?.(habit.id)}
                style={({ pressed }) => [styles.managementActionWrap, pressed && styles.managementPressed]}
              >
                <Text style={styles.managementAction}>Edit</Text>
              </Pressable>
              <Pressable
                onPress={() => onPressArchive?.(habit.id)}
                style={({ pressed }) => [styles.managementActionWrap, pressed && styles.managementPressed]}
              >
                <Text style={styles.managementDanger}>Archive</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </GlassSurface>
  );

  if (!interactive) {
    return (
      <View
        accessibilityLabel={`${habit.name}, ${progressText}, ${habit.streak} day streak`}
        style={styles.habitCardWrap}
      >
        {cardBody}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={getHabitActionLabel(habit, completed)}
      accessibilityRole="button"
      onPress={() => onToggle?.(habit.id)}
      style={({ pressed }) => [styles.habitCardWrap, pressed && styles.habitCardPressed]}
    >
      {cardBody}
    </Pressable>
  );
}

function ActionContent({
  completed,
  goalType,
}: {
  completed: boolean;
  goalType: Habit['goalType'];
}) {
  if (completed) {
    return <Ionicons color={colors.onAccent} name="checkmark" size={22} />;
  }

  if (goalType === 'numeric') {
    return <Text style={styles.actionLabel}>+1</Text>;
  }

  if (goalType === 'duration') {
    return <Text style={styles.actionLabel}>+15m</Text>;
  }

  return <Ionicons color={colors.onAccent} name="checkmark" size={22} />;
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
      <Text style={styles.badgeText}>{getStatusLabel(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  habitCardWrap: {
    flex: 1,
    minWidth: 0,
  },
  habitCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  habitCard: {
    flexDirection: 'row',
    minWidth: 0,
  },
  habitAccent: {
    width: 5,
  },
  habitBody: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  habitTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  habitIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexShrink: 0,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  habitIconDot: {
    backgroundColor: colors.onAccent,
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  habitTitleGroup: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  habitTitleLine: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    minWidth: 0,
  },
  habitName: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  habitNameCompleted: {
    color: colors.textMuted,
  },
  habitMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  habitReminder: {
    color: colors.focus,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  badge: {
    borderRadius: radius.pill,
    flexShrink: 0,
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
    lineHeight: 13,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexShrink: 0,
    height: 48,
    justifyContent: 'center',
    minWidth: 48,
    paddingHorizontal: spacing.sm,
  },
  actionButtonDue: {
    backgroundColor: colors.focus,
  },
  actionButtonMissed: {
    backgroundColor: colors.warning,
  },
  actionButtonDone: {
    backgroundColor: colors.success,
  },
  actionLabel: {
    color: colors.onAccent,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
  },
  habitBottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  progressText: {
    color: colors.textMuted,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    minWidth: 88,
    textAlign: 'right',
  },
  managementRow: {
    borderTopColor: colors.hairline,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  managementActionWrap: {
    paddingVertical: 2,
  },
  managementPressed: {
    opacity: 0.72,
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
