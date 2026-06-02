import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ColorValue,
  type ListRenderItemInfo,
} from 'react-native';

import { GlassSurface } from '../components/GlassSurface';
import { HabitCard } from '../components/habits/HabitCard';
import { AppHeader, EmptyState, sharedStyles } from '../components/RoutinelyUI';
import { Icon, IconBadge, type IconAccentName, type IconName } from '../components/shared/Icon';
import { settingsRowPresets } from '../components/shared/iconPresets';
import { categoryIconPresets, timePeriodIconPresets } from '../components/shared/iconPresets';
import { Panel } from '../components/shared/Panel';
import { RoutinelySheetModal } from '../components/shared/RoutinelySheetModal';
import { DatePickerField } from '../components/shared/DatePickerField';
import { SectionHeader } from '../components/shared/SectionHeader';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { isValidLocalDate, parseLocalDate, toLocalDate } from '../utils/local-date';
import { useHabitsInfinite, useCreateHabit, useArchiveHabit, useUpdateHabit } from '../data/hooks/use-habits';
import type { ApiHabit } from '../types/api';
import type { Habit, TimePeriod } from '../types/routinely';

type HabitsScreenProps = {
  onOpenProfile: () => void;
  onOverlayOpenChange?: (isOpen: boolean) => void;
};

type HabitFilter = 'Active' | 'Health' | 'Learning' | 'Missed';
type HabitCategory = 'Health' | 'Learning' | 'Productivity' | 'Mindfulness' | 'General';
type SheetMode = 'create' | 'detail' | 'edit';

