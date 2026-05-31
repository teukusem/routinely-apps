import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type ColorValue } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

type MetricCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone: ColorValue;
  value: string;
};

export function MetricCard({ icon, label, tone, value }: MetricCardProps) {
  return (
    <GlassSurface borderRadius={radius.lg} contentStyle={styles.metricCard} style={styles.metricShell}>
      <View style={[styles.metricIcon, { backgroundColor: tone }]}>
        <Ionicons color={colors.onAccent} name={icon} size={14} />
      </View>
      <View style={styles.metricCopy}>
        <Text numberOfLines={1} style={styles.metricValue}>
          {value}
        </Text>
        <Text numberOfLines={1} style={styles.metricLabel}>
          {label}
        </Text>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  metricShell: {
    flex: 1,
    minWidth: 0,
  },
  metricCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexShrink: 0,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  metricCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  metricValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
});
