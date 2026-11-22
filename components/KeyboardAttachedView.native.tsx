import React from 'react';
import { Platform, type ViewProps } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Attaches the chat composer directly above the active software keyboard using
 * react-native-keyboard-controller's native window-inset tracking.
 *
 * Unlike manual measureInWindow + Animated.timing offsets, KeyboardStickyView
 * binds translateY directly to the single native keyboard height, preventing
 * layout/animation feedback loops that can compound the offset.
 *
 * On Android, KeyboardProvider subtracts the system navigation bar inset from
 * the reported keyboard height automatically; on iOS, SafeAreaView already
 * reserves insets.bottom so we offset by insets.bottom while open.
 */
export function KeyboardAttachedView({ children, ...props }: React.PropsWithChildren<ViewProps>) {
  const insets = useSafeAreaInsets();
  const openedOffset = Platform.OS === 'ios' ? insets.bottom : 0;

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: openedOffset }} {...props}>
      {children}
    </KeyboardStickyView>
  );
}
