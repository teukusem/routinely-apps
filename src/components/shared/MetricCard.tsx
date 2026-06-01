import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type ColorValue } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

type MetricCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  layout?: 'inline' | 'stack';
  tone: ColorValue;
  value: string;
};

export function MetricCard({ icon, label, layout = 'inline', tone, value }: MetricCardProps) {
  const stacked = layout === 'stack';

  return (
    <GlassSurface
      borderRadius={radius.lg}
      contentStyle={[styles.metricCard, stacked && styles.metricCardStack]}
      style={styles.metricShell}
    >
      <View style={[styles.metricIcon, stacked && styles.metricIconStack, { backgroundColor: tone }]}>
        <Ionicons color={colors.onAccent} name={icon} size={14} />
      </View>
      <View style={[styles.metricCopy, stacked && styles.metricCopyStack]}>
        <Text numberOfLines={1} style={[styles.metricValue, stacked && styles.metricValueStack]}>
          {value}
        </Text>
        <Text numberOfLines={stacked ? 2 : 1} style={[styles.metricLabel, stacked && styles.metricLabelStack]}>
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
  metricCardStack: {
    flexDirection: 'column',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexShrink: 0,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  metricIconStack: {
    height: 28,
    width: 28,
  },
  metricCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  metricCopyStack: {
    alignItems: 'center',
    flex: 0,
    gap: 2,
    width: '100%',
  },
  metricValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  metricValueStack: {
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  metricLabelStack: {
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
  },
});
