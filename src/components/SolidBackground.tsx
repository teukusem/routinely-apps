import { StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

export function SolidBackground() {
  return <View pointerEvents="none" style={styles.root} />;
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
});
