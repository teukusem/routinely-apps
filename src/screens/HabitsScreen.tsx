import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ColorValue } from 'react-native';

import { GlassSurface } from '../components/GlassSurface';
import { HabitCard } from '../components/habits/HabitCard';
import { AppHeader, EmptyState, sharedStyles } from '../components/RoutinelyUI';
import { Panel } from '../components/shared/Panel';
import { RoutinelySheetModal } from '../components/shared/RoutinelySheetModal';
import { SectionHeader } from '../components/shared/SectionHeader';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { DailyHabitView, TimePeriod } from '../types/routinely';

type HabitsScreenProps = {
  dailyHabits: DailyHabitView[];
  onCreateHabit: (draft: { name: string; category: string; timePeriod: TimePeriod }) => void;
  onArchiveHabit: (habitId: string) => void;
  onEditHabit: (draft: { habitId: string; name: string; category: string; timePeriod: TimePeriod }) => void;
  onOpenProfile: () => void;
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
  onEditHabit,
  onOpenProfile,
  onOverlayOpenChange,
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
        <AppHeader onPressProfile={onOpenProfile} subcopy="Manage routines" />
        <GlassSurface borderRadius={radius.xl}>
          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.title}>Routines</Text>
              <Text style={styles.subtitle}>Manage what repeats. Keep dashboard clean for doing, not configuring.</Text>
              <View style={styles.heroMetaRow}>
                <Ionicons color={colors.primary} name="repeat" size={11} />
                <Text style={styles.heroMeta}>Daily habits & schedules</Text>
              </View>
            </View>
            <View style={[styles.statusPill, dailyHabits.length > 0 && styles.statusPillActive]}>
              <Text style={[styles.statusCount, dailyHabits.length > 0 && styles.statusCountActive]}>
                {dailyHabits.length}
              </Text>
              <Text style={styles.statusLabel}>active</Text>
            </View>
          </View>
        </GlassSurface>

        <View style={styles.filterRow}>
          {filters.map((filter) => {
            const selected = activeFilter === filter;
            return (
              <Pressable
                key={filter}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setActiveFilter(filter)}
                style={({ pressed }) => [
                  styles.filterBadge,
                  selected && styles.filterBadgeActive,
                  pressed && styles.filterBadgePressed,
                ]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextActive]}>{filter}</Text>
              </Pressable>
            );
          })}
        </View>

        <Panel>
          <View style={styles.panelStack}>
            <View style={styles.panelHeaderRow}>
              <View style={styles.promptRow}>
                <View style={styles.promptIcon}>
                  <Ionicons color={colors.primary} name="layers-outline" size={15} />
                </View>
                <View style={styles.panelHeaderCopy}>
                  <SectionHeader title={`${activeFilter} habits`} meta={`${filteredHabits.length} shown`} compact />
                </View>
              </View>
              <Pressable
                accessibilityLabel="Create habit"
                accessibilityRole="button"
                onPress={openCreateSheet}
                style={({ pressed }) => [styles.createButton, pressed && styles.createButtonPressed]}
              >
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
          </View>
        </Panel>
      </ScrollView>

      <RoutinelySheetModal
        ref={sheetRef}
        contentKey={sheetMode}
        contentStyle={styles.sheetContent}
        footer={
          sheetMode === 'create' ? (
            <SheetFormActions
              canSubmit={newHabitName.trim().length > 0}
              onCancel={closeSheet}
              onSubmit={submitCreateHabit}
              submitLabel="Create habit"
            />
          ) : sheetMode === 'edit' ? (
            <SheetFormActions
              canSubmit={editHabitName.trim().length > 0}
              onCancel={closeSheet}
              onSubmit={submitEditHabit}
              submitLabel="Save changes"
            />
          ) : sheetMode === 'detail' && selectedHabit ? (
            <DetailSheetActions
              onArchive={() => {
                closeSheet();
                handleArchiveHabit(selectedHabit.id);
              }}
              onClose={closeSheet}
              onEdit={() => openEditSheet(selectedHabit.id)}
            />
          ) : null
        }
        onDismiss={handleSheetDismiss}
      >
        <SheetHeader
          icon={sheetMode === 'create' ? 'add-circle-outline' : sheetMode === 'edit' ? 'create-outline' : 'repeat-outline'}
          onClose={closeSheet}
          subtitle={
            sheetMode === 'create'
              ? 'Add a routine you want to repeat.'
              : sheetMode === 'edit'
                ? 'Update name, category, or schedule.'
                : selectedHabit?.name ?? 'Routine details'
          }
          title={sheetMode === 'create' ? 'New habit' : sheetMode === 'edit' ? 'Edit habit' : 'Habit detail'}
        />

        {sheetMode === 'create' ? (
          <HabitFormFields
            category={newHabitCategory}
            name={newHabitName}
            onChangeCategory={setNewHabitCategory}
            onChangeName={setNewHabitName}
            onChangeTimePeriod={setNewHabitTimePeriod}
            timePeriod={newHabitTimePeriod}
          />
        ) : null}

        {sheetMode === 'detail' && selectedHabit ? <HabitDetailContent habit={selectedHabit} /> : null}

        {sheetMode === 'edit' ? (
          <HabitFormFields
            category={editHabitCategory}
            name={editHabitName}
            onChangeCategory={setEditHabitCategory}
            onChangeName={setEditHabitName}
            onChangeTimePeriod={setEditHabitTimePeriod}
            timePeriod={editHabitTimePeriod}
          />
        ) : null}
      </RoutinelySheetModal>
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

