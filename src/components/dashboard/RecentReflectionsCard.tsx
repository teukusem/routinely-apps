import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { NoteCard } from '../RoutinelyUI';
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
          <View style={styles.emptyIcon}>
            <Ionicons color={colors.primary} name="create-outline" size={22} />
          </View>
          <Text style={styles.emptyTitle}>No reflections yet</Text>
          <Text style={styles.emptyText}>Jot down a quick note after a habit or mood check-in.</Text>
        </View>
      </GlassSurface>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.promptRow}>
        <View style={styles.promptIcon}>
          <Ionicons color={colors.primary} name="book-outline" size={15} />
        </View>
        <Text style={styles.promptText}>Private notes tied to what you actually did today</Text>
      </View>

      <View style={styles.list}>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onPress={onNotePress ? () => onNotePress(note) : undefined}
            variant="prominent"
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  promptRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  promptIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
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
  list: {
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'center',
  },
});
