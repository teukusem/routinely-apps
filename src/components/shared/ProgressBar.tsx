import { StyleSheet, View, type ColorValue, type DimensionValue } from 'react-native';

import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

type ProgressBarProps = {
  accent: ColorValue;
  label: string;
  value: number;
};

export function ProgressBar({ accent, label, value }: ProgressBarProps) {
  const normalizedValue = Math.max(0, Math.min(value, 1));
  const percentage = Math.round(normalizedValue * 100);
  const width: DimensionValue = `${normalizedValue * 100}%`;

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 100, min: 0, now: percentage, text: `${percentage}%` }}
      style={styles.progressTrack}
    >
      <View style={[styles.progressFill, { backgroundColor: accent, width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    flex: 1,
    height: 8,
    minWidth: 0,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radius.pill,
    height: '100%',
  },
});
