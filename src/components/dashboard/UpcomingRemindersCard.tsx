import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import type { DailyHabitView } from '../../types/routinely';

type UpcomingRemindersCardProps = {
  habits: DailyHabitView[];
};

export function UpcomingRemindersCard({ habits }: UpcomingRemindersCardProps) {
  if (habits.length === 0) {
    return (
      <GlassSurface borderRadius={radius.md} variant="nested">
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons color={colors.success} name="checkmark-circle" size={22} />
          </View>
          <Text style={styles.emptyTitle}>You’re clear for now</Text>
          <Text style={styles.emptyText}>No due or upcoming reminders on this date.</Text>
        </View>
      </GlassSurface>
    );
  }

  return (
    <View style={styles.list}>
      {habits.map((habit) => (
        <ReminderRow key={habit.id} habit={habit} />
      ))}
    </View>
  );
}

function ReminderRow({ habit }: { habit: DailyHabitView }) {
  const isDue = habit.status === 'due';

  return (
    <GlassSurface borderRadius={radius.md} noPadding overflowHidden variant="nested">
      <View style={[styles.reminderRow, isDue && styles.reminderRowDue]}>
        <View style={[styles.reminderAccent, { backgroundColor: habit.accent }]} />
        <View style={[styles.reminderIcon, { backgroundColor: habit.accent }]}>
          <Ionicons color={colors.onAccent} name="notifications" size={14} />
        </View>
        <View style={styles.reminderCopy}>
          <View style={styles.reminderTitleRow}>
            <Text numberOfLines={1} style={styles.reminderTitle}>
              {habit.name}
            </Text>
            <View style={[styles.statusChip, isDue ? styles.statusChipDue : styles.statusChipUpcoming]}>
              <Text style={styles.statusChipText}>{isDue ? 'Due' : 'Later'}</Text>
            </View>
          </View>
          <Text numberOfLines={1} style={styles.reminderMeta}>
            {habit.scheduleLabel} · {habit.reminderLabel}
          </Text>
        </View>
        <Ionicons color={isDue ? colors.focus : colors.textMuted} name="chevron-forward" size={16} />
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'center',
  },
  reminderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
  },
  reminderRowDue: {
    backgroundColor: colors.focusSoft,
  },
  reminderAccent: {
    alignSelf: 'stretch',
    width: 3,
  },
  reminderIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexShrink: 0,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  reminderCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  reminderTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    minWidth: 0,
  },
  reminderTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  statusChip: {
    borderRadius: radius.pill,
    flexShrink: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusChipDue: {
    backgroundColor: colors.focusSoft,
  },
  statusChipUpcoming: {
    backgroundColor: colors.primarySoft,
  },
  statusChipText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
  reminderMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
});
