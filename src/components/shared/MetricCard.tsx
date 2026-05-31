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
    <GlassSurface borderRadius={radius.lg} style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: tone }]}>
          <Ionicons color={colors.onAccent} name={icon} size={15} />
        </View>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 104,
  },
  metricHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  metricValue: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 26,
  },
  metricLabel: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
});
