import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../components/GlassSurface';
import { ProgressBar } from '../components/shared/ProgressBar';
import {
  AnalyticsBars,
  AppHeader,
  MoodSelector,
  Panel,
  SectionHeader,
  sharedStyles,
} from '../components/RoutinelyUI';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { AnalyticsBar, MoodDetailView } from '../types/routinely';

type MoodScreenProps = {
  moodDetail: MoodDetailView;
  moodTrendBars: AnalyticsBar[];
  selectedDateLabel: string;
  selectedMood: number;
  onSelectMood: (mood: number) => void;
};

export function MoodScreen({
  moodDetail,
  moodTrendBars,
  selectedDateLabel,
  selectedMood,
  onSelectMood,
}: MoodScreenProps) {
  const moodMeta = selectedMood > 0 ? `${selectedMood}/5` : 'Not logged';
  const energyValue = moodDetail.hasFixture
    ? Number.parseInt(moodDetail.energyLabel, 10) / 10
    : 0;
  const stressValue = moodDetail.hasFixture
    ? Number.parseInt(moodDetail.stressLabel, 10) / 10
    : 0;

  return (
    <ScrollView contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide]} showsVerticalScrollIndicator={false}>
      <AppHeader subcopy="Mood tracking" />
      <GlassSurface borderRadius={radius.xl}>
        <View style={styles.heroTopRow}>
          <View style={styles.iconWrap}>
            <Ionicons color={colors.wellness} name="happy" size={24} />
          </View>
          <Text style={styles.heroMeta}>
            {selectedDateLabel} · {moodMeta}
          </Text>
        </View>
        <Text style={styles.title}>Mood check-in</Text>
        <Text style={styles.subtitle}>A quick signal, not a diary requirement.</Text>
      </GlassSurface>

      <Panel>
        <SectionHeader title={`${selectedDateLabel} mood`} meta="One editable log for this local date" compact />
        <MoodSelector selectedMood={selectedMood} onSelectMood={onSelectMood} />
        <Text style={styles.summary}>{moodDetail.summary}</Text>
        <View style={styles.scaleGrid}>
          <MiniScale
            label="Energy"
            tone={colors.wellness}
            value={energyValue}
            valueLabel={moodDetail.energyLabel}
          />
          <MiniScale
            label="Stress"
            tone={colors.warning}
            value={stressValue}
            valueLabel={moodDetail.stressLabel}
          />
        </View>
        <View style={styles.noteBox}>
          <Text style={styles.noteLabel}>Private note</Text>
          <Text style={styles.noteText}>{moodDetail.note}</Text>
        </View>
      </Panel>

      <AnalyticsBars bars={moodTrendBars} title="Mood trend" subtitle="A simple weekly pattern before deeper insights" />
    </ScrollView>
  );
}

function MiniScale({
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
    <View style={styles.miniScale}>
      <Text style={styles.miniScaleLabel}>{label}</Text>
      <Text style={styles.miniScaleValue}>{valueLabel}</Text>
      <ProgressBar accent={tone} value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  heroMeta: {
    color: colors.wellness,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  summary: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  scaleGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  miniScale: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    flex: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  miniScaleLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  miniScaleValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  noteBox: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  noteLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  noteText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
});
