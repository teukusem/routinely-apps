import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { AuroraBackground } from './AuroraBackground';
import { spacing } from '../theme/spacing';

type ScreenProps = PropsWithChildren<{
  padded?: boolean;
  safeAreaEdges?: Edge[];
}>;

export function Screen({ children, padded = true, safeAreaEdges }: ScreenProps) {
  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
        <View style={[styles.content, padded && styles.padded]}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
});
