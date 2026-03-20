import React, { useCallback } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useDialogContext } from "./dialog-context.js";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";

export interface DialogTriggerProps
  extends Omit<PressableProps, "onPress" | "style"> {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * DialogTrigger — Pressable that opens/closes the dialog.
 */
export function DialogTrigger({
  children,
  style,
  ...rest
}: DialogTriggerProps) {
  const { getTriggerProps } = useDialogContext();
  const propGetterReturn = getTriggerProps();
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  const handlePress = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  return (
    <Pressable
      {...rnAccessibility}
      {...rest}
      onPress={handlePress}
      style={style}
    >
      {children}
    </Pressable>
  );
}
