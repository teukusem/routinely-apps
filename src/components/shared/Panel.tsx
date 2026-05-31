import { StyleSheet } from 'react-native';

import { GlassSurface } from '../GlassSurface';
import { radius, spacing } from '../../theme/spacing';

export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <GlassSurface borderRadius={radius.lg} contentStyle={styles.panel} variant="panel">
      {children}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.sm,
  },
});
