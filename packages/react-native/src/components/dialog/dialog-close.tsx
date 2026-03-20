import React, { useCallback } from "react";
import {
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useDialogContext } from "./dialog-context.js";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { useTheme } from "../../theme/theme-context.js";

export interface DialogCloseProps
  extends Omit<PressableProps, "onPress" | "style"> {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * DialogClose — Pressable that closes the dialog.
 * Renders as a positioned "✕" button by default if no children provided.
 */
export function DialogClose({ children, style, ...rest }: DialogCloseProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const { getCloseProps } = useDialogContext();
  const propGetterReturn = getCloseProps();
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  const handlePress = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  return (
    <Pressable
      {...rnAccessibility}
      {...rest}
      onPress={handlePress}
      style={[
        {
          position: "absolute",
          top: bt.entropixSpacing3 as number,
          right: bt.entropixSpacing3 as number,
          width: 32,
          height: 32,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: bt.entropixRadiusSm as number,
        },
        style,
      ]}
      accessibilityRole="button"
    >
      {children ?? (
        <Text
          style={{
            fontSize: 16,
            color: t.entropixColorTextSecondary as string,
          }}
        >
          ✕
        </Text>
      )}
    </Pressable>
  );
}
