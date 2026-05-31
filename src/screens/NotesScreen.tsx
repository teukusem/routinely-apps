import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../components/GlassSurface';
import { AppHeader, NoteCard, Panel, SectionHeader, sharedStyles } from '../components/RoutinelyUI';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { NotePreview } from '../types/routinely';

type NotesScreenProps = {
  notes: NotePreview[];
};

export function NotesScreen({ notes }: NotesScreenProps) {
  return (
    <ScrollView contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide]} showsVerticalScrollIndicator={false}>
      <AppHeader />
      <GlassSurface borderRadius={radius.xl}>
        <View style={styles.hero}>
          <View>
            <Text style={styles.title}>Notes</Text>
            <Text style={styles.subtitle}>Short reflections connected to what actually happened.</Text>
          </View>
          <Pressable accessibilityLabel="Create note" accessibilityRole="button" style={styles.createButton}>
            <Ionicons color={colors.onAccent} name="create" size={18} />
            <Text style={styles.createText}>New</Text>
          </Pressable>
        </View>
      </GlassSurface>

      <GlassSurface borderRadius={radius.lg} style={styles.searchBox} variant="nested">
        <Ionicons color={colors.textMuted} name="search" size={18} />
        <Text style={styles.searchText}>Search reflections and habit notes</Text>
      </GlassSurface>

      <Panel>
        <SectionHeader title="Recent notes" meta="Habit and mood context included" compact />
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </Panel>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
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
    maxWidth: 220,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: colors.focus,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  createText: {
    color: colors.onAccent,
    fontSize: 12,
    fontWeight: '800',
  },
  searchBox: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
  },
  searchText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
