import { BlurView } from 'expo-blur';
import { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { glass, shadows } from '../theme/glass';
import { radius } from '../theme/spacing';

export type GlassVariant = 'card' | 'nested' | 'panel' | 'nav';

type GlassSurfaceProps = PropsWithChildren<{
  borderRadius?: number;
  contentStyle?: StyleProp<ViewStyle>;
  noPadding?: boolean;
  overflowHidden?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: GlassVariant;
}>;

export function GlassSurface({
  borderRadius = glass.defaultRadius,
  children,
  contentStyle,
  noPadding = false,
  overflowHidden = false,
  style,
  variant = 'card',
}: GlassSurfaceProps) {
  const isNested = variant === 'nested';
  const isPanel = variant === 'panel';
  const isNav = variant === 'nav';
  const useBlur = Platform.OS === 'ios' && !isNested && !isPanel;
  const blurIntensity = isNav ? glass.navBlurIntensity : glass.blurIntensity;

  const fillColor = isNested
    ? glass.nestedFill
    : isPanel
      ? glass.panelFill
      : isNav
        ? useBlur
          ? glass.navOverlay
          : glass.navFallbackFill
        : useBlur
          ? glass.cardOverlay
          : glass.fallbackFill;

  return (
    <View
      style={[
        styles.outer,
        { borderRadius },
        overflowHidden && styles.overflowHidden,
        isNav && shadows.nav,
        style,
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.surfaceClip,
          { borderRadius },
        ]}
      >
        {useBlur ? (
          <BlurView
            intensity={blurIntensity}
            style={StyleSheet.absoluteFill}
            tint={isNav ? 'dark' : 'default'}
          />
        ) : null}
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.fill,
            { backgroundColor: fillColor },
          ]}
        />
      </View>
      <View style={[styles.border, { borderRadius }]} />
      <View style={[styles.content, !noPadding && styles.padded, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'relative',
  },
  overflowHidden: {
    overflow: 'hidden',
  },
  surfaceClip: {
    overflow: 'hidden',
  },
  fill: {
    overflow: 'hidden',
  },
  border: {
    ...StyleSheet.absoluteFill,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
  },
  padded: {
    padding: 16,
  },
});
