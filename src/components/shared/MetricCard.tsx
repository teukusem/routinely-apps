import { StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { IconBadge, type IconAccentName, type IconName } from './Icon';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

type MetricCardProps = {
  accent: IconAccentName;
  icon: IconName;
  label: string;
  layout?: 'inline' | 'stack';
  value: string;
};

export function MetricCard({ accent, icon, label, layout = 'inline', value }: MetricCardProps) {
  const stacked = layout === 'stack';

  return (
    <View accessible accessibilityLabel={`${label}: ${value}`} accessibilityRole="text" style={styles.metricShell}>
      <GlassSurface
        borderRadius={radius.lg}
        contentStyle={[styles.metricCard, stacked && styles.metricCardStack]}
        style={stacked ? styles.metricCardSurfaceStack : undefined}
      >
        <IconBadge
          accent={accent}
          badgeSize={stacked ? 28 : 26}
          name={icon}
          size="sm"
          style={stacked ? styles.metricIconStack : styles.metricIcon}
        />
        <View style={[styles.metricCopy, stacked && styles.metricCopyStack]}>
          <Text numberOfLines={1} style={[styles.metricValue, stacked && styles.metricValueStack]}>
            {value}
          </Text>
          <Text numberOfLines={2} style={[styles.metricLabel, stacked && styles.metricLabelStack]}>
            {label}
          </Text>
        </View>
      </GlassSurface>
    </View>
  );
}

const STACKED_MIN_HEIGHT = 108;

const styles = StyleSheet.create({
  metricShell: {
    alignSelf: 'stretch',
    flex: 1,
    minWidth: 0,
  },
  metricCardSurfaceStack: {
    flex: 1,
    minHeight: STACKED_MIN_HEIGHT,
  },
  metricCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
  },
  metricCardStack: {
    flex: 1,
    flexDirection: 'column',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: STACKED_MIN_HEIGHT,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  metricIcon: {
    flexShrink: 0,
  },
  metricIconStack: {
    flexShrink: 0,
  },
  metricCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  metricCopyStack: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    justifyContent: 'center',
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
    fontSize: 11,
    lineHeight: 13,
    minHeight: 26,
    textAlign: 'center',
  },
});
