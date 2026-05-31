import { radius } from './spacing';

export const glass = {
  blurIntensity: 36,
  navBlurIntensity: 56,
  cardOverlay: 'rgba(255, 255, 255, 0.07)',
  nestedFill: 'rgba(255, 255, 255, 0.06)',
  panelFill: 'rgba(255, 255, 255, 0.04)',
  fallbackFill: 'rgba(22, 24, 32, 0.55)',
  navFallbackFill: 'rgba(22, 24, 32, 0.5)',
  defaultRadius: radius.xl,
  activeDateEdgeWidth: 4,
} as const;

/** Subtle lift for nav only — heavy card shadows read as muddy black on dark wallpaper. */
export const shadows = {
  nav: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
