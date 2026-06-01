import { StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { NoteCard } from '../RoutinelyUI';
import { IconBadge } from '../shared/Icon';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import type { NotePreview } from '../../types/routinely';

type RecentReflectionsCardProps = {
  notes: NotePreview[];
  onNotePress?: (note: NotePreview) => void;
};

export function RecentReflectionsCard({ notes, onNotePress }: RecentReflectionsCardProps) {
  if (notes.length === 0) {
    return (
      <GlassSurface borderRadius={radius.md} variant="nested">
        <View style={styles.emptyState}>
          <IconBadge accent="lavender" badgeSize={32} name="sparkles" size="md" />
          <Text style={styles.emptyTitle}>No reflections yet</Text>
          <Text numberOfLines={2} style={styles.emptyText}>
            Jot down a quick note after a habit or mood check-in.
          </Text>
        </View>
      </GlassSurface>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.promptRow}>
        <IconBadge accent="lavender" badgeSize={32} name="newspaper-outline" size="sm" />
        <Text ellipsizeMode="tail" numberOfLines={1} style={styles.promptText}>
          Private notes tied to what you actually did today
        </Text>
      </View>

      <View style={styles.list}>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onPress={onNotePress ? () => onNotePress(note) : undefined}
            variant="compact"
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  promptRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  promptText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  list: {
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
    textAlign: 'center',
  },
});
