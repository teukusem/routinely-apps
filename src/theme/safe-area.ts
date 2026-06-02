import { Platform } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

import { spacing } from './spacing';

/** Android often reports 0 bottom inset above the 3-button navigation bar. */
export const ANDROID_BOTTOM_INSET_FALLBACK = 48;

export function effectiveBottomInset(insets: EdgeInsets): number {
  if (Platform.OS === 'android') {
    return Math.max(insets.bottom, ANDROID_BOTTOM_INSET_FALLBACK);
  }
  return insets.bottom;
}

export function sheetFooterPadding(insets: EdgeInsets): number {
  return effectiveBottomInset(insets) + spacing.lg;
}
