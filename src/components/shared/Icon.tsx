import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type ColorValue, type ViewStyle } from 'react-native';

import { colors } from '../../theme/colors';
import { iconAccentPair, iconColors, type IconAccentName } from '../../theme/iconColors';
import { radius } from '../../theme/spacing';

export type IconName = keyof typeof Ionicons.glyphMap;

export const iconSizes = {
  xs: 11,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
} as const;

export type IconSize = keyof typeof iconSizes;

export type IconTone =
  | 'primary'
  | 'text'
  | 'muted'
  | 'danger'
  | 'success'
  | 'wellness'
  | 'focus'
  | 'onAccent'
  | 'warning';

const toneColors: Record<IconTone, string> = {
  primary: colors.primary,
  text: colors.text,
  muted: colors.textMuted,
  danger: colors.danger,
  success: colors.success,
  wellness: colors.wellness,
  focus: colors.focus,
  onAccent: colors.onAccent,
  warning: colors.warning,
};

export function resolveIconSize(size: IconSize | number): number {
  return typeof size === 'number' ? size : iconSizes[size];
}

export function resolveIconColor({
  accent,
  color,
  tone = 'text',
}: {
  accent?: IconAccentName;
  color?: ColorValue;
  tone?: IconTone;
}): ColorValue {
  if (color) {
    return color;
  }

  if (accent) {
    return iconAccentPair(accent).icon;
  }

  return toneColors[tone];
}

type IconProps = {
  name: IconName;
  /** Vibrant palette accent — overrides `tone` when `color` is not set. */
  accent?: IconAccentName;
  /** Explicit color override — takes precedence over `accent` and `tone`. */
  color?: ColorValue;
  /** Semantic theme color when `color` and `accent` are not set. */
  tone?: IconTone;
  size?: IconSize | number;
  accessibilityLabel?: string;
};

export function Icon({ name, accent, color, tone = 'text', size = 'md', accessibilityLabel }: IconProps) {
  return (
    <Ionicons
      accessibilityLabel={accessibilityLabel}
      color={resolveIconColor({ accent, color, tone })}
      name={name}
      size={resolveIconSize(size)}
    />
  );
}

type IconBadgeProps = IconProps & {
  /** Background fill for the badge container. */
  badgeColor?: ColorValue;
  badgeSize?: IconSize | number;
  style?: ViewStyle;
};

export function IconBadge({
  name,
  accent,
  badgeColor,
  badgeSize = 'lg',
  color,
  tone = 'muted',
  size = 'sm',
  style,
  accessibilityLabel,
}: IconBadgeProps) {
  const dimension = resolveIconSize(badgeSize);
  const accentPair = accent ? iconAccentPair(accent) : null;
  const resolvedBadgeColor = badgeColor ?? accentPair?.soft ?? colors.surfaceMuted;
  const iconColor = color ?? (accent ? accentPair?.icon : undefined);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.badge,
        {
          backgroundColor: resolvedBadgeColor,
          height: dimension,
          width: dimension,
        },
        style,
      ]}
    >
      <Icon accent={accent} color={iconColor} name={name} size={size} tone={tone} />
    </View>
  );
}

export { iconColors, type IconAccentName };

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
});
