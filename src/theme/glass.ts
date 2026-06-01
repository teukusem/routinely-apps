import { radius } from './spacing';

export const glass = {
  blurIntensity: 36,
  navBlurIntensity: 56,
  cardOverlay: 'rgba(246, 246, 246, 0.12)',
  nestedFill: 'rgba(246, 246, 246, 0.09)',
  panelFill: 'rgba(246, 246, 246, 0.06)',
  fallbackFill: 'rgba(32, 32, 32, 0.92)',
  navFallbackFill: 'rgba(32, 32, 32, 0.96)',
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
