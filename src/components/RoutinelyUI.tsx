import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type DimensionValue } from 'react-native';

import { mapBarsToFillPercentages } from './shared/analytics-bars-data';
import { GlassSurface } from './GlassSurface';
import { MetricCard } from './shared/MetricCard';
import { Panel } from './shared/Panel';
import { ProgressBar } from './shared/ProgressBar';
import { SectionHeader } from './shared/SectionHeader';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { AnalyticsBar, NotePreview } from '../types/routinely';

export { DashboardHero } from './dashboard/DashboardHero';
export { HabitCard } from './habits/HabitCard';
export { MetricCard } from './shared/MetricCard';
export { Panel } from './shared/Panel';
export { ProgressBar } from './shared/ProgressBar';
export { SectionHeader } from './shared/SectionHeader';

type AppHeaderProps = {
  subcopy?: string;
};

export function AppHeader({ subcopy = 'Daily plan' }: AppHeaderProps) {
  return (
    <View style={styles.appHeader}>
      <View>
        <Text style={styles.brand}>Routinely</Text>
        <Text style={styles.headerSubcopy}>{subcopy}</Text>
      </View>
      <Pressable
        accessibilityLabel="Open profile menu"
        accessibilityRole="button"
        style={[styles.avatarButton, styles.innerSurface]}
      >
        <Text style={styles.avatarText}>T</Text>
      </Pressable>
    </View>
  );
}

const MOOD_OPTIONS = [
  { score: 1, emoji: '😔', label: 'Rough' },
  { score: 2, emoji: '😕', label: 'Low' },
  { score: 3, emoji: '😐', label: 'OK' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😄', label: 'Great' },
] as const;

export function MoodSelector({
  selectedMood,
  onSelectMood,
  variant = 'default',
}: {
  selectedMood: number;
  onSelectMood: (mood: number) => void;
  variant?: 'default' | 'rich';
}) {
  const rich = variant === 'rich';

  return (
    <View style={styles.moodOptions}>
      {MOOD_OPTIONS.map(({ score, emoji, label }) => {
        const selected = selectedMood === score;

        return (
          <Pressable
            accessibilityLabel={`Set mood to ${label}, ${score} of 5`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={score}
            onPress={() => onSelectMood(score)}
            style={({ pressed }) => [
              styles.moodButton,
              rich && styles.moodButtonRich,
              selected && styles.moodButtonSelected,
              pressed && styles.moodButtonPressed,
            ]}
          >
            <Text style={styles.moodEmoji}>{emoji}</Text>
            {rich ? (
              <Text style={[styles.moodLabel, selected && styles.moodLabelSelected]}>{label}</Text>
            ) : (
              <Text style={[styles.moodButtonText, selected && styles.moodButtonTextSelected]}>{score}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export function NoteCard({ note }: { note: NotePreview }) {
  return (
    <GlassSurface borderRadius={radius.lg} style={styles.noteCard} variant="nested">
      <Text style={styles.noteTitle}>{note.title}</Text>
      <Text style={styles.noteBody}>{note.body}</Text>
      <Text style={styles.noteLink}>Linked to {note.linkedTo}</Text>
    </GlassSurface>
  );
}

export function AnalyticsBars({
  bars,
  subtitle,
  title,
}: {
  bars: AnalyticsBar[];
  subtitle: string;
  title: string;
}) {
  const fillHeights = mapBarsToFillPercentages(bars);

  return (
    <Panel>
      <SectionHeader title={title} meta={subtitle} compact />
      <View style={styles.barChart}>
        {bars.map((bar, index) => (
          <View key={bar.label} style={styles.barColumn}>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { height: fillHeights[index] as DimensionValue }]} />
            </View>
            <Text style={styles.barLabel}>{bar.label}</Text>
          </View>
        ))}
      </View>
    </Panel>
  );
}

export const sharedStyles = StyleSheet.create({
  screenScroll: {
    gap: spacing.md,
    paddingBottom: 112,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  centeredWide: {
    alignSelf: 'center',
    maxWidth: 960,
    width: '100%',
  },
  contentStack: {
    gap: spacing.lg,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricGrid: {
    gap: spacing.sm,
  },
});

const styles = StyleSheet.create({
  appHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brand: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  headerSubcopy: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    maxWidth: 280,
  },
  innerSurface: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderWidth: 1,
  },
  avatarButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  moodOptions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  moodButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.xs,
  },
  moodButtonRich: {
    gap: 2,
    minHeight: 58,
    paddingHorizontal: spacing.xs,
  },
  moodButtonSelected: {
    backgroundColor: colors.wellnessSoft,
    borderColor: colors.wellness,
    borderWidth: 1.5,
  },
  moodButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  moodEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },
  moodLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },
  moodLabelSelected: {
    color: colors.wellness,
  },
  moodButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  moodButtonTextSelected: {
    color: colors.wellness,
  },
  noteCard: {
    gap: spacing.xs,
  },
  noteTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 21,
  },
  noteBody: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  noteLink: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  barChart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
    height: 160,
    justifyContent: 'space-between',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  barTrack: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    height: 120,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: '100%',
  },
  barFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    width: '100%',
  },
  barLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
});
