import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../components/GlassSurface';
import { MoodCheckInCard } from '../components/dashboard/MoodCheckInCard';
import { AnalyticsBars, AppHeader, moodEmojiForScore, Panel, sharedStyles } from '../components/RoutinelyUI';
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
  const moodLogged = selectedMood > 0;
  const moodEmoji = moodEmojiForScore(selectedMood);
  const noteText = moodDetail.note.trim();
  const hasNote = noteText.length > 0;

  return (
    <ScrollView contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide]} showsVerticalScrollIndicator={false}>
      <AppHeader subcopy="Mood tracking" />
      <GlassSurface borderRadius={radius.xl}>
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.title}>Mood check-in</Text>
            <Text style={styles.subtitle}>A quick signal, not a diary requirement.</Text>
            <Text style={styles.dateMeta}>{selectedDateLabel}</Text>
          </View>
          <View style={[styles.statusPill, moodLogged && styles.statusPillLogged]}>
            {moodLogged ? (
              <>
                <Text style={styles.statusEmoji}>{moodEmoji}</Text>
                <Text style={styles.statusText}>{selectedMood}/5</Text>
              </>
            ) : (
              <Text style={styles.statusTextMuted}>Not logged</Text>
            )}
          </View>
        </View>
      </GlassSurface>

      <Panel>
        <View style={styles.checkInStack}>
          <MoodCheckInCard
            dateLabel={selectedDateLabel}
            moodDetail={moodDetail}
            onSelectMood={onSelectMood}
            selectedMood={selectedMood}
          />
          <GlassSurface borderRadius={radius.md} contentStyle={styles.noteContent} variant="nested">
            <View style={styles.noteHeader}>
              <Ionicons color={colors.textMuted} name="lock-closed-outline" size={12} />
              <Text style={styles.noteLabel}>Private note</Text>
            </View>
            <Text style={[styles.noteText, !hasNote && styles.notePlaceholder]}>
              {hasNote ? noteText : moodLogged ? 'No note for this day.' : 'Add a note after logging your mood.'}
            </Text>
          </GlassSurface>
        </View>
      </Panel>

      <AnalyticsBars
        bars={moodTrendBars}
        fillColor={colors.wellness}
        subtitle="A simple weekly pattern before deeper insights"
        title="Mood trend"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  dateMeta: {
    color: colors.wellness,
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
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.sm + 2,
  },
  statusPillLogged: {
    backgroundColor: colors.wellnessSoft,
    borderColor: colors.wellness,
  },
  statusEmoji: {
    fontSize: 14,
    lineHeight: 18,
  },
  statusText: {
    color: colors.wellness,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  statusTextMuted: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  checkInStack: {
    gap: spacing.md,
  },
  noteContent: {
    gap: spacing.xs,
  },
  noteHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  noteLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  noteText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  notePlaceholder: {
    color: colors.textMuted,
    fontStyle: 'italic',
    fontWeight: '400',
  },
});
