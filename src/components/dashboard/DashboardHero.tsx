import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../GlassSurface';
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
    <GlassSurface borderRadius={radius.xl}>
      <View style={styles.heroTopRow}>
        <Text style={styles.heroKicker}>{selectedDateLabel}</Text>
        <View style={[styles.heroSignal, styles.innerSurface]}>
          <Ionicons color={colors.text} name="flash" size={14} />
          <Text style={styles.heroSignalText}>Focus</Text>
        </View>
      </View>
      <Text style={styles.heroTitle}>Start with the first two.</Text>
      <Text style={styles.heroText}>
        {dueCount} habits are ready. Recover {missedCount} missed habit before the day gets noisy.
      </Text>
      <View style={styles.heroFooter}>
        <View style={[styles.heroScore, styles.innerSurface]}>
          <Text style={styles.heroScoreValue}>{completionRate}%</Text>
          <Text style={styles.heroScoreLabel}>completed</Text>
        </View>
        {nextHabitName ? (
          <View style={styles.heroHint}>
            <Text style={styles.heroHintValue}>Next</Text>
            <Text style={styles.heroHintText}>{nextHabitName}</Text>
          </View>
        ) : null}
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  innerSurface: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderWidth: 1,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  heroKicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  heroText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  heroFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  heroScore: {
    borderRadius: radius.lg,
    gap: 2,
    flexShrink: 0,
    minWidth: 104,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroScoreValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  heroScoreLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  heroSignal: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  heroSignalText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  heroHint: {
    flex: 1,
    gap: 2,
    minWidth: 140,
  },
  heroHintValue: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  heroHintText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 20,
    flexShrink: 1,
  },
});