const filters: HabitFilter[] = ['Active', 'Health', 'Learning', 'Missed'];
const categoryOptions: HabitCategory[] = ['Health', 'Learning', 'Productivity', 'Mindfulness', 'General'];
const timePeriodOptions: TimePeriod[] = ['Morning', 'Afternoon', 'Evening', 'Anytime'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCategoryAccent(category: string): ColorValue {
  switch (category.toLowerCase()) {
    case 'health':
      return colors.success;
    case 'learning':
      return colors.focus;
    case 'productivity':
      return colors.primary;
    case 'mindfulness':
      return colors.wellness;
    default:
      return colors.primarySoft;
  }
}

function apiHabitToHabit(h: ApiHabit): Habit {
  return {
    id: h.id,
    name: h.name,
    category: h.category,
    timePeriod: h.timePeriod,
    scheduleLabel: h.scheduleTime ?? h.timePeriod,
    reminderLabel: '',
    goalType: h.goalType,
    target: h.target,
    unit: h.unit,
    streak: 0, // Streak is daily-projection only; stable config has no streak
    accent: getCategoryAccent(h.category),
    startDate: h.startDate,
    endDate: h.endDate,
  };
}

function isValidDate(value: string): boolean {
  return isValidLocalDate(value);
}

function formatShortDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = months[parseInt(month, 10) - 1] ?? month;
  const d = parseInt(day, 10);
  const currentYear = new Date().getFullYear().toString();
  return year === currentYear ? `${m} ${d}` : `${m} ${d}, ${year}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function HabitsScreen({
  onOpenProfile,
  onOverlayOpenChange,
}: HabitsScreenProps) {
  const [activeFilter, setActiveFilter] = useState<HabitFilter>('Active');
  const [sheetMode, setSheetMode] = useState<SheetMode>('create');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  // ─── Create form state ──────────────────────────────────────────────────
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>('General');
  const [newHabitTimePeriod, setNewHabitTimePeriod] = useState<TimePeriod>('Anytime');
  const [newStartDate, setNewStartDate] = useState(() => toLocalDate(new Date()));
  const [newEndDate, setNewEndDate] = useState('');

  // ─── Edit form state ────────────────────────────────────────────────────
  const [editHabitName, setEditHabitName] = useState('');
  const [editHabitCategory, setEditHabitCategory] = useState<HabitCategory>('General');
  const [editHabitTimePeriod, setEditHabitTimePeriod] = useState<TimePeriod>('Anytime');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  const sheetRef = useRef<BottomSheetModal>(null);

  // ─── Data: own query, not from dashboard ────────────────────────────────
  const habitsQuery = useHabitsInfinite('active');
  const createHabitMutation = useCreateHabit();
  const archiveHabitMutation = useArchiveHabit();
  const updateHabitMutation = useUpdateHabit();

  const allHabits = useMemo<Habit[]>(() => {
    if (!habitsQuery.data?.pages) return [];
    return habitsQuery.data.pages.flatMap((page) => page.data.map(apiHabitToHabit));
  }, [habitsQuery.data?.pages]);

  const filteredHabits = useMemo(() => {
    if (activeFilter === 'Active') {
      return allHabits;
    }
    if (activeFilter === 'Missed') {
      // Missed status is a daily-projection concept; without a date query,
      // we can't determine missed locally. Show empty with a helpful message.
      return [];
    }
    return allHabits.filter((habit) => habit.category === activeFilter);
  }, [activeFilter, allHabits]);

  const selectedHabit = useMemo(
    () => allHabits.find((habit) => habit.id === selectedHabitId),
    [allHabits, selectedHabitId],
  );

  // Also find the raw ApiHabit for version tracking
  const selectedApiHabit = useMemo(() => {
    if (!selectedHabitId || !habitsQuery.data?.pages) return undefined;
    for (const page of habitsQuery.data.pages) {
      const found = page.data.find((h) => h.id === selectedHabitId);
      if (found) return found;
    }
    return undefined;
  }, [habitsQuery.data?.pages, selectedHabitId]);

  // ─── Form helpers ───────────────────────────────────────────────────────
  function resetCreateForm() {
    setNewHabitName('');
    setNewHabitCategory('General');
    setNewHabitTimePeriod('Anytime');
    setNewStartDate(toLocalDate(new Date()));
    setNewEndDate('');
  }

  function openCreateSheet() {
    setSheetMode('create');
    if (activeFilter === 'Health' || activeFilter === 'Learning') {
      setNewHabitCategory(activeFilter);
    } else {
      setNewHabitCategory('General');
    }
    setNewStartDate(toLocalDate(new Date()));
    setNewEndDate('');
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
    const habit = allHabits.find((item) => item.id === habitId);
    if (!habit) return;

    setSelectedHabitId(habitId);
    setEditHabitName(habit.name);
    setEditHabitCategory(toHabitCategory(habit.category));
    setEditHabitTimePeriod(habit.timePeriod);
    setEditStartDate(habit.startDate ?? toLocalDate(new Date()));
    setEditEndDate(habit.endDate ?? '');
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
    if (newHabitName.trim().length === 0) return;
    if (!isValidDate(newStartDate)) {
      Alert.alert('Invalid date', 'Please enter a valid start date (YYYY-MM-DD).');
      return;
    }
    if (newEndDate && !isValidDate(newEndDate)) {
      Alert.alert('Invalid date', 'Please enter a valid end date (YYYY-MM-DD).');
      return;
    }

    createHabitMutation.mutate({
      name: newHabitName.trim(),
      category: newHabitCategory,
      timePeriod: newHabitTimePeriod,
      goalType: 'checkbox',
      target: 1,
      unit: 'check-in',
      frequencyRule: { type: 'daily' },
      startDate: newStartDate,
      ...(newEndDate ? { endDate: newEndDate } : {}),
    });
    closeSheet();
  }

  function submitEditHabit() {
    if (!selectedHabitId || editHabitName.trim().length === 0) return;
    if (!isValidDate(editStartDate)) {
      Alert.alert('Invalid date', 'Please enter a valid start date (YYYY-MM-DD).');
      return;
    }
    if (editEndDate && !isValidDate(editEndDate)) {
      Alert.alert('Invalid date', 'Please enter a valid end date (YYYY-MM-DD).');
      return;
    }

    updateHabitMutation.mutate({
      id: selectedHabitId,
      input: {
        version: selectedApiHabit?.version ?? 1,
        name: editHabitName.trim(),
        category: editHabitCategory,
        timePeriod: editHabitTimePeriod,
        startDate: editStartDate,
        ...(editEndDate ? { endDate: editEndDate } : {}),
      },
    });
    closeSheet();
  }

  function handleArchiveHabit(habitId: string) {
    const habit = allHabits.find((item) => item.id === habitId);
    if (!habit) return;

    Alert.alert('Archive habit', `Archive "${habit.name}"?`, [
      { style: 'cancel', text: 'Cancel' },
      {
        style: 'destructive',
        text: 'Archive',
        onPress: () => archiveHabitMutation.mutate(habitId),
      },
    ]);
  }

  // ─── Infinite scroll ────────────────────────────────────────────────────
  const handleEndReached = useCallback(() => {
    if (habitsQuery.hasNextPage && !habitsQuery.isFetchingNextPage) {
      habitsQuery.fetchNextPage();
    }
  }, [habitsQuery]);

  const renderHabitItem = useCallback(
    ({ item }: ListRenderItemInfo<Habit>) => (
      <HabitCard
        key={item.id}
        habit={item}
        onPressArchive={handleArchiveHabit}
        onPressDetail={openDetailSheet}
        onPressEdit={openEditSheet}
        showManagement
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allHabits],
  );

  const ListFooter = useMemo(() => {
    if (habitsQuery.isFetchingNextPage) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadingText}>Loading more…</Text>
        </View>
      );
    }
    return null;
  }, [habitsQuery.isFetchingNextPage]);

  // ─── List Header ────────────────────────────────────────────────────────
  const ListHeader = useMemo(
    () => (
      <>
        <AppHeader onPressProfile={onOpenProfile} subcopy="Manage routines" />
        <GlassSurface borderRadius={radius.xl}>
          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.title}>Routines</Text>
              <Text style={styles.subtitle}>Manage what repeats. Keep dashboard clean for doing, not configuring.</Text>
              <View style={styles.heroMetaRow}>
                <Icon accent="mint" name="infinite" size="xs" />
                <Text style={styles.heroMeta}>Daily habits & schedules</Text>
              </View>
            </View>
            <View style={[styles.statusPill, allHabits.length > 0 && styles.statusPillActive]}>
              <Text style={[styles.statusCount, allHabits.length > 0 && styles.statusCountActive]}>
                {allHabits.length}
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
                accessibilityLabel={`Show ${filter} habits`}
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
          <View style={styles.panelHeaderRow}>
            <View style={styles.promptRow}>
              <IconBadge accent="violet" badgeSize={28} name="albums-outline" size={15} />
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
              <Icon accent="mint" name="add-circle" size={16} />
              <Text style={styles.createButtonText}>Create</Text>
            </Pressable>
          </View>
        </Panel>

        {habitsQuery.isLoading ? (
          <View style={styles.loadingFooter}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : null}

        {!habitsQuery.isLoading && filteredHabits.length === 0 ? (
          <View style={styles.emptyStateSlot}>
            <EmptyState
              accent="mint"
              description={
                activeFilter === 'Missed'
                  ? 'Missed status is only available on the Dashboard for a selected date.'
                  : 'Create one to start tracking this filter.'
              }
              icon="infinite-outline"
              title="No habits found"
            />
          </View>
        ) : null}
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeFilter, allHabits.length, filteredHabits.length, habitsQuery.isLoading, onOpenProfile],
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={habitsQuery.isLoading ? [] : filteredHabits}
        renderItem={renderHabitItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide, styles.listGap]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
      />

      <RoutinelySheetModal
        ref={sheetRef}
        contentKey={sheetMode}
        contentStyle={styles.sheetContent}
        footer={
          sheetMode === 'create' ? (
            <SheetFormActions
              canSubmit={newHabitName.trim().length > 0 && isValidDate(newStartDate)}
              onCancel={closeSheet}
              onSubmit={submitCreateHabit}
              submitLabel="Create habit"
            />
          ) : sheetMode === 'edit' ? (
            <SheetFormActions
              canSubmit={editHabitName.trim().length > 0 && isValidDate(editStartDate)}
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
          icon={sheetMode === 'create' ? 'add-circle-outline' : sheetMode === 'edit' ? 'color-wand-outline' : 'infinite-outline'}
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
            endDate={newEndDate}
            name={newHabitName}
            onChangeCategory={setNewHabitCategory}
            onChangeEndDate={setNewEndDate}
            onChangeName={setNewHabitName}
            onChangeStartDate={setNewStartDate}
            onChangeTimePeriod={setNewHabitTimePeriod}
            startDate={newStartDate}
            timePeriod={newHabitTimePeriod}
          />
        ) : null}

        {sheetMode === 'detail' && selectedHabit ? <HabitDetailContent habit={selectedHabit} /> : null}

        {sheetMode === 'edit' ? (
          <HabitFormFields
            category={editHabitCategory}
            endDate={editEndDate}
            name={editHabitName}
            onChangeCategory={setEditHabitCategory}
            onChangeEndDate={setEditEndDate}
            onChangeName={setEditHabitName}
            onChangeStartDate={setEditStartDate}
            onChangeTimePeriod={setEditHabitTimePeriod}
            startDate={editStartDate}
            timePeriod={editHabitTimePeriod}
          />
        ) : null}
      </RoutinelySheetModal>
    </View>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function toHabitCategory(category: string): HabitCategory {
  const lowered = category.toLowerCase();
  if (lowered === 'health') return 'Health';
  if (lowered === 'learning') return 'Learning';
  if (lowered === 'productivity') return 'Productivity';
  if (lowered === 'mindfulness') return 'Mindfulness';
  return 'General';
}

const categoryIcons = categoryIconPresets;
const timePeriodIcons = timePeriodIconPresets;

// ─── Sheet Header ───────────────────────────────────────────────────────────
function SheetHeader({
  icon,
  onClose,
  subtitle,
  title,
}: {
  icon: IconName;
  onClose: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.sheetHeader}>
      <View style={styles.sheetHeaderLeading}>
        <View style={styles.sheetHeaderIcon}>
          <Icon accent="violet" name={icon} size="xl" />
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
        <Icon accent="coral" name="close-circle-outline" size={20} />
      </Pressable>
    </View>
  );
}

// ─── Form Fields ────────────────────────────────────────────────────────────
function HabitFormFields({
  category,
  endDate,
  name,
  onChangeCategory,
  onChangeEndDate,
  onChangeName,
  onChangeStartDate,
  onChangeTimePeriod,
  startDate,
  timePeriod,
}: {
  category: HabitCategory;
  endDate: string;
  name: string;
  onChangeCategory: (value: HabitCategory) => void;
  onChangeEndDate: (value: string) => void;
  onChangeName: (value: string) => void;
  onChangeStartDate: (value: string) => void;
  onChangeTimePeriod: (value: TimePeriod) => void;
  startDate: string;
  timePeriod: TimePeriod;
}) {
  return (
    <View style={styles.formStack}>
      <View style={styles.fieldGroup}>
        <Text style={styles.inputLabel}>Name</Text>
        <GlassSurface borderRadius={radius.lg} contentStyle={styles.inputSurfaceContent} variant="nested">
          <TextInput
            accessibilityLabel="Habit name"
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
            const preset = categoryIcons[option];

            return (
              <Pressable
                accessibilityLabel={`Category ${option}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
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
                  <Icon
                    accent={selected ? preset.accent : undefined}
                    color={selected ? undefined : colors.textMuted}
                    name={preset.name}
                    size="sm"
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
            const preset = timePeriodIcons[option];

            return (
              <Pressable
                accessibilityLabel={`Time period ${option}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
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
                  <Icon
                    accent={selected ? preset.accent : undefined}
                    color={selected ? undefined : colors.textMuted}
                    name={preset.name}
                    size="sm"
                  />
                  <Text style={[styles.optionText, selected && styles.optionTextActive]}>{option}</Text>
                </GlassSurface>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.dateSection}>
        <DatePickerField label="Start date" onChange={onChangeStartDate} value={startDate} />
        <DatePickerField
          label="End date (optional)"
          minimumDate={isValidLocalDate(startDate) ? parseLocalDate(startDate) : undefined}
          onChange={onChangeEndDate}
          onClear={() => onChangeEndDate('')}
          optional
          placeholder="No end date"
          value={endDate}
        />
      </View>
    </View>
  );
}

// ─── Sheet Form Actions ─────────────────────────────────────────────────────
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
        accessibilityLabel="Cancel habit changes"
        accessibilityRole="button"
        onPress={onCancel}
        style={({ pressed }) => [styles.cancelButton, pressed && styles.secondaryButtonPressed]}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
      <Pressable
        accessibilityLabel={submitLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit }}
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

// ─── Detail Content ─────────────────────────────────────────────────────────
function HabitDetailContent({ habit }: { habit: Habit }) {
  return (
    <View style={styles.detailStack}>
      <View style={styles.detailMetaRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{habit.category}</Text>
        </View>
        <View style={styles.timeBadge}>
          <Icon accent="lavender" name="hourglass-outline" size="xs" />
          <Text style={styles.timeBadgeText}>{habit.timePeriod}</Text>
        </View>
      </View>

      <View style={styles.detailStatsGrid}>
        <DetailStatCard accent="lavender" icon="hourglass-outline" label="Time" value={habit.timePeriod} />
        <DetailStatCard accent="sky" icon="flag" label="Target" value={`${habit.target} ${habit.unit}`} />
        <DetailStatCard
          accent="mint"
          icon="calendar-outline"
          label="Start"
          value={habit.startDate ? formatShortDate(habit.startDate) : '—'}
        />
        <DetailStatCard
          accent="coral"
          icon="calendar-outline"
          label="End"
          value={habit.endDate ? formatShortDate(habit.endDate) : 'No end date'}
        />
      </View>
    </View>
  );
}

// ─── Detail Sheet Actions ───────────────────────────────────────────────────
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
        accessibilityLabel="Edit habit"
        accessibilityRole="button"
        onPress={onEdit}
        style={({ pressed }) => [styles.detailPrimaryButton, pressed && styles.submitButtonPressed]}
      >
        <Icon accent="sky" name="color-wand-outline" />
        <Text style={styles.submitButtonText}>Edit habit</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Archive habit"
        accessibilityRole="button"
        onPress={onArchive}
        style={({ pressed }) => [styles.detailDangerButton, pressed && styles.secondaryButtonPressed]}
      >
        <Icon accent="coral" name="archive" />
        <Text style={styles.detailDangerButtonText}>Archive</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Close habit detail"
        accessibilityRole="button"
        onPress={onClose}
        style={({ pressed }) => [styles.detailGhostButton, pressed && styles.secondaryButtonPressed]}
      >
        <Text style={styles.cancelButtonText}>Close</Text>
      </Pressable>
    </>
  );
}

// ─── Detail Stat Card ───────────────────────────────────────────────────────
function DetailStatCard({
  accent,
  icon,
  label,
  value,
}: {
  accent: IconAccentName;
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <GlassSurface borderRadius={radius.lg} style={styles.detailStatCard} variant="nested">
      <Icon accent={accent} name={icon} />
      <Text style={styles.detailStatLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.detailStatValue}>
        {value}
      </Text>
    </GlassSurface>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listGap: {
    gap: spacing.md,
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
    fontSize: 11,
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
  emptyStateSlot: {
    marginTop: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingTop: spacing.md,
  },
  filterBadge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  filterBadgeActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  filterBadgePressed: {
    opacity: 0.88,
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    includeFontPadding: false,
    lineHeight: 16,
    textAlignVertical: 'center',
  },
  filterTextActive: {
    color: colors.primary,
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
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
  },
  createButtonPressed: {
    backgroundColor: colors.primaryPressed,
    opacity: 0.9,
  },
  createButtonText: {
    color: colors.onAccent,
    fontSize: 13,
    fontWeight: '800',
    includeFontPadding: false,
    lineHeight: 16,
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
    height: 44,
    justifyContent: 'center',
    width: 44,
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
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  nameInput: {
    color: colors.text,
    flex: 1,
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
    minHeight: 44,
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
  dateSection: {
    gap: spacing.md,
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
    borderColor: colors.danger,
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
  loadingFooter: {
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
