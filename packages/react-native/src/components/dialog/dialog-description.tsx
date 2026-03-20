import React from "react";
import { Text, type TextProps, type StyleProp, type TextStyle } from "react-native";
import { useDialogContext } from "./dialog-context.js";
import { useTheme } from "../../theme/theme-context.js";

export interface DialogDescriptionProps extends Omit<TextProps, "style"> {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

/**
 * DialogDescription — Text element with nativeID for accessibility linking.
 */
export function DialogDescription({
  children,
  style,
  ...rest
}: DialogDescriptionProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const { ids } = useDialogContext();

  return (
    <Text
      {...rest}
      nativeID={ids.description}
      style={[
        {
          fontSize: bt.entropixFontSizeSm as number,
          color: t.entropixColorTextSecondary as string,
          lineHeight: 20,
          marginBottom: bt.entropixSpacing4 as number,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
