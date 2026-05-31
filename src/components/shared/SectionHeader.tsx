import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type SectionHeaderProps = {
  compact?: boolean;
  meta: string;
  title: string;
};

export function SectionHeader({ compact = false, meta, title }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={compact ? styles.compactSectionTitle : styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionMeta}>{meta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  compactSectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
});
