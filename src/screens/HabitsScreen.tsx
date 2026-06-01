import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { GlassSurface } from '../components/GlassSurface';
import { HabitCard } from '../components/habits/HabitCard';
import { AppHeader, EmptyState, sharedStyles } from '../components/RoutinelyUI';
import { Panel } from '../components/shared/Panel';
import { SectionHeader } from '../components/shared/SectionHeader';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { DailyHabitView, TimePeriod } from '../types/routinely';

type HabitsScreenProps = {
  dailyHabits: DailyHabitView[];
  onCreateHabit: (draft: { name: string; category: string; timePeriod: TimePeriod }) => void;
  onArchiveHabit: (habitId: string) => void;
  onEditHabit: (draft: { habitId: string; name: string; category: string; timePeriod: TimePeriod }) => void;
  onOverlayOpenChange?: (isOpen: boolean) => void;
};

type HabitFilter = 'Active' | 'Health' | 'Learning' | 'Missed';
type HabitCategory = 'Health' | 'Learning' | 'Productivity' | 'Mindfulness' | 'General';
type SheetMode = 'create' | 'detail' | 'edit';

const filters: HabitFilter[] = ['Active', 'Health', 'Learning', 'Missed'];
const categoryOptions: HabitCategory[] = ['Health', 'Learning', 'Productivity', 'Mindfulness', 'General'];
const timePeriodOptions: TimePeriod[] = ['Morning', 'Afternoon', 'Evening', 'Anytime'];

