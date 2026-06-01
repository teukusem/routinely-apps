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
export { EmptyState } from './shared/EmptyState';
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

export function moodEmojiForScore(score: number): string {
  return MOOD_OPTIONS.find((option) => option.score === score)?.emoji ?? '';
}

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

function getNoteLinkStyle(linkedTo: string) {
  if (linkedTo.toLowerCase().includes('mood')) {
    return { backgroundColor: colors.wellnessSoft, tone: colors.wellness };
  }

  return { backgroundColor: colors.primarySoft, tone: colors.primary };
}

export function NoteCard({
  note,
  onPress,
  variant = 'default',
}: {
  note: NotePreview;
  onPress?: () => void;
  variant?: 'default' | 'prominent';
}) {
  const linkStyle = getNoteLinkStyle(note.linkedTo);
  const prominent = variant === 'prominent';

  return (
    <Pressable
      accessibilityLabel={`Open note ${note.title}, linked to ${note.linkedTo}`}
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [onPress && pressed && styles.noteCardPressed]}
    >
      <GlassSurface
        borderRadius={prominent ? radius.lg : radius.md}
        noPadding
        overflowHidden
        variant={prominent ? 'card' : 'nested'}
      >
        <View
          style={[
            styles.noteRow,
            prominent && styles.noteRowProminent,
            { backgroundColor: linkStyle.backgroundColor },
          ]}
        >
          <View style={[styles.noteAccent, prominent && styles.noteAccentProminent, { backgroundColor: linkStyle.tone }]} />
          <View style={[styles.noteIcon, prominent && styles.noteIconProminent, { backgroundColor: linkStyle.tone }]}>
            <Ionicons color={colors.onAccent} name="document-text" size={prominent ? 16 : 14} />
          </View>
          <View style={styles.noteCopy}>
            <Text numberOfLines={prominent ? 2 : 1} style={[styles.noteTitle, prominent && styles.noteTitleProminent]}>
              {note.title}
            </Text>
            <Text numberOfLines={prominent ? 3 : 2} style={[styles.noteBody, prominent && styles.noteBodyProminent]}>
              {note.body}
            </Text>
            <View style={[styles.linkChip, prominent && styles.linkChipProminent, { backgroundColor: colors.glassStrong }]}>
              <Ionicons color={linkStyle.tone} name="link" size={prominent ? 12 : 11} />
              <Text numberOfLines={1} style={[styles.linkChipText, prominent && styles.linkChipTextProminent, { color: linkStyle.tone }]}>
                {note.linkedTo}
              </Text>
            </View>
          </View>
          <Ionicons color={linkStyle.tone} name="chevron-forward" size={prominent ? 18 : 16} />
        </View>
      </GlassSurface>
    </Pressable>
  );
}

export { getNoteLinkStyle };

export function AnalyticsBars({
  bars,
  fillColor = colors.primary,
  highlightBestBar = false,
  subtitle,
  title,
}: {
  bars: AnalyticsBar[];
  fillColor?: string;
  highlightBestBar?: boolean;
  subtitle: string;
  title: string;
}) {
  const fillHeights = mapBarsToFillPercentages(bars);
  const bestValue = highlightBestBar ? Math.max(...bars.map((bar) => bar.value)) : -1;

  return (
    <Panel>
      <SectionHeader title={title} meta={subtitle} compact />
      <View style={styles.barChart}>
        {bars.map((bar, index) => {
          const isBest = highlightBestBar && bar.value === bestValue;

          return (
            <View key={bar.label} style={styles.barColumn}>
              <View style={[styles.barTrack, isBest && styles.barTrackBest]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: fillColor,
                      height: fillHeights[index] as DimensionValue,
                      opacity: isBest ? 1 : 0.72,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, isBest && styles.barLabelBest]}>{bar.label}</Text>
            </View>
          );
        })}
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
  noteCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  noteRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  noteRowProminent: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  noteAccent: {
    alignSelf: 'stretch',
    width: 4,
  },
  noteAccentProminent: {
    width: 5,
  },
  noteIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexShrink: 0,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  noteIconProminent: {
    height: 40,
    width: 40,
  },
  noteCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  noteTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  noteTitleProminent: {
    fontSize: 16,
    lineHeight: 22,
  },
  noteBody: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  noteBodyProminent: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    opacity: 0.82,
  },
  linkChip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
    maxWidth: '100%',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  linkChipProminent: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  linkChipText: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
  linkChipTextProminent: {
    fontSize: 11,
    lineHeight: 14,
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
  barTrackBest: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 1,
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
  barLabelBest: {
    color: colors.primary,
  },
});