const categoryIcons: Record<HabitCategory, keyof typeof Ionicons.glyphMap> = {
  General: 'apps-outline',
  Health: 'heart-outline',
  Learning: 'book-outline',
  Mindfulness: 'leaf-outline',
  Productivity: 'briefcase-outline',
};

const timePeriodIcons: Record<TimePeriod, keyof typeof Ionicons.glyphMap> = {
  Anytime: 'time-outline',
  Afternoon: 'partly-sunny-outline',
  Evening: 'moon-outline',
  Morning: 'sunny-outline',
};

function SheetHeader({
  icon,
  onClose,
  subtitle,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onClose: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.sheetHeader}>
      <View style={styles.sheetHeaderLeading}>
        <View style={styles.sheetHeaderIcon}>
          <Ionicons color={colors.primary} name={icon} size={22} />
        </View>
        <View style={styles.sheetHeaderCopy}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Text numberOfLines={2} style={styles.sheetSubtitle}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Pressable
        accessibilityLabel="Close sheet"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onClose}
        style={({ pressed }) => [styles.sheetCloseButton, pressed && styles.sheetCloseButtonPressed]}
      >
        <Ionicons color={colors.textMuted} name="close" size={20} />
      </Pressable>
    </View>
  );
}

function HabitFormFields({
  category,
  name,
  onChangeCategory,
  onChangeName,
  onChangeTimePeriod,
  timePeriod,
}: {
  category: HabitCategory;
  name: string;
  onChangeCategory: (value: HabitCategory) => void;
  onChangeName: (value: string) => void;
  onChangeTimePeriod: (value: TimePeriod) => void;
  timePeriod: TimePeriod;
}) {
  return (
    <View style={styles.formStack}>
      <View style={styles.fieldGroup}>
        <Text style={styles.inputLabel}>Name</Text>
        <GlassSurface borderRadius={radius.lg} contentStyle={styles.inputSurfaceContent} variant="nested">
          <TextInput
            autoCapitalize="sentences"
            onChangeText={onChangeName}
            placeholder="e.g. 30-minute coding practice"
            placeholderTextColor={colors.textMuted}
            returnKeyType="done"
            style={styles.nameInput}
            value={name}
          />
        </GlassSurface>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.inputLabel}>Category</Text>
        <View style={styles.optionRow}>
          {categoryOptions.map((option) => {
            const selected = category === option;
            return (
              <Pressable
                key={option}
                onPress={() => onChangeCategory(option)}
                style={({ pressed }) => [pressed && styles.optionPressed]}
              >
                <GlassSurface
                  borderRadius={radius.pill}
                  contentStyle={styles.optionChipContent}
                  noPadding
                  style={[
                    styles.optionChip,
                    selected && styles.optionChipActive,
                  ]}
                  variant="nested"
                >
                  <Ionicons
                    color={selected ? colors.primary : colors.textMuted}
                    name={categoryIcons[option]}
                    size={14}
                  />
                  <Text style={[styles.optionText, selected && styles.optionTextActive]}>{option}</Text>
                </GlassSurface>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.inputLabel}>Time period</Text>
        <View style={styles.optionRow}>
          {timePeriodOptions.map((option) => {
            const selected = timePeriod === option;
            return (
              <Pressable
                key={option}
                onPress={() => onChangeTimePeriod(option)}
                style={({ pressed }) => [pressed && styles.optionPressed]}
              >
                <GlassSurface
                  borderRadius={radius.pill}
                  contentStyle={styles.optionChipContent}
                  noPadding
                  style={[
                    styles.optionChip,
                    selected && styles.optionChipActive,
                  ]}
                  variant="nested"
                >
                  <Ionicons
                    color={selected ? colors.primary : colors.textMuted}
                    name={timePeriodIcons[option]}
                    size={14}
                  />
                  <Text style={[styles.optionText, selected && styles.optionTextActive]}>{option}</Text>
                </GlassSurface>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function SheetFormActions({
  canSubmit,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  canSubmit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
}) {
  return (
    <View style={styles.sheetActions}>
      <Pressable
        onPress={onCancel}
        style={({ pressed }) => [styles.cancelButton, pressed && styles.secondaryButtonPressed]}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
      <Pressable
        disabled={!canSubmit}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          !canSubmit && styles.submitButtonDisabled,
          pressed && canSubmit && styles.submitButtonPressed,
        ]}
      >
        <Text style={styles.submitButtonText}>{submitLabel}</Text>
      </Pressable>
    </View>
  );
}

function HabitDetailContent({ habit }: { habit: DailyHabitView }) {
  const statusTone = getDetailStatusTone(habit.status);

  return (
    <View style={styles.detailStack}>
      <View style={styles.detailMetaRow}>
        <View style={[styles.statusBadge, { backgroundColor: statusTone.soft, borderColor: statusTone.solid }]}>
          <Text style={[styles.statusBadgeText, { color: statusTone.solid }]}>{getDetailStatusLabel(habit.status)}</Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{habit.category}</Text>
        </View>
        <View style={styles.timeBadge}>
          <Ionicons color={colors.textMuted} name="time-outline" size={11} />
          <Text style={styles.timeBadgeText}>{habit.timePeriod}</Text>
        </View>
      </View>

      <View style={styles.detailStatsGrid}>
        <DetailStatCard icon="time-outline" label="Time" value={habit.timePeriod} />
        <DetailStatCard icon="flag-outline" label="Target" value={`${habit.target} ${habit.unit}`} />
        <DetailStatCard icon="flame-outline" label="Streak" tone={colors.warning} value={`${habit.streak} days`} />
        <DetailStatCard icon="trending-up-outline" label="Progress" tone={colors.primary} value={`${habit.progress}/${habit.target}`} />
      </View>
    </View>
  );
}

function DetailSheetActions({
  onArchive,
  onClose,
  onEdit,
}: {
  onArchive: () => void;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <>
      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [styles.detailPrimaryButton, pressed && styles.submitButtonPressed]}
      >
        <Ionicons color={colors.onAccent} name="create-outline" size={16} />
        <Text style={styles.submitButtonText}>Edit habit</Text>
      </Pressable>
      <Pressable
        onPress={onArchive}
        style={({ pressed }) => [styles.detailDangerButton, pressed && styles.secondaryButtonPressed]}
      >
        <Ionicons color={colors.danger} name="archive-outline" size={16} />
        <Text style={styles.detailDangerButtonText}>Archive</Text>
      </Pressable>
      <Pressable
        onPress={onClose}
        style={({ pressed }) => [styles.detailGhostButton, pressed && styles.secondaryButtonPressed]}
      >
        <Text style={styles.cancelButtonText}>Close</Text>
      </Pressable>
    </>
  );
}

function DetailStatCard({
  icon,
  label,
  tone = colors.text,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone?: ColorValue;
  value: string;
}) {
  return (
    <GlassSurface borderRadius={radius.lg} style={styles.detailStatCard} variant="nested">
      <Ionicons color={tone} name={icon} size={16} />
      <Text style={styles.detailStatLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.detailStatValue}>
        {value}
      </Text>
    </GlassSurface>
  );
}

function getDetailStatusLabel(status: DailyHabitView['status']): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'due':
      return 'Due now';
    case 'missed':
      return 'Missed';
    case 'upcoming':
      return 'Upcoming';
    case 'skipped':
      return 'Skipped';
    default:
      return 'Active';
  }
}

function getDetailStatusTone(status: DailyHabitView['status']): { soft: string; solid: ColorValue } {
  switch (status) {
    case 'completed':
      return { soft: colors.successSoft, solid: colors.success };
    case 'due':
      return { soft: colors.focusSoft, solid: colors.focus };
    case 'missed':
      return { soft: colors.warningSoft, solid: colors.warning };
    case 'upcoming':
      return { soft: colors.primarySoft, solid: colors.primary };
    case 'skipped':
      return { soft: colors.surfaceMuted, solid: colors.textMuted };
    default:
      return { soft: colors.surfaceMuted, solid: colors.textMuted };
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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
  heroMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  heroMeta: {
    color: colors.primary,
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
    minHeight: 36,
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
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    textTransform: 'uppercase',
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterBadge: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterBadgeActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  filterBadgePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  filterTextActive: {
    color: colors.primary,
  },
  panelStack: {
    gap: spacing.md,
  },
  panelHeaderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  promptRow: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  promptIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    flexShrink: 0,
    height: 28,
    justifyContent: 'center',
    marginTop: 2,
    width: 28,
  },
  panelHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
  },
  createButtonPressed: {
    backgroundColor: colors.primaryPressed,
    opacity: 0.9,
  },
  createButtonText: {
    color: colors.onAccent,
    fontSize: 11,
    fontWeight: '800',
  },
  sheetContent: {
    gap: spacing.md,
  },
  sheetHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sheetHeaderLeading: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sheetHeaderIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sheetHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  sheetSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  sheetCloseButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  sheetCloseButtonPressed: {
    opacity: 0.86,
  },
  formStack: {
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  inputSurfaceContent: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  nameInput: {
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
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChipContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  optionChip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderWidth: 1,
  },
  optionChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  optionPressed: {
    opacity: 0.88,
  },
  optionText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  optionTextActive: {
    color: colors.primary,
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
  secondaryButtonPressed: {
    opacity: 0.86,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  submitButtonPressed: {
    backgroundColor: colors.primaryPressed,
    opacity: 0.94,
  },
  submitButtonDisabled: {
    backgroundColor: colors.primarySoft,
    opacity: 0.72,
  },
  submitButtonText: {
    color: colors.onAccent,
    fontSize: 13,
    fontWeight: '800',
  },
  detailStack: {
    gap: spacing.md,
  },
  detailMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusBadge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  categoryBadge: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  categoryBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  timeBadge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  timeBadgeText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  detailStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailStatCard: {
    gap: spacing.xs,
    minWidth: '47%',
    padding: spacing.md,
  },
  detailStatLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  detailStatValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  detailPrimaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 48,
  },
  detailDangerButton: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(248, 113, 113, 0.35)',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 48,
  },
  detailDangerButtonText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '800',
  },
  detailGhostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