export function HabitsScreen({
  dailyHabits,
  onArchiveHabit,
  onCreateHabit,
  onOverlayOpenChange,
  onEditHabit,
}: HabitsScreenProps) {
  const [activeFilter, setActiveFilter] = useState<HabitFilter>('Active');
  const [sheetMode, setSheetMode] = useState<SheetMode>('create');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>('General');
  const [newHabitTimePeriod, setNewHabitTimePeriod] = useState<TimePeriod>('Anytime');

  const [editHabitName, setEditHabitName] = useState('');
  const [editHabitCategory, setEditHabitCategory] = useState<HabitCategory>('General');
  const [editHabitTimePeriod, setEditHabitTimePeriod] = useState<TimePeriod>('Anytime');

  const sheetRef = useRef<BottomSheetModal>(null);

  const filteredHabits = useMemo(() => {
    if (activeFilter === 'Active') {
      return dailyHabits;
    }

    if (activeFilter === 'Missed') {
      return dailyHabits.filter((habit) => habit.status === 'missed');
    }

    return dailyHabits.filter((habit) => habit.category === activeFilter);
  }, [activeFilter, dailyHabits]);

  const selectedHabit = useMemo(
    () => dailyHabits.find((habit) => habit.id === selectedHabitId),
    [dailyHabits, selectedHabitId],
  );

  const snapPoints = useMemo(() => {
    if (sheetMode === 'detail') {
      return ['42%'];
    }
    return ['64%'];
  }, [sheetMode]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.42} />
    ),
    [],
  );

  function resetCreateForm() {
    setNewHabitName('');
    setNewHabitCategory('General');
    setNewHabitTimePeriod('Anytime');
  }

  function openCreateSheet() {
    setSheetMode('create');
    if (activeFilter === 'Health' || activeFilter === 'Learning') {
      setNewHabitCategory(activeFilter);
    } else {
      setNewHabitCategory('General');
    }
    onOverlayOpenChange?.(true);
    sheetRef.current?.present();
  }

  function openDetailSheet(habitId: string) {
    setSelectedHabitId(habitId);
    setSheetMode('detail');
    onOverlayOpenChange?.(true);
    sheetRef.current?.present();
  }

  function openEditSheet(habitId: string) {
    const habit = dailyHabits.find((item) => item.id === habitId);
    if (!habit) {
      return;
    }

    setSelectedHabitId(habitId);
    setEditHabitName(habit.name);
    setEditHabitCategory(toHabitCategory(habit.category));
    setEditHabitTimePeriod(habit.timePeriod);
    setSheetMode('edit');
    onOverlayOpenChange?.(true);
    sheetRef.current?.present();
  }

  function closeSheet() {
    sheetRef.current?.dismiss();
  }

  function handleSheetDismiss() {
    onOverlayOpenChange?.(false);
    resetCreateForm();
  }

  function submitCreateHabit() {
    if (newHabitName.trim().length === 0) {
      return;
    }

    onCreateHabit({
      name: newHabitName,
      category: newHabitCategory,
      timePeriod: newHabitTimePeriod,
    });
    closeSheet();
  }

  function submitEditHabit() {
    if (!selectedHabitId || editHabitName.trim().length === 0) {
      return;
    }

    onEditHabit({
      habitId: selectedHabitId,
      name: editHabitName,
      category: editHabitCategory,
      timePeriod: editHabitTimePeriod,
    });
    closeSheet();
  }

  function handleArchiveHabit(habitId: string) {
    const habit = dailyHabits.find((item) => item.id === habitId);
    if (!habit) {
      return;
    }

    Alert.alert('Archive habit', `Archive "${habit.name}"?`, [
      { style: 'cancel', text: 'Cancel' },
      {
        style: 'destructive',
        text: 'Archive',
        onPress: () => onArchiveHabit(habitId),
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide]} showsVerticalScrollIndicator={false}>
        <AppHeader subcopy="Manage routines" />
        <GlassSurface borderRadius={radius.xl}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerIcon}>
              <Ionicons color={colors.primary} name="repeat" size={22} />
            </View>
            <Text style={styles.headerMeta}>{dailyHabits.length} active</Text>
          </View>
          <Text style={styles.title}>Routines</Text>
          <Text style={styles.subtitle}>Manage what repeats. Keep dashboard clean for doing, not configuring.</Text>
        </GlassSurface>

        <View style={styles.filterRow}>
          {filters.map((filter) => {
            const selected = activeFilter === filter;
            return (
              <Pressable key={filter} onPress={() => setActiveFilter(filter)} style={({ pressed }) => [pressed && styles.filterPressed]}>
                <GlassSurface
                  borderRadius={radius.pill}
                  noPadding
                  style={[styles.filterChip, selected && styles.filterChipActive]}
                  variant={selected ? 'card' : 'nested'}
                >
                  <Text style={[styles.filterText, selected && styles.filterTextActive]}>{filter}</Text>
                </GlassSurface>
              </Pressable>
            );
          })}
        </View>

        <Panel>
          <View style={styles.panelHeaderRow}>
            <View style={styles.panelHeaderCopy}>
              <SectionHeader title={`${activeFilter} habits`} meta={`${filteredHabits.length} shown`} compact />
            </View>
            <Pressable accessibilityLabel="Create habit" accessibilityRole="button" onPress={openCreateSheet} style={styles.createButton}>
              <Ionicons color={colors.onAccent} name="add" size={15} />
              <Text style={styles.createButtonText}>Create</Text>
            </Pressable>
          </View>
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onPressArchive={handleArchiveHabit}
              onPressDetail={openDetailSheet}
              onPressEdit={openEditSheet}
              showManagement
            />
          ))}
          {filteredHabits.length === 0 ? (
            <EmptyState
              description="Create one to start tracking this filter."
              icon="repeat-outline"
              title="No habits found"
            />
          ) : null}
        </Panel>
      </ScrollView>

      <BottomSheetModal
        ref={sheetRef}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        enableDynamicSizing
        enablePanDownToClose
        handleIndicatorStyle={styles.sheetHandle}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        maxDynamicContentSize={640}
        onDismiss={handleSheetDismiss}
        snapPoints={snapPoints}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          {sheetMode === 'create' ? (
            <>
              <Text style={styles.sheetTitle}>Create Habit</Text>

              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                onChangeText={setNewHabitName}
                placeholder="e.g. 30-minute coding practice"
                placeholderTextColor="#9CA3AF"
                style={styles.nameInput}
                value={newHabitName}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.optionRow}>
                {categoryOptions.map((category) => {
                  const selected = newHabitCategory === category;
                  return (
                    <Pressable key={category} onPress={() => setNewHabitCategory(category)}>
                      <GlassSurface
                        borderRadius={radius.pill}
                        noPadding
                        style={[styles.optionChip, selected && styles.optionChipActive]}
                        variant={selected ? 'card' : 'nested'}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextActive]}>{category}</Text>
                      </GlassSurface>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Time Period</Text>
              <View style={styles.optionRow}>
                {timePeriodOptions.map((period) => {
                  const selected = newHabitTimePeriod === period;
                  return (
                    <Pressable key={period} onPress={() => setNewHabitTimePeriod(period)}>
                      <GlassSurface
                        borderRadius={radius.pill}
                        noPadding
                        style={[styles.optionChip, selected && styles.optionChipActive]}
                        variant={selected ? 'card' : 'nested'}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextActive]}>{period}</Text>
                      </GlassSurface>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.sheetActions}>
                <Pressable onPress={closeSheet} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  disabled={newHabitName.trim().length === 0}
                  onPress={submitCreateHabit}
                  style={[styles.submitButton, newHabitName.trim().length === 0 && styles.submitButtonDisabled]}
                >
                  <Text style={styles.submitButtonText}>Create habit</Text>
                </Pressable>
              </View>
            </>
          ) : null}

          {sheetMode === 'detail' && selectedHabit ? (
            <>
              <Text style={styles.sheetTitle}>Habit Detail</Text>
              <Text style={styles.detailText}>Name: {selectedHabit.name}</Text>
              <Text style={styles.detailText}>Category: {selectedHabit.category}</Text>
              <Text style={styles.detailText}>Time period: {selectedHabit.timePeriod}</Text>
              <Text style={styles.detailText}>Target: {selectedHabit.target} {selectedHabit.unit}</Text>
              <Text style={styles.detailText}>Streak: {selectedHabit.streak} days</Text>

              <Pressable onPress={closeSheet} style={styles.singleActionButton}>
                <Text style={styles.submitButtonText}>Close</Text>
              </Pressable>
            </>
          ) : null}

          {sheetMode === 'edit' ? (
            <>
              <Text style={styles.sheetTitle}>Edit Habit</Text>

              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                onChangeText={setEditHabitName}
                placeholder="Habit name"
                placeholderTextColor="#9CA3AF"
                style={styles.nameInput}
                value={editHabitName}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.optionRow}>
                {categoryOptions.map((category) => {
                  const selected = editHabitCategory === category;
                  return (
                    <Pressable key={category} onPress={() => setEditHabitCategory(category)}>
                      <GlassSurface
                        borderRadius={radius.pill}
                        noPadding
                        style={[styles.optionChip, selected && styles.optionChipActive]}
                        variant={selected ? 'card' : 'nested'}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextActive]}>{category}</Text>
                      </GlassSurface>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Time Period</Text>
              <View style={styles.optionRow}>
                {timePeriodOptions.map((period) => {
                  const selected = editHabitTimePeriod === period;
                  return (
                    <Pressable key={period} onPress={() => setEditHabitTimePeriod(period)}>
                      <GlassSurface
                        borderRadius={radius.pill}
                        noPadding
                        style={[styles.optionChip, selected && styles.optionChipActive]}
                        variant={selected ? 'card' : 'nested'}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextActive]}>{period}</Text>
                      </GlassSurface>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.sheetActions}>
                <Pressable onPress={closeSheet} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  disabled={editHabitName.trim().length === 0}
                  onPress={submitEditHabit}
                  style={[styles.submitButton, editHabitName.trim().length === 0 && styles.submitButtonDisabled]}
                >
                  <Text style={styles.submitButtonText}>Save changes</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

function toHabitCategory(category: string): HabitCategory {
  const lowered = category.toLowerCase();
  if (lowered === 'health') return 'Health';
  if (lowered === 'learning') return 'Learning';
  if (lowered === 'productivity') return 'Productivity';
  if (lowered === 'mindfulness') return 'Mindfulness';
  return 'General';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterPressed: {
    opacity: 0.86,
  },
  filterText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  filterTextActive: {
    color: colors.onAccent,
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
    minHeight: 36,
    paddingHorizontal: spacing.sm + 2,
  },
  createButtonText: {
    color: colors.onAccent,
    fontSize: 11,
    fontWeight: '800',
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
    paddingTop: spacing.xs,
  },
  sheetTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: spacing.sm,
  },
  inputLabel: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.xs,
    marginTop: spacing.xs + 2,
  },
  nameInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: radius.md,
    borderWidth: 1,
    color: '#111827',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionChipActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
  },
  optionTextActive: {
    color: colors.onAccent,
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
  singleActionButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 44,
  },
  detailText: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});
