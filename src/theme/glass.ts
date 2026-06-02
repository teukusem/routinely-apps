import { Platform } from 'react-native';

import { radius } from './spacing';

const androidNavOverlay = 'rgba(246, 246, 246, 0.2)';

export const glass = {
  blurIntensity: Platform.OS === 'android' ? 48 : 36,
  navBlurIntensity: Platform.OS === 'android' ? 80 : 56,
  cardOverlay: Platform.OS === 'android' ? 'rgba(246, 246, 246, 0.16)' : 'rgba(246, 246, 246, 0.12)',
  nestedFill: 'rgba(246, 246, 246, 0.09)',
  panelFill: 'rgba(246, 246, 246, 0.06)',
  fallbackFill: 'rgba(32, 32, 32, 0.92)',
  navFallbackFill: Platform.OS === 'android' ? 'rgba(24, 24, 24, 0.78)' : 'rgba(32, 32, 32, 0.96)',
  navOverlay: Platform.OS === 'android' ? androidNavOverlay : 'rgba(246, 246, 246, 0.12)',
  defaultRadius: radius.xl,
  activeDateEdgeWidth: 4,
} as const;

/** Subtle lift for nav only; heavy card shadows reduce clarity on the dark background. */
export const shadows = {
  nav: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
