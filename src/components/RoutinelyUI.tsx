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

export function MoodSelector({
  selectedMood,
  onSelectMood,
}: {
  selectedMood: number;
  onSelectMood: (mood: number) => void;
}) {
  return (
    <View style={styles.moodOptions}>
      {[1, 2, 3, 4, 5].map((mood) => {
        const selected = selectedMood === mood;

        return (
          <Pressable
            accessibilityLabel={`Set mood score ${mood} of 5`}
            accessibilityRole="button"
            key={mood}
            onPress={() => onSelectMood(mood)}
            style={[styles.moodButton, selected && styles.moodButtonSelected]}
          >
            <Text style={[styles.moodButtonText, selected && styles.moodButtonTextSelected]}>{mood}</Text>
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
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  moodButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  moodButtonSelected: {
    backgroundColor: colors.wellness,
    borderColor: colors.wellness,
  },
  moodButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  moodButtonTextSelected: {
    color: colors.onAccent,
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
