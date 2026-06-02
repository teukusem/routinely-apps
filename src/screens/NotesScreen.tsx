import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { GlassSurface } from '../components/GlassSurface';
import { AppHeader, NoteCard, Panel, ScreenContent, SectionHeader, sharedStyles } from '../components/RoutinelyUI';
import { Icon, IconBadge } from '../components/shared/Icon';
import { NoteDetailContent } from '../components/shared/NoteDetailContent';
import { RoutinelySheetModal } from '../components/shared/RoutinelySheetModal';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { NotePreview } from '../types/routinely';

type NotesScreenProps = {
  notes: NotePreview[];
  onCreateNote: (draft: { title: string; body: string }) => void;
  onOpenProfile: () => void;
  onOverlayOpenChange?: (isOpen: boolean) => void;
};

export function NotesScreen({ notes, onCreateNote, onOpenProfile, onOverlayOpenChange }: NotesScreenProps) {
  const [query, setQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [selectedNote, setSelectedNote] = useState<NotePreview | null>(null);
  const createSheetRef = useRef<BottomSheetModal>(null);
  const detailSheetRef = useRef<BottomSheetModal>(null);
  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;

  const filteredNotes = useMemo(() => {
    const keyword = trimmedQuery.toLowerCase();
    if (keyword.length === 0) {
      return notes;
    }

    return notes.filter((note) => {
      const haystack = `${note.title} ${note.body} ${note.linkedTo}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [notes, trimmedQuery]);

  const sectionMeta = isSearching
    ? `${filteredNotes.length} match${filteredNotes.length === 1 ? '' : 'es'}`
    : `${notes.length} reflection${notes.length === 1 ? '' : 's'}`;

  function openCreateSheet() {
    onOverlayOpenChange?.(true);
    createSheetRef.current?.present();
  }

  function closeCreateSheet() {
    createSheetRef.current?.dismiss();
  }

  function openDetailSheet(note: NotePreview) {
    setSelectedNote(note);
    onOverlayOpenChange?.(true);
    detailSheetRef.current?.present();
  }

  function closeDetailSheet() {
    detailSheetRef.current?.dismiss();
  }

  function handleDismissCreateSheet() {
    onOverlayOpenChange?.(false);
    setNewTitle('');
    setNewBody('');
  }

  function handleDismissDetailSheet() {
    onOverlayOpenChange?.(false);
    setSelectedNote(null);
  }

  function submitCreateNote() {
    if (newTitle.trim().length === 0 || newBody.trim().length === 0) {
      return;
    }

    onCreateNote({
      body: newBody,
      title: newTitle,
    });
    closeCreateSheet();
  }

  function clearSearch() {
    setQuery('');
  }

  return (
    <>
      <ScrollView contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide]} showsVerticalScrollIndicator={false}>
        <AppHeader onPressProfile={onOpenProfile} subcopy="Reflections" />
        <ScreenContent>
        <GlassSurface borderRadius={radius.xl}>
          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.title}>Notes</Text>
              <Text style={styles.subtitle}>Short reflections connected to what actually happened.</Text>
              <View style={styles.heroMetaRow}>
                <Icon accent="teal" name="shield-checkmark-outline" size="xs" />
                <Text style={styles.heroMeta}>Private · only you</Text>
              </View>
            </View>
            <View style={[styles.statusPill, notes.length > 0 && styles.statusPillActive]}>
              <Text style={[styles.statusCount, notes.length > 0 && styles.statusCountActive]}>{notes.length}</Text>
              <Text style={styles.statusLabel}>{notes.length === 1 ? 'note' : 'notes'}</Text>
            </View>
          </View>
        </GlassSurface>

        <Panel>
          <View style={styles.panelStack}>
            <View style={styles.toolbarRow}>
              <View style={styles.promptRow}>
                <IconBadge accent="lavender" badgeSize={28} name="newspaper-outline" size={15} />
                <Text style={styles.promptText}>Reflections tied to habits and mood</Text>
              </View>
              <Pressable
                accessibilityLabel="Create note"
                accessibilityRole="button"
                onPress={openCreateSheet}
                style={({ pressed }) => [styles.createButton, pressed && styles.createButtonPressed]}
              >
                <Icon accent="mint" name="add-circle" size={16} />
                <Text style={styles.createText}>Create</Text>
              </Pressable>
            </View>

            <GlassSurface borderRadius={radius.md} contentStyle={styles.searchContent} style={styles.searchBox} variant="nested">
              <Icon accent={isSearching ? 'sky' : undefined} color={isSearching ? undefined : colors.textMuted} name="search" size="lg" />
              <TextInput
                accessibilityLabel="Search reflections and habit notes"
                onChangeText={setQuery}
                placeholder="Search reflections and habit notes"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                value={query}
              />
              {isSearching ? (
                <Pressable
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={clearSearch}
                  style={styles.clearSearchButton}
                >
                  <Icon accent="coral" name="close-circle" size="lg" />
                </Pressable>
              ) : null}
            </GlassSurface>

            <SectionHeader
              compact
              meta={sectionMeta}
              title={isSearching ? 'Search results' : 'Recent notes'}
            />

            {filteredNotes.length === 0 ? (
              <GlassSurface borderRadius={radius.md} variant="nested">
                <View style={styles.emptyState}>
                  <IconBadge
                    accent={isSearching ? 'sky' : 'lavender'}
                    badgeSize={40}
                    name={isSearching ? 'search-circle-outline' : 'newspaper-outline'}
                    size="xl"
                  />
                  <Text style={styles.emptyTitle}>{isSearching ? 'No matching notes' : 'No notes yet'}</Text>
                  <Text style={styles.emptyText}>
                    {isSearching
                      ? 'Try a different keyword or clear search.'
                      : 'Capture a quick thought after a habit or mood check-in.'}
                  </Text>
                  {!isSearching ? (
                    <Pressable
                      accessibilityLabel="Create your first note"
                      accessibilityRole="button"
                      onPress={openCreateSheet}
                      style={({ pressed }) => [styles.emptyAction, pressed && styles.emptyActionPressed]}
                    >
                      <Text style={styles.emptyActionText}>Create your first note</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      accessibilityLabel="Clear search"
                      accessibilityRole="button"
                      onPress={clearSearch}
                      style={({ pressed }) => [styles.emptyAction, pressed && styles.emptyActionPressed]}
                    >
                      <Text style={styles.emptyActionText}>Clear search</Text>
                    </Pressable>
                  )}
                </View>
              </GlassSurface>
            ) : (
              <View style={styles.noteList}>
                {filteredNotes.map((note) => (
                  <NoteCard key={note.id} note={note} onPress={() => openDetailSheet(note)} />
                ))}
              </View>
            )}
          </View>
        </Panel>
        </ScreenContent>
      </ScrollView>

      <RoutinelySheetModal
        ref={createSheetRef}
        contentStyle={styles.sheetContent}
        footer={
          <View style={styles.sheetActions}>
            <Pressable accessibilityLabel="Cancel creating note" accessibilityRole="button" onPress={closeCreateSheet} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Create note"
              accessibilityRole="button"
              accessibilityState={{ disabled: newTitle.trim().length === 0 || newBody.trim().length === 0 }}
              disabled={newTitle.trim().length === 0 || newBody.trim().length === 0}
              onPress={submitCreateNote}
              style={[styles.submitButton, (newTitle.trim().length === 0 || newBody.trim().length === 0) && styles.submitButtonDisabled]}
            >
              <Text style={styles.submitButtonText}>Create note</Text>
            </Pressable>
          </View>
        }
        onDismiss={handleDismissCreateSheet}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>New note</Text>
          <View style={styles.sheetMetaRow}>
            <Icon accent="teal" name="shield-checkmark-outline" size={12} />
            <Text style={styles.sheetMeta}>Only visible to you</Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.inputLabel}>Title</Text>
          <GlassSurface borderRadius={radius.lg} contentStyle={styles.inputSurfaceContent} variant="nested">
            <TextInput
              accessibilityLabel="Note title"
              onChangeText={setNewTitle}
              placeholder="e.g. Why I skipped hydration"
              placeholderTextColor={colors.textMuted}
              style={styles.titleInput}
              value={newTitle}
            />
          </GlassSurface>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.inputLabel}>Note</Text>
          <GlassSurface borderRadius={radius.lg} contentStyle={styles.bodySurfaceContent} variant="nested">
            <TextInput
              accessibilityLabel="Note body"
              multiline
              onChangeText={setNewBody}
              placeholder="Write quick reflection..."
              placeholderTextColor={colors.textMuted}
              style={styles.bodyInput}
              textAlignVertical="top"
              value={newBody}
            />
          </GlassSurface>
        </View>
      </RoutinelySheetModal>

      <RoutinelySheetModal
        ref={detailSheetRef}
        contentKey={selectedNote?.id}
        contentStyle={styles.sheetContent}
        footer={
          <Pressable accessibilityLabel="Close note detail" accessibilityRole="button" onPress={closeDetailSheet} style={styles.closeDetailButton}>
            <Text style={styles.closeDetailButtonText}>Close</Text>
          </Pressable>
        }
        onDismiss={handleDismissDetailSheet}
      >
        {selectedNote ? <NoteDetailContent note={selectedNote} /> : null}
      </RoutinelySheetModal>
    </>
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
    minHeight: 44,
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
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  panelStack: {
    gap: spacing.md,
  },
  toolbarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  promptRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  promptText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
  },
  createButtonPressed: {
    opacity: 0.88,
  },
  createText: {
    color: colors.onAccent,
    fontSize: 13,
    fontWeight: '800',
    includeFontPadding: false,
    lineHeight: 16,
  },
  searchBox: {
    minHeight: 48,
  },
  searchContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  clearSearchButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  noteList: {
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
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
  emptyAction: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  emptyActionPressed: {
    opacity: 0.8,
  },
  emptyActionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  sheetContent: {
    gap: spacing.md,
  },
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
  fieldGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  inputSurfaceContent: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  bodySurfaceContent: {
    minHeight: 120,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  titleInput: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    includeFontPadding: false,
    lineHeight: 18,
    margin: 0,
    paddingVertical: 0,
    textAlignVertical: 'center',
    ...(Platform.OS === 'ios' ? { paddingTop: 0 } : {}),
  },
  bodyInput: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    minHeight: 96,
    paddingVertical: 0,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  submitButtonDisabled: {
    backgroundColor: colors.primarySoft,
    opacity: 0.72,
  },
  submitButtonText: {
    color: colors.onAccent,
    fontSize: 12,
    fontWeight: '800',
  },
  closeDetailButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  closeDetailButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
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
    lineHeight: 14,
  },
  detailBodyContent: {
    gap: spacing.sm,
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
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
});
