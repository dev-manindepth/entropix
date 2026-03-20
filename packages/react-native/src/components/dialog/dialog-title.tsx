import React from "react";
import { Text, type TextProps, type StyleProp, type TextStyle } from "react-native";
import { useDialogContext } from "./dialog-context.js";
import { useTheme } from "../../theme/theme-context.js";

export interface DialogTitleProps extends Omit<TextProps, "style"> {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

/**
 * DialogTitle — Text element with nativeID for accessibility linking.
 * Uses accessibilityRole="header" for screen reader heading semantics.
 */
export function DialogTitle({ children, style, ...rest }: DialogTitleProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const { ids } = useDialogContext();

  return (
    <Text
      {...rest}
      nativeID={ids.title}
      style={[
        {
          fontSize: 18,
          fontWeight: "600",
          color: t.entropixColorTextPrimary as string,
          marginBottom: bt.entropixSpacing2 as number,
        },
        style,
      ]}
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}
