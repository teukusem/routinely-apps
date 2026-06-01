import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { GlassSurface } from '../components/GlassSurface';
import { AppHeader, EmptyState, NoteCard, Panel, SectionHeader, sharedStyles } from '../components/RoutinelyUI';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { NotePreview } from '../types/routinely';

type NotesScreenProps = {
  notes: NotePreview[];
  onCreateNote: (draft: { title: string; body: string }) => void;
  onOverlayOpenChange?: (isOpen: boolean) => void;
};

export function NotesScreen({ notes, onCreateNote, onOverlayOpenChange }: NotesScreenProps) {
  const [query, setQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const sheetRef = useRef<BottomSheetModal>(null);

  const filteredNotes = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (keyword.length === 0) {
      return notes;
    }

    return notes.filter((note) => {
      const haystack = `${note.title} ${note.body} ${note.linkedTo}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [notes, query]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.42} />
    ),
    [],
  );

  function openCreateSheet() {
    onOverlayOpenChange?.(true);
    sheetRef.current?.present();
  }

  function closeCreateSheet() {
    sheetRef.current?.dismiss();
  }

  function handleDismissSheet() {
    onOverlayOpenChange?.(false);
    setNewTitle('');
    setNewBody('');
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

  return (
    <>
      <ScrollView contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide]} showsVerticalScrollIndicator={false}>
        <AppHeader />
        <GlassSurface borderRadius={radius.xl}>
          <View style={styles.hero}>
            <View>
              <Text style={styles.title}>Notes</Text>
              <Text style={styles.subtitle}>Short reflections connected to what actually happened.</Text>
            </View>
            <Pressable accessibilityLabel="Create note" accessibilityRole="button" onPress={openCreateSheet} style={styles.createButton}>
              <Ionicons color={colors.onAccent} name="add" size={15} />
              <Text style={styles.createText}>Create</Text>
            </Pressable>
          </View>
        </GlassSurface>

        <GlassSurface borderRadius={radius.lg} contentStyle={styles.searchContent} style={styles.searchBox} variant="nested">
          <Ionicons color={colors.textMuted} name="search" size={18} />
          <TextInput
            onChangeText={setQuery}
            placeholder="Search reflections and habit notes"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={query}
          />
        </GlassSurface>

        <Panel>
          <SectionHeader title="Recent notes" meta={`${filteredNotes.length} found`} compact />
          {filteredNotes.length === 0 ? (
            <EmptyState
              description={query.trim().length > 0 ? 'Try a different keyword or clear search.' : 'Tap Create to write your first note.'}
              icon={query.trim().length > 0 ? 'search-outline' : 'document-text-outline'}
              title={query.trim().length > 0 ? 'No matching notes' : 'No notes yet'}
            />
          ) : (
            filteredNotes.map((note) => <NoteCard key={note.id} note={note} />)
          )}
        </Panel>
      </ScrollView>

      <BottomSheetModal
        ref={sheetRef}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        enablePanDownToClose
        enableDynamicSizing
        handleIndicatorStyle={styles.sheetHandle}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        maxDynamicContentSize={640}
        onDismiss={handleDismissSheet}
        snapPoints={['64%']}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>New Note</Text>

          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            onChangeText={setNewTitle}
            placeholder="e.g. Why I skipped hydration"
            placeholderTextColor="#9CA3AF"
            style={styles.titleInput}
            value={newTitle}
          />

          <Text style={styles.inputLabel}>Note</Text>
          <TextInput
            multiline
            onChangeText={setNewBody}
            placeholder="Write quick reflection..."
            placeholderTextColor="#9CA3AF"
            style={styles.bodyInput}
            textAlignVertical="top"
            value={newBody}
          />

          <View style={styles.sheetActions}>
            <Pressable onPress={closeCreateSheet} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={newTitle.trim().length === 0 || newBody.trim().length === 0}
              onPress={submitCreateNote}
              style={[styles.submitButton, (newTitle.trim().length === 0 || newBody.trim().length === 0) && styles.submitButtonDisabled]}
            >
              <Text style={styles.submitButtonText}>Create note</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
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
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.sm + 2,
  },
  createText: {
    color: colors.onAccent,
    fontSize: 11,
    fontWeight: '800',
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
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  sheetHandle: {
    backgroundColor: '#D1D5DB',
    width: 44,
  },
  sheetContent: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  sheetTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: spacing.md,
  },
  inputLabel: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  titleInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: radius.md,
    borderWidth: 1,
    color: '#111827',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  bodyInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: radius.md,
    borderWidth: 1,
    color: '#111827',
    minHeight: 120,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButtonText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '800',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  submitButtonDisabled: {
    backgroundColor: colors.primaryPressed,
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.onAccent,
    fontSize: 12,
    fontWeight: '800',
  },
});
