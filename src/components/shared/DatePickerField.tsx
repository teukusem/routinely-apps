import { format } from 'date-fns';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useDatePickerModal } from '../../contexts/DatePickerModalContext';
import { GlassSurface } from '../GlassSurface';
import { Icon } from './Icon';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { isValidLocalDate, parseLocalDate, toLocalDate } from '../../utils/local-date';

const DISPLAY_FORMAT = 'MMM dd, yyyy';

function formatDisplayValue(iso: string): string | undefined {
  if (!isValidLocalDate(iso)) {
    return undefined;
  }

  return format(parseLocalDate(iso), DISPLAY_FORMAT);
}

function toMinDateString(minimumDate?: Date): string | undefined {
  return minimumDate ? toLocalDate(minimumDate) : undefined;
}

type DatePickerFieldProps = {
  label: string;
  minimumDate?: Date;
  onChange: (value: string) => void;
  onClear?: () => void;
  optional?: boolean;
  placeholder?: string;
  value: string;
};

export function DatePickerField({
  label,
  minimumDate,
  onChange,
  onClear,
  optional = false,
  placeholder = 'Select date',
  value,
}: DatePickerFieldProps) {
  const { openDatePicker } = useDatePickerModal();
  const hasValue = isValidLocalDate(value);
  const displayLabel = hasValue ? formatDisplayValue(value) : placeholder;
  const minDate = toMinDateString(minimumDate);

  function openPicker() {
    openDatePicker({
      minDate,
      onConfirm: onChange,
      title: label,
      value: hasValue ? value : toLocalDate(minimumDate ?? new Date()),
    });
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>{label}</Text>
          {optional && hasValue && onClear ? (
            <Pressable accessibilityLabel={`Clear ${label}`} accessibilityRole="button" hitSlop={8} onPress={onClear}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          ) : null}
        </View>
        <GlassSurface borderRadius={radius.lg} contentStyle={styles.triggerContent} variant="nested">
          <Icon color={colors.textMuted} name="calendar-outline" size={16} />
          <TextInput
            accessibilityLabel={label}
            onChangeText={onChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            style={styles.webInput}
            value={value}
          />
        </GlassSurface>
      </View>
    );
  }

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.labelRow}>
        <Text style={styles.inputLabel}>{label}</Text>
        {optional && hasValue && onClear ? (
          <Pressable accessibilityLabel={`Clear ${label}`} accessibilityRole="button" hitSlop={8} onPress={onClear}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={openPicker}
        style={({ pressed }) => [pressed && styles.triggerPressed]}
      >
        <GlassSurface borderRadius={radius.lg} contentStyle={styles.triggerContent} variant="nested">
          <Icon color={colors.textMuted} name="calendar-outline" size={16} />
          <Text style={[styles.triggerValue, !hasValue && styles.triggerPlaceholder]}>{displayLabel}</Text>
          <Icon color={colors.textMuted} name="chevron-forward" size={14} />
        </GlassSurface>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: spacing.xs,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  clearText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  triggerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  triggerPressed: {
    opacity: 0.88,
  },
  triggerValue: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  triggerPlaceholder: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  webInput: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    padding: 0,
  },
});
