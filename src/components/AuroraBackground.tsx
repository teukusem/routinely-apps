import { ImageBackground, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

const backgroundImage = require('../../assets/background.png');

export function AuroraBackground() {
  return (
    <View pointerEvents="none" style={styles.root}>
      <ImageBackground resizeMode="cover" source={backgroundImage} style={styles.image}>
        <View style={styles.scrim} />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 6, 10, 0.62)',
  },
});
