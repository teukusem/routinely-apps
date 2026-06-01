import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from './GlassSurface';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type DatePillProps = {
  active?: boolean;
  label: string;
  onPress: () => void;
  value: string;
};

export function DatePill({ active = false, label, onPress, value }: DatePillProps) {
  return (
    <Pressable
      accessibilityLabel={`${label} ${value}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <GlassSurface borderRadius={radius.md} noPadding overflowHidden style={styles.pill}>
        {active ? (
          <>
            <View style={styles.activeFill} />
            <View style={styles.activeBorder} />
          </>
        ) : null}
        <View style={styles.inner}>
          <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
          <Text style={[styles.value, active && styles.valueActive]}>{value}</Text>
        </View>
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  pressed: {
    opacity: 0.84,
  },
  pill: {
    flex: 1,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  labelActive: {
    color: colors.primary,
  },
  valueActive: {
    color: colors.text,
  },
  activeFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.primarySoft,
  },
  activeBorder: {
    ...StyleSheet.absoluteFill,
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderWidth: 1.5,
    pointerEvents: 'none',
  },
});
