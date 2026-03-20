import React, { useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useDialogContext } from "./dialog-context.js";

export interface DialogOverlayProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * DialogOverlay — backdrop element behind dialog content.
 * Note: With the self-styled DialogContent, the overlay is built into the
 * Modal wrapper. This component is kept for consumers who need a separate
 * overlay element (e.g., custom dismiss-on-tap behavior outside DialogContent).
 */
export function DialogOverlay({ style, testID }: DialogOverlayProps) {
  const { isOpen, getOverlayProps } = useDialogContext();
  const propGetterReturn = getOverlayProps();

  const handlePress = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  if (!isOpen) return null;

  return (
    <Pressable
      testID={testID}
      accessible={false}
      importantForAccessibility="no"
      onPress={propGetterReturn.onAction ? handlePress : undefined}
      style={[
        {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        style,
      ]}
    />
  );
}
