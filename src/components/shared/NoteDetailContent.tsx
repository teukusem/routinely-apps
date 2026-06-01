import { StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { getNoteLinkStyle } from '../RoutinelyUI';
import { Icon } from './Icon';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import type { NotePreview } from '../../types/routinely';

export function NoteDetailContent({ note }: { note: NotePreview }) {
  const linkStyle = getNoteLinkStyle(note.linkedTo);

  return (
    <>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>{note.title}</Text>
        <View style={styles.sheetMetaRow}>
          <Icon accent="teal" name="shield-checkmark-outline" size={12} />
          <Text style={styles.sheetMeta}>Only visible to you</Text>
        </View>
      </View>

      <View style={[styles.detailLinkChip, { backgroundColor: linkStyle.backgroundColor }]}>
        <Icon color={linkStyle.tone} name="git-network-outline" size={12} />
        <Text style={[styles.detailLinkChipText, { color: linkStyle.tone }]}>
          Linked to {note.linkedTo}
        </Text>
      </View>

      <GlassSurface borderRadius={radius.lg} contentStyle={styles.detailBodyContent} variant="nested">
        <Text style={styles.detailBodyLabel}>Note</Text>
        <Text style={styles.detailBodyText}>{note.body}</Text>
      </GlassSurface>
    </>
  );
}

const styles = StyleSheet.create({
  sheetHeader: {
    gap: spacing.xs,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
  },
  sheetMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sheetMeta: {
    color: colors.focus,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  detailLinkChip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  detailLinkChipText: {
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
  detailBodyContent: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  detailBodyLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  detailBodyText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
