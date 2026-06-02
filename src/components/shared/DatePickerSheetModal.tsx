import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Package ships raw TSX; require avoids pulling it into the app typecheck graph.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ScrollPicker = require('react-native-wheel-scrollview-picker').default as React.ComponentType<{
  activeItemTextStyle?: object;
  dataSource: string[];
  highlightBorderWidth?: number;
  highlightColor?: string;
  itemHeight?: number;
  itemTextStyle?: object;
  onValueChange?: (value: string | undefined, index: number) => void;
  selectedIndex?: number;
  wrapperBackground?: string;
  wrapperHeight?: number;
}>;

import type { DatePickerOpenConfig } from '../../contexts/DatePickerModalContext';
import { colors } from '../../theme/colors';
import { iconColors } from '../../theme/iconColors';
import { radius, spacing } from '../../theme/spacing';
import {
  buildDateWheelSelection,
  dayOptionsForMonth,
  isSelectionWithinRange,
  MONTH_NAMES,
  selectionToIso,
  type DateWheelSelection,
} from './date-picker-wheels';

const PICKER_ITEM_HEIGHT = 40;
const PICKER_HEIGHT = PICKER_ITEM_HEIGHT * 5;

type DatePickerSheetModalProps = {
  config: DatePickerOpenConfig | null;
  onCancel: () => void;
  onConfirm: (isoDate: string) => void;
  onDismiss: () => void;
};

export const DatePickerSheetModal = forwardRef<BottomSheetModal, DatePickerSheetModalProps>(
  function DatePickerSheetModal({ config, onCancel, onConfirm, onDismiss }, ref) {
    const insets = useSafeAreaInsets();
    const [selection, setSelection] = useState<DateWheelSelection>(() => buildDateWheelSelection());
    const [rangeError, setRangeError] = useState(false);
    const [sheetKey, setSheetKey] = useState(0);

    useEffect(() => {
      if (!config) {
        return;
      }

      setSelection(buildDateWheelSelection(config.value, config.minDate, config.maxDate));
      setRangeError(false);
      setSheetKey((current) => current + 1);
    }, [config]);

    const monthIndex = MONTH_NAMES.indexOf(selection.month);
    const dayIndex = Math.max(0, selection.days.indexOf(selection.day));
    const monthPickerIndex = Math.max(0, MONTH_NAMES.indexOf(selection.month));
    const yearIndex = Math.max(0, selection.years.indexOf(selection.year));

    const title = config?.title ?? 'Select date';

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.42} />
      ),
      [],
    );

    const pickerItemStyle = useMemo(
      () => ({
        active: styles.pickerItemActive,
        idle: styles.pickerItem,
      }),
      [],
    );

    function updateMonth(nextMonth: (typeof MONTH_NAMES)[number]) {
      const nextMonthIndex = MONTH_NAMES.indexOf(nextMonth);
      const days = dayOptionsForMonth(Number(selection.year), nextMonthIndex);
      setSelection((current) => ({
        ...current,
        days,
        month: nextMonth,
        day: days.includes(current.day) ? current.day : days[days.length - 1],
      }));
      setRangeError(false);
    }

    function updateYear(nextYear: string) {
      const days = dayOptionsForMonth(Number(nextYear), monthIndex);
      setSelection((current) => ({
        ...current,
        days,
        year: nextYear,
        day: days.includes(current.day) ? current.day : days[days.length - 1],
      }));
      setRangeError(false);
    }

    function handleSave() {
      const iso = selectionToIso(selection);

      if (!isSelectionWithinRange(iso, config?.minDate, config?.maxDate)) {
        setRangeError(true);
        return;
      }

      onConfirm(iso);
    }

    return (
      <BottomSheetModal
        ref={ref}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.background}
        enableContentPanningGesture={false}
        enableDynamicSizing={false}
        enableHandlePanningGesture
        enableOverDrag={false}
        enablePanDownToClose
        handleIndicatorStyle={styles.handle}
        handleStyle={styles.handleContainer}
        onDismiss={onDismiss}
        snapPoints={['46%']}
        stackBehavior="push"
      >
        {config ? (
          <BottomSheetView style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
            <Text style={styles.title}>{title}</Text>

            <View key={sheetKey} style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <ScrollPicker
                  activeItemTextStyle={pickerItemStyle.active}
                  dataSource={selection.days}
                  highlightColor={iconColors.mintSoft}
                  highlightBorderWidth={0.5}
                  itemHeight={PICKER_ITEM_HEIGHT}
                  itemTextStyle={pickerItemStyle.idle}
                  onValueChange={(value) => {
                    if (value) {
                      setSelection((current) => ({ ...current, day: value }));
                      setRangeError(false);
                    }
                  }}
                  selectedIndex={dayIndex}
                  wrapperBackground={colors.backgroundElevated}
                  wrapperHeight={PICKER_HEIGHT}
                />
              </View>
              <View style={styles.pickerColumn}>
                <ScrollPicker
                  activeItemTextStyle={pickerItemStyle.active}
                  dataSource={[...MONTH_NAMES]}
                  highlightColor={iconColors.mintSoft}
                  highlightBorderWidth={0.5}
                  itemHeight={PICKER_ITEM_HEIGHT}
                  itemTextStyle={pickerItemStyle.idle}
                  onValueChange={(value) => {
                    if (value) {
                      updateMonth(value as (typeof MONTH_NAMES)[number]);
                    }
                  }}
                  selectedIndex={monthPickerIndex}
                  wrapperBackground={colors.backgroundElevated}
                  wrapperHeight={PICKER_HEIGHT}
                />
              </View>
              <View style={styles.pickerColumn}>
                <ScrollPicker
                  activeItemTextStyle={pickerItemStyle.active}
                  dataSource={selection.years}
                  highlightColor={iconColors.mintSoft}
                  highlightBorderWidth={0.5}
                  itemHeight={PICKER_ITEM_HEIGHT}
                  itemTextStyle={pickerItemStyle.idle}
                  onValueChange={(value) => {
                    if (value) {
                      updateYear(value);
                    }
                  }}
                  selectedIndex={yearIndex}
                  wrapperBackground={colors.backgroundElevated}
                  wrapperHeight={PICKER_HEIGHT}
                />
              </View>
            </View>

            {rangeError ? (
              <Text style={styles.errorText}>Choose a date within the allowed range.</Text>
            ) : null}

            <View style={styles.actions}>
              <Pressable
                accessibilityLabel="Cancel date selection"
                accessibilityRole="button"
                onPress={onCancel}
                style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Save date"
                accessibilityRole="button"
                onPress={handleSave}
                style={({ pressed }) => [styles.saveButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </BottomSheetView>
        ) : null}
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.glassBorder,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
  },
  handleContainer: {
    paddingTop: spacing.sm,
  },
  handle: {
    backgroundColor: colors.glassBorder,
    width: 48,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  pickerRow: {
    flexDirection: 'row',
    height: PICKER_HEIGHT,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  pickerColumn: {
    flex: 1,
    height: PICKER_HEIGHT,
    overflow: 'hidden',
  },
  pickerItem: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  pickerItemActive: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  actions: {
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
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonText: {
    color: colors.onAccent,
    fontSize: 13,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
