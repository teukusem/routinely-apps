import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View, type ColorValue } from 'react-native';

import { GlassSurface } from '../components/GlassSurface';
import { AnalyticsBars, AppHeader, MetricCard, Panel, SectionHeader, sharedStyles } from '../components/RoutinelyUI';
import { ProgressBar } from '../components/shared/ProgressBar';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { AnalyticsSummary } from '../types/routinely';

type AnalyticsScreenProps = {
  analytics: AnalyticsSummary;
};

export function AnalyticsScreen({ analytics }: AnalyticsScreenProps) {
  const bestBar = analytics.bars.reduce(
    (best, bar) => (bar.value > best.value ? bar : best),
    analytics.bars[0],
  );
  const weakestBar = analytics.bars.reduce(
    (weakest, bar) => (bar.value < weakest.value ? bar : weakest),
    analytics.bars[0],
  );
  const chartSubtitle = `${bestBar.label} peaked at ${Math.round(bestBar.value * 100)}% · ${weakestBar.label} dipped to ${Math.round(weakestBar.value * 100)}%`;

  return (
    <ScrollView
      contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide, styles.screenSections]}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader subcopy="Weekly insights" />
      <GlassSurface borderRadius={radius.xl}>
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.title}>Progress</Text>
            <Text style={styles.subtitle}>Readable signals for consistency, streaks, and weak spots.</Text>
            <View style={styles.heroMetaRow}>
              <Ionicons color={colors.focus} name="calendar-outline" size={11} />
              <Text style={styles.heroMeta}>Last 7 days</Text>
            </View>
          </View>
          <View style={[styles.statusPill, styles.statusPillActive]}>
            <Text style={[styles.statusCount, styles.statusCountActive]}>{analytics.completionRate}%</Text>
            <Text style={styles.statusLabel}>rate</Text>
          </View>
        </View>
      </GlassSurface>

      <Panel>
        <View style={styles.panelStack}>
          <View style={styles.promptRow}>
            <View style={styles.promptIcon}>
              <Ionicons color={colors.primary} name="pulse-outline" size={15} />
            </View>
            <Text style={styles.promptText}>Key signals from the past week</Text>
          </View>
          <View style={styles.metricRow}>
            <MetricCard
              icon="pie-chart"
              label="Completion rate"
              layout="stack"
              tone={colors.primary}
              value={`${analytics.completionRate}%`}
            />
            <MetricCard
              icon="flame"
              label="Current streak"
              layout="stack"
              tone={colors.success}
              value={`${analytics.currentStreakDays}d`}
            />
            <MetricCard
              icon="trophy"
              label="Longest streak"
              layout="stack"
              tone={colors.focus}
              value={`${analytics.longestStreakDays}d`}
            />
          </View>
        </View>
      </Panel>

      <AnalyticsBars
        bars={analytics.bars}
        highlightBestBar
        subtitle={chartSubtitle}
        title="Weekly completion"
      />

      <GlassSurface borderRadius={radius.md} noPadding overflowHidden variant="nested">
        <View style={styles.insightCard}>
          <View style={styles.insightAccent} />
          <View style={styles.insightBody}>
            <Text style={styles.insightLabel}>Week highlight</Text>
            <Text style={styles.insightText}>
              {bestBar.label} was your strongest day at {Math.round(bestBar.value * 100)}% completion.
            </Text>
          </View>
        </View>
      </GlassSurface>

      <Panel>
        <View style={styles.panelStack}>
          <View style={styles.promptRow}>
            <View style={styles.promptIcon}>
              <Ionicons color={colors.primary} name="bar-chart-outline" size={15} />
            </View>
            <View style={styles.panelHeaderCopy}>
              <SectionHeader title="Habit performance" meta="Best and weakest habits this week" compact />
            </View>
          </View>
          <View style={styles.rankList}>
            {analytics.topHabits.map((habit, index) => (
              <HabitRankCard key={habit.name} index={index + 1} name={habit.name} tone={habit.tone} value={habit.value} />
            ))}
          </View>
        </View>
      </Panel>
    </ScrollView>
  );
}

function HabitRankCard({
  index,
  name,
  tone,
  value,
}: {
  index: number;
  name: string;
  tone: ColorValue;
  value: string;
}) {
  const softTone = getToneSoft(tone);
  const progress = parseProgressValue(value);

  return (
    <GlassSurface borderRadius={radius.md} noPadding overflowHidden variant="nested">
      <View style={[styles.rankCard, { backgroundColor: softTone }]}>
        <View style={[styles.rankAccent, { backgroundColor: tone }]} />
        <View style={[styles.rankIndexBadge, { backgroundColor: tone }]}>
          <Text style={styles.rankIndexText}>{index}</Text>
        </View>
        <View style={styles.rankCopy}>
          <View style={styles.rankTopRow}>
            <Text numberOfLines={1} style={styles.rankName}>
              {name}
            </Text>
            <View style={[styles.rankValueBadge, { backgroundColor: colors.glassStrong, borderColor: tone }]}>
              <Text style={[styles.rankValueText, { color: tone }]}>{value}</Text>
            </View>
          </View>
          <ProgressBar accent={tone} value={progress} />
        </View>
      </View>
    </GlassSurface>
  );
}

function parseProgressValue(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed / 100 : 0;
}

function getToneSoft(tone: ColorValue): string {
  if (tone === colors.success) return colors.successSoft;
  if (tone === colors.warning) return colors.warningSoft;
  if (tone === colors.focus) return colors.focusSoft;
  if (tone === colors.primary) return colors.primarySoft;
  return colors.surfaceMuted;
}

const styles = StyleSheet.create({
  screenSections: {
    gap: spacing.lg,
  },
  hero: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 240,
  },
  heroMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  heroMeta: {
    color: colors.focus,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  statusPill: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 36,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  statusPillActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  statusCount: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  statusCountActive: {
    color: colors.primary,
  },
  statusLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  panelStack: {
    gap: spacing.md,
  },
  promptRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  promptIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    flexShrink: 0,
    height: 28,
    justifyContent: 'center',
    marginTop: 2,
    width: 28,
  },
  promptText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    paddingTop: 6,
  },
  panelHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  metricRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  insightCard: {
    flexDirection: 'row',
    minWidth: 0,
  },
  insightAccent: {
    backgroundColor: colors.primary,
    width: 4,
  },
  insightBody: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
  },
  insightLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  insightText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  rankList: {
    gap: spacing.sm,
  },
  rankCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
  },
  rankAccent: {
    alignSelf: 'stretch',
    width: 4,
  },
  rankIndexBadge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexShrink: 0,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  rankIndexText: {
    color: colors.onAccent,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  rankCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  rankTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  rankName: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  rankValueBadge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    flexShrink: 0,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  rankValueText: {
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
});
