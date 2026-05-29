import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function HomeScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Expo + React Native</Text>
        <Text style={styles.title}>Boilerplate is ready.</Text>
        <Text style={styles.description}>
          Start with screens, components, and theme tokens. Add navigation only
          when the app has more than one real route.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '700',
  },
  description: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
});
