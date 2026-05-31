import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View, type ColorValue } from 'react-native';

import { GlassSurface } from '../components/GlassSurface';
import { AnalyticsBars, AppHeader, MetricCard, Panel, SectionHeader, sharedStyles } from '../components/RoutinelyUI';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { AnalyticsSummary } from '../types/routinely';

type AnalyticsScreenProps = {
  analytics: AnalyticsSummary;
};

export function AnalyticsScreen({ analytics }: AnalyticsScreenProps) {
  return (
    <ScrollView contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide]} showsVerticalScrollIndicator={false}>
      <AppHeader subcopy="Weekly insights" />
      <GlassSurface borderRadius={radius.xl}>
        <View style={styles.heroTopRow}>
          <View style={styles.iconWrap}>
            <Ionicons color={colors.primary} name="stats-chart" size={24} />
          </View>
          <Text style={styles.heroMeta}>Last 7 days</Text>
        </View>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Readable signals for consistency, streaks, and weak spots.</Text>
      </GlassSurface>

      <View style={styles.metricRow}>
        <MetricCard
          icon="pie-chart"
          label="Completion rate"
          tone={colors.primary}
          value={`${analytics.completionRate}%`}
        />
        <MetricCard
          icon="flame"
          label="Current streak"
          tone={colors.success}
          value={`${analytics.currentStreakDays}d`}
        />
        <MetricCard
          icon="trophy"
          label="Longest streak"
          tone={colors.focus}
          value={`${analytics.longestStreakDays}d`}
        />
      </View>

      <AnalyticsBars bars={analytics.bars} title="Weekly completion" subtitle="Completion trend by weekday" />

      <Panel>
        <SectionHeader title="Habit performance" meta="Best and weakest habits" compact />
        {analytics.topHabits.map((habit) => (
          <RankRow key={habit.name} name={habit.name} tone={habit.tone} value={habit.value} />
        ))}
      </Panel>
    </ScrollView>
  );
}

function RankRow({ name, tone, value }: { name: string; tone: ColorValue; value: string }) {
  return (
    <View style={styles.rankRow}>
      <View style={[styles.rankDot, { backgroundColor: tone }]} />
      <Text style={styles.rankName}>{name}</Text>
      <Text style={styles.rankValue}>{value}</Text>
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
    color: colors.primary,
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
  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rankRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rankDot: {
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  rankName: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 20,
  },
  rankValue: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
});
