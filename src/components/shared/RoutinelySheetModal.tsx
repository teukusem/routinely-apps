import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { effectiveBottomInset, sheetFooterPadding } from '../../theme/safe-area';
import { radius, spacing } from '../../theme/spacing';

type RoutinelySheetModalProps = Omit<BottomSheetModalProps, 'children' | 'snapPoints'> & {
  children: ReactNode;
  contentKey?: string;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  footerStyle?: StyleProp<ViewStyle>;
};

export const RoutinelySheetModal = forwardRef<BottomSheetModal, RoutinelySheetModalProps>(
  function RoutinelySheetModal({ children, contentKey, contentStyle, footer, footerStyle, onDismiss, ...rest }, ref) {
    const insets = useSafeAreaInsets();

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.42} />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.background}
        enableContentPanningGesture={false}
        enableDynamicSizing
        enableOverDrag={false}
        enablePanDownToClose
        handleIndicatorStyle={styles.handle}
        handleStyle={styles.handleContainer}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        onDismiss={onDismiss}
        {...rest}
      >
        <BottomSheetView
          accessibilityViewIsModal
          key={contentKey}
          style={[
            styles.content,
            contentStyle,
            !footer && { paddingBottom: effectiveBottomInset(insets) + spacing.xl },
          ]}
        >
          {children}
          {footer ? (
            <View
              style={[styles.footer, { paddingBottom: sheetFooterPadding(insets) }, footerStyle]}
            >
              {footer}
            </View>
          ) : null}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.glassBorder,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
  },
  handleContainer: {
    paddingTop: spacing.sm,
  },
  handle: {
    backgroundColor: colors.glassBorder,
    width: 48,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  footer: {
    borderTopColor: colors.hairline,
    borderTopWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.lg,
  },
});
