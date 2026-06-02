import { StyleSheet, Text, View } from 'react-native';

import { IconBadge, type IconName } from './Icon';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

type EmptyStateProps = {
  accent?: 'lavender' | 'mint' | 'sky' | 'violet';
  description: string;
  icon?: IconName;
  title: string;
};

export function EmptyState({
  accent = 'lavender',
  description,
  icon = 'planet-outline',
  title,
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <IconBadge accent={accent} badgeSize={34} name={icon} size="lg" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
