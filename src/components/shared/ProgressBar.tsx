import { StyleSheet, View, type ColorValue, type DimensionValue } from 'react-native';

import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

type ProgressBarProps = {
  accent: ColorValue;
  value: number;
};

export function ProgressBar({ accent, value }: ProgressBarProps) {
  const width: DimensionValue = `${Math.max(0, Math.min(value, 1)) * 100}%`;

  return (
    <View style={styles.progressTrack}>
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
