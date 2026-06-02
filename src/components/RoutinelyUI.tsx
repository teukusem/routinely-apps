import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { mapBarsToFillPercentages } from './shared/analytics-bars-data';
import { GlassSurface } from './GlassSurface';
import { Icon, IconBadge } from './shared/Icon';
import { MetricCard } from './shared/MetricCard';
import { Panel } from './shared/Panel';
import { ProgressBar } from './shared/ProgressBar';
import { SectionHeader } from './shared/SectionHeader';
import { colors } from '../theme/colors';
import { iconColors } from '../theme/iconColors';
import { radius, spacing } from '../theme/spacing';
import { useProfile } from '../data/hooks/use-profile';
import type { AnalyticsBar, NotePreview } from '../types/routinely';

export { DashboardHero } from './dashboard/DashboardHero';
export { EmptyState } from './shared/EmptyState';
export { HabitCard } from './habits/HabitCard';
export { Icon, IconBadge, iconColors, iconSizes, type IconAccentName, type IconName, type IconSize, type IconTone } from './shared/Icon';
export { MetricCard } from './shared/MetricCard';
export { Panel } from './shared/Panel';
export { ProgressBar } from './shared/ProgressBar';
export { SectionHeader } from './shared/SectionHeader';

function getInitials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

type AppHeaderProps = {
  onPressProfile?: () => void;
  subcopy?: string;
};

export function AppHeader({ onPressProfile, subcopy = 'Daily plan' }: AppHeaderProps) {
  const profileQuery = useProfile();
  const initials = getInitials(profileQuery.data?.name);

  return (
    <View style={sharedStyles.appHeaderShell}>
      <View style={styles.appHeader}>
        <View>
          <Text style={styles.brand}>Routinely</Text>
          <Text style={styles.headerSubcopy}>{subcopy}</Text>
        </View>
        <Pressable
          accessibilityLabel="Open profile settings"
          accessibilityRole="button"
          accessibilityState={{ disabled: !onPressProfile }}
          disabled={!onPressProfile}
          onPress={onPressProfile}
          style={({ pressed }) => [
            styles.avatarButton,
            styles.innerSurface,
            onPressProfile && pressed && styles.avatarButtonPressed,
          ]}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Vertical stack for screen body below AppHeader — keeps section gap consistent app-wide. */
export function ScreenContent({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[sharedStyles.screenContent, style]}>{children}</View>;
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
    return { accent: 'rose' as const, backgroundColor: iconColors.roseSoft, tone: iconColors.rose };
  }

  return { accent: 'sky' as const, backgroundColor: iconColors.skySoft, tone: iconColors.sky };
}

export function NoteCard({
  note,
  onPress,
  variant = 'default',
}: {
  note: NotePreview;
  onPress?: () => void;
  variant?: 'compact' | 'default' | 'prominent';
}) {
  const linkStyle = getNoteLinkStyle(note.linkedTo);
  const compact = variant === 'compact';
  const prominent = variant === 'prominent';

  if (compact) {
    return (
      <Pressable
        accessibilityHint={onPress ? `Linked to ${note.linkedTo}` : undefined}
        accessibilityLabel={onPress ? `Open note ${note.title}, linked to ${note.linkedTo}` : undefined}
        accessibilityRole={onPress ? 'button' : undefined}
        disabled={!onPress}
        onPress={onPress}
        style={({ pressed }) => [onPress && pressed && styles.noteCardPressed]}
      >
        <GlassSurface borderRadius={radius.md} noPadding overflowHidden variant="nested">
          <View style={[styles.noteRowCompact, { backgroundColor: linkStyle.backgroundColor }]}>
            <IconBadge
              accent={linkStyle.accent}
              badgeSize={32}
              name="newspaper-outline"
              size="sm"
            />
            <View style={styles.noteCopyCompact}>
              <Text ellipsizeMode="tail" numberOfLines={1} style={styles.noteTitleCompact}>
                {note.title}
              </Text>
              <Text ellipsizeMode="tail" numberOfLines={1} style={styles.noteMetaCompact}>
                {note.body} · {note.linkedTo}
              </Text>
            </View>
            <Icon color={linkStyle.tone} name="chevron-forward" size={14} />
          </View>
        </GlassSurface>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityLabel={onPress ? `Open note ${note.title}, linked to ${note.linkedTo}` : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
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
          <IconBadge
            accent={linkStyle.accent}
            badgeSize={prominent ? 40 : 36}
            name="newspaper"
            size={prominent ? 'md' : 'sm'}
            style={prominent ? styles.noteIconProminent : styles.noteIcon}
          />
          <View style={styles.noteCopy}>
            <Text numberOfLines={prominent ? 2 : 1} style={[styles.noteTitle, prominent && styles.noteTitleProminent]}>
              {note.title}
            </Text>
            <Text numberOfLines={prominent ? 3 : 2} style={[styles.noteBody, prominent && styles.noteBodyProminent]}>
              {note.body}
            </Text>
            <View style={[styles.linkChip, prominent && styles.linkChipProminent, { backgroundColor: colors.glassStrong }]}>
              <Icon color={linkStyle.tone} name="git-network-outline" size={prominent ? 12 : 11} />
              <Text numberOfLines={1} style={[styles.linkChipText, prominent && styles.linkChipTextProminent, { color: linkStyle.tone }]}>
                {note.linkedTo}
              </Text>
            </View>
          </View>
          <Icon color={linkStyle.tone} name="chevron-forward" size={prominent ? 'lg' : 'md'} />
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
            <View
              accessible
              accessibilityLabel={`${bar.label}: ${Math.round(bar.value * 100)}%${isBest ? ', best result' : ''}`}
              accessibilityRole="text"
              key={bar.label}
              style={styles.barColumn}
            >
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
              <Text style={styles.barValue}>{Math.round(bar.value * 100)}%</Text>
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
    paddingBottom: 112,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  appHeaderShell: {
    marginBottom: spacing.md,
    width: '100%',
  },
  screenContent: {
    gap: spacing.md,
    width: '100%',
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
  avatarButtonPressed: {
    opacity: 0.86,
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
  },
  moodEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },
  moodLabel: {
    color: colors.textMuted,
    fontSize: 11,
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
  },
  noteRowCompact: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
  },
  noteCopyCompact: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  noteTitleCompact: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
  },
  noteMetaCompact: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
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
    flexShrink: 0,
  },
  noteIconProminent: {
    flexShrink: 0,
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
    fontSize: 11,
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
    height: 176,
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
  barValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  barLabelBest: {
    color: colors.primary,
  },
});
