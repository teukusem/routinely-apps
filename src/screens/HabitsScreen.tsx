import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../components/GlassSurface';
import { HabitCard } from '../components/habits/HabitCard';
import { Panel } from '../components/shared/Panel';
import { SectionHeader } from '../components/shared/SectionHeader';
import { AppHeader, sharedStyles } from '../components/RoutinelyUI';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { Habit } from '../types/routinely';

type HabitsScreenProps = {
  habits: Habit[];
};

export function HabitsScreen({ habits }: HabitsScreenProps) {
  return (
    <ScrollView contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide]} showsVerticalScrollIndicator={false}>
      <AppHeader subcopy="Manage routines" />
      <GlassSurface borderRadius={radius.xl}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerIcon}>
            <Ionicons color={colors.primary} name="repeat" size={22} />
          </View>
          <Text style={styles.headerMeta}>{habits.length} active</Text>
        </View>
        <Text style={styles.title}>Routines</Text>
        <Text style={styles.subtitle}>Manage what repeats. Keep dashboard clean for doing, not configuring.</Text>
      </GlassSurface>

      <View style={styles.filterRow}>
        {['Active', 'Health', 'Learning', 'Missed'].map((filter) => (
          <GlassSurface borderRadius={radius.pill} key={filter} noPadding style={styles.filterChip} variant="nested">
            <Text style={styles.filterText}>{filter}</Text>
          </GlassSurface>
        ))}
      </View>

      <Panel>
        <View style={styles.panelHeaderRow}>
          <View style={styles.panelHeaderCopy}>
            <SectionHeader title="Active habits" meta="Edit, archive, or open details" compact />
          </View>
          <Pressable accessibilityLabel="Create habit" accessibilityRole="button" style={styles.createButton}>
            <Ionicons color={colors.onAccent} name="add" size={18} />
            <Text style={styles.createButtonText}>Create</Text>
          </Pressable>
        </View>
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} showManagement />
        ))}
      </Panel>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerMeta: {
    color: colors.textMuted,
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  panelHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  panelHeaderCopy: {
    flex: 1,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  createButtonText: {
    color: colors.onAccent,
    fontSize: 12,
    fontWeight: '800',
  },
});
