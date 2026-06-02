import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { Icon, IconBadge } from '../shared/Icon';
import { colors } from '../../theme/colors';
import { iconColors } from '../../theme/iconColors';
import { radius, spacing } from '../../theme/spacing';

const HINTS = [
  { accent: 'mint' as const, icon: 'repeat-outline' as const, label: 'Daily streaks' },
  { accent: 'sky' as const, icon: 'notifications-outline' as const, label: 'Reminders' },
  { accent: 'lavender' as const, icon: 'heart-circle-outline' as const, label: 'Mood sync' },
];

type DashboardEmptyStateProps = {
  onCreateHabit: () => void;
};

export function DashboardEmptyState({ onCreateHabit }: DashboardEmptyStateProps) {
  return (
    <GlassSurface borderRadius={radius.lg} contentStyle={styles.card} variant="panel">
      <View style={styles.accentRail} />
      <View style={styles.hero}>
        <View style={styles.heroOrbit} />
        <IconBadge
          accent="sky"
          badgeSize={36}
          name="sunny-outline"
          size="sm"
          style={styles.heroSatelliteLeft}
        />
        <IconBadge
          accent="lavender"
          badgeSize={36}
          name="heart-circle-outline"
          size="sm"
          style={styles.heroSatelliteRight}
        />
        <View style={styles.heroCore}>
          <IconBadge accent="mint" badgeSize={56} name="infinite-outline" size="lg" />
        </View>
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>No habits yet</Text>
        <Text style={styles.description}>
          Create your first routine to start tracking progress.
        </Text>
      </View>

      <View style={styles.hints}>
        {HINTS.map((hint) => (
          <View key={hint.label} style={styles.hintChip}>
            <Icon accent={hint.accent} name={hint.icon} size={12} />
            <Text style={styles.hintLabel}>{hint.label}</Text>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityLabel="Create habit"
        accessibilityRole="button"
        onPress={onCreateHabit}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <View style={styles.ctaIconWrap}>
          <Icon color={colors.onAccent} name="add" size={13} />
        </View>
        <Text style={styles.ctaText}>Create habit</Text>
      </Pressable>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    minHeight: 280,
    overflow: 'hidden',
    paddingBottom: spacing.md + 4,
    paddingTop: spacing.sm,
  },
  accentRail: {
    backgroundColor: iconColors.mint,
    borderRadius: radius.pill,
    height: 3,
    left: spacing.md,
    position: 'absolute',
    right: spacing.md,
    top: 0,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 108,
    paddingTop: spacing.sm,
  },
  heroOrbit: {
    backgroundColor: iconColors.mintSoft,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 92,
    position: 'absolute',
    width: 92,
  },
  heroCore: {
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderColor: iconColors.mint,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    justifyContent: 'center',
    padding: spacing.xs,
  },
  heroSatelliteLeft: {
    left: '22%',
    position: 'absolute',
    top: spacing.md,
  },
  heroSatelliteRight: {
    position: 'absolute',
    right: '22%',
    top: spacing.md,
  },
  copy: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    maxWidth: 320,
  },
  hints: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  hintChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.hairline,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  hintLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  cta: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    elevation: 4,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    shadowColor: iconColors.mint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    width: '100%',
  },
  ctaPressed: {
    backgroundColor: colors.primaryPressed,
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  ctaIconWrap: {
    alignItems: 'center',
    backgroundColor: iconColors.mint,
    borderRadius: radius.pill,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  ctaText: {
    color: colors.onAccent,
    fontSize: 13,
    fontWeight: '800',
    includeFontPadding: false,
    lineHeight: 16,
  },
});
