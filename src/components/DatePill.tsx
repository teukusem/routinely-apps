import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from './GlassSurface';
import { colors } from '../theme/colors';
import { glass } from '../theme/glass';
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
      <GlassSurface borderRadius={radius.lg} noPadding overflowHidden style={styles.pill}>
        {active ? (
          <>
            <View style={styles.activeFill} />
            <View style={styles.activeOutline} />
            <View style={[styles.activeEdge, styles.activeEdgeLeft]} />
            <View style={[styles.activeEdge, styles.activeEdgeRight]} />
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

const edgeWidth = glass.activeDateEdgeWidth;

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  pill: {
    flex: 1,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
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
  activeOutline: {
    ...StyleSheet.absoluteFill,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  activeEdge: {
    backgroundColor: colors.primary,
    bottom: 0,
    position: 'absolute',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 8,
    top: 0,
    width: edgeWidth,
  },
  activeEdgeLeft: {
    borderBottomLeftRadius: radius.lg,
    borderTopLeftRadius: radius.lg,
    left: 0,
  },
  activeEdgeRight: {
    borderBottomRightRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    right: 0,
  },
});
