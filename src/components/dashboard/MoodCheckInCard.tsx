import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { MoodSelector } from '../RoutinelyUI';
import { ProgressBar } from '../shared/ProgressBar';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import type { MoodDetailView } from '../../types/routinely';

type MoodCheckInCardProps = {
  moodDetail: MoodDetailView;
  onSelectMood: (mood: number) => void;
  selectedMood: number;
};

function parseScaleValue(label: string): number {
  const value = Number.parseInt(label, 10);
  return Number.isFinite(value) ? value / 10 : 0;
}

export function MoodCheckInCard({ moodDetail, onSelectMood, selectedMood }: MoodCheckInCardProps) {
  const energyValue = moodDetail.hasFixture ? parseScaleValue(moodDetail.energyLabel) : 0;
  const stressValue = moodDetail.hasFixture ? parseScaleValue(moodDetail.stressLabel) : 0;
  const moodLogged = selectedMood > 0;

  return (
    <View style={styles.root}>
      <View style={styles.promptRow}>
        <View style={styles.promptIcon}>
          <Ionicons color={colors.wellness} name="happy-outline" size={16} />
        </View>
        <Text style={styles.promptText}>
          {moodLogged ? 'Tap a score to update your mood' : 'How are you feeling today?'}
        </Text>
      </View>

      <MoodSelector selectedMood={selectedMood} onSelectMood={onSelectMood} variant="rich" />

      <GlassSurface borderRadius={radius.md} noPadding overflowHidden variant="nested">
        <View style={[styles.summaryCard, moodLogged && styles.summaryCardLogged]}>
          <View style={styles.summaryAccent} />
          <View style={styles.summaryBody}>
            <Text style={styles.summaryLabel}>{moodLogged ? 'Today’s mood' : 'Mood insight'}</Text>
            <Text style={styles.summaryText}>{moodDetail.summary}</Text>
            {moodDetail.hasFixture ? (
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
      <ProgressBar accent={tone} value={value} />
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
  promptIcon: {
    alignItems: 'center',
    backgroundColor: colors.wellnessSoft,
    borderRadius: radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
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
    fontSize: 10,
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
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
  scaleChipValue: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
});
