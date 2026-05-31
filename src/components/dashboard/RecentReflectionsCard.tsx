import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import type { NotePreview } from '../../types/routinely';

type RecentReflectionsCardProps = {
  notes: NotePreview[];
};

function getLinkStyle(linkedTo: string) {
  if (linkedTo.toLowerCase().includes('mood')) {
    return { backgroundColor: colors.wellnessSoft, tone: colors.wellness };
  }

  return { backgroundColor: colors.primarySoft, tone: colors.primary };
}

export function RecentReflectionsCard({ notes }: RecentReflectionsCardProps) {
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
          <ReflectionRow key={note.id} note={note} />
        ))}
      </View>
    </View>
  );
}

function ReflectionRow({ note }: { note: NotePreview }) {
  const linkStyle = getLinkStyle(note.linkedTo);

  return (
    <Pressable
      accessibilityLabel={`Open note ${note.title}, linked to ${note.linkedTo}`}
      accessibilityRole="button"
      style={({ pressed }) => [pressed && styles.rowPressed]}
    >
      <GlassSurface borderRadius={radius.md} noPadding overflowHidden variant="nested">
        <View style={styles.noteRow}>
          <View style={[styles.noteAccent, { backgroundColor: linkStyle.tone }]} />
          <View style={[styles.noteIcon, { backgroundColor: linkStyle.tone }]}>
            <Ionicons color={colors.onAccent} name="document-text" size={14} />
          </View>
          <View style={styles.noteCopy}>
            <Text numberOfLines={1} style={styles.noteTitle}>
              {note.title}
            </Text>
            <Text numberOfLines={2} style={styles.noteBody}>
              {note.body}
            </Text>
            <View style={[styles.linkChip, { backgroundColor: linkStyle.backgroundColor }]}>
              <Ionicons color={linkStyle.tone} name="link" size={11} />
              <Text numberOfLines={1} style={[styles.linkChipText, { color: linkStyle.tone }]}>
                {note.linkedTo}
              </Text>
            </View>
          </View>
          <Ionicons color={colors.textMuted} name="chevron-forward" size={16} />
        </View>
      </GlassSurface>
    </Pressable>
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
    gap: spacing.sm,
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
  rowPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  noteRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
  },
  noteAccent: {
    alignSelf: 'stretch',
    width: 3,
  },
  noteIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexShrink: 0,
    height: 32,
    justifyContent: 'center',
    width: 32,
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
    lineHeight: 18,
  },
  noteBody: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  linkChip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    maxWidth: '100%',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  linkChipText: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
});
