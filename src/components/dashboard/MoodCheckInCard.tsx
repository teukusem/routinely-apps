import { StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { MoodSelector } from '../RoutinelyUI';
import { IconBadge } from '../shared/Icon';
import { ProgressBar } from '../shared/ProgressBar';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import type { MoodDetailView } from '../../types/routinely';

type MoodCheckInCardProps = {
  dateLabel?: string;
  moodDetail: MoodDetailView;
  onSelectMood: (mood: number) => void;
  selectedMood: number;
};

function parseScaleValue(label: string): number {
  const value = Number.parseInt(label, 10);
  return Number.isFinite(value) ? value / 10 : 0;
}

export function MoodCheckInCard({
  dateLabel,
  moodDetail,
  onSelectMood,
  selectedMood,
}: MoodCheckInCardProps) {
  const energyValue = moodDetail.hasFixture ? parseScaleValue(moodDetail.energyLabel) : 0;
  const stressValue = moodDetail.hasFixture ? parseScaleValue(moodDetail.stressLabel) : 0;
  const moodLogged = selectedMood > 0;
  const promptText = moodLogged
    ? dateLabel
      ? `Tap to update ${dateLabel}'s mood`
      : 'Tap a score to update your mood'
    : dateLabel
      ? `Tap a mood for ${dateLabel}`
      : 'How are you feeling today?';
  const summaryLabel = moodLogged
    ? dateLabel
      ? `${dateLabel} mood`
      : 'Today’s mood'
    : 'Mood insight';

  return (
    <View style={styles.root}>
      <View style={styles.promptRow}>
        <IconBadge accent="rose" badgeSize={28} name="heart-circle-outline" />
        <Text style={styles.promptText}>{promptText}</Text>
      </View>

      <MoodSelector selectedMood={selectedMood} onSelectMood={onSelectMood} variant="rich" />

      <GlassSurface borderRadius={radius.md} noPadding overflowHidden variant="nested">
        <View style={[styles.summaryCard, moodLogged && styles.summaryCardLogged]}>
          <View style={styles.summaryAccent} />
          <View style={styles.summaryBody}>
            <Text style={styles.summaryLabel}>{summaryLabel}</Text>
            <Text style={styles.summaryText}>{moodDetail.summary}</Text>
            {moodLogged && moodDetail.hasFixture ? (
              <View style={styles.scaleRow}>
                <ScaleChip
                  label="Energy"
                  tone={colors.wellness}
                  value={energyValue}
                  valueLabel={moodDetail.energyLabel}
                />
                <ScaleChip
                  label="Stress"
                  tone={colors.warning}
                  value={stressValue}
                  valueLabel={moodDetail.stressLabel}
                />
              </View>
            ) : null}
          </View>
        </View>
      </GlassSurface>
    </View>
  );
}

function ScaleChip({
  label,
  tone,
  value,
  valueLabel,
}: {
  label: string;
  tone: string;
  value: number;
  valueLabel: string;
}) {
  return (
    <View style={styles.scaleChip}>
      <View style={styles.scaleChipHeader}>
        <Text style={styles.scaleChipLabel}>{label}</Text>
        <Text style={styles.scaleChipValue}>{valueLabel}</Text>
      </View>
      <ProgressBar accent={tone} label={`${label} level`} value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm + 4,
  },
  promptRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  promptText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    minWidth: 0,
  },
  summaryCardLogged: {
    backgroundColor: colors.wellnessSoft,
  },
  summaryAccent: {
    backgroundColor: colors.wellness,
    width: 4,
  },
  summaryBody: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    color: colors.wellness,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  summaryText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  scaleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  scaleChip: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  scaleChipHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleChipLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
  scaleChipValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
});
