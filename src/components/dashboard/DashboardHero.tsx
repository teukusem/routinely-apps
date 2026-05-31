import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { ProgressBar } from '../shared/ProgressBar';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

type DashboardHeroProps = {
  completionRate: number;
  dueCount: number;
  missedCount: number;
  nextHabitName?: string;
  selectedDateLabel: string;
};

export function DashboardHero({
  completionRate,
  dueCount,
  missedCount,
  nextHabitName,
  selectedDateLabel,
}: DashboardHeroProps) {
  return (
    <GlassSurface borderRadius={radius.lg} contentStyle={styles.surface}>
      <View style={styles.heroTopRow}>
        <Text style={styles.heroKicker}>{selectedDateLabel}</Text>
        <View style={[styles.heroSignal, styles.innerSurface]}>
          <Ionicons color={colors.text} name="flash" size={13} />
          <Text style={styles.heroSignalText}>Focus</Text>
        </View>
      </View>
      <Text style={styles.heroTitle}>Start with the first two.</Text>
      <Text style={styles.heroText} numberOfLines={2}>
        {dueCount} habits ready · {missedCount} missed to recover
      </Text>
      <View style={styles.heroFooter}>
        <View style={styles.heroProgress}>
          <View style={styles.heroProgressHeader}>
            <View style={styles.heroProgressLabelRow}>
              <Ionicons color={colors.primary} name="checkmark-circle" size={14} />
              <Text style={styles.heroProgressLabel}>Completed</Text>
            </View>
            <Text style={styles.heroProgressValue}>{completionRate}%</Text>
          </View>
          <ProgressBar accent={colors.primary} value={completionRate / 100} />
        </View>
        {nextHabitName ? (
          <View style={styles.heroHint}>
            <Text style={styles.heroHintValue}>Next</Text>
            <Text numberOfLines={1} style={styles.heroHintText}>
              {nextHabitName}
            </Text>
          </View>
        ) : null}
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  surface: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  innerSurface: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderWidth: 1,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  heroKicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 24,
  },
  heroText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  heroFooter: {
    gap: spacing.sm,
    marginTop: spacing.sm + 4,
  },
  heroProgress: {
    gap: spacing.xs + 2,
  },
  heroProgressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroProgressLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  heroProgressLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  heroProgressValue: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
  },
  heroSignal: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  heroSignalText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  heroHint: {
    gap: 2,
  },
  heroHintValue: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  heroHintText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
});
