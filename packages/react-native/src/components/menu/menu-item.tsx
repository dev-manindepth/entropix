import React, { useCallback } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useMenuContext } from "./menu-context.js";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { wrapStringChildren } from "../../utils/wrap-string-children.js";
import { useTheme } from "../../theme/theme-context.js";

export interface MenuItemProps
  extends Omit<PressableProps, "onPress" | "disabled" | "style"> {
  index: number;
  onSelect?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
}

export function MenuItem({
  index,
  onSelect,
  disabled,
  children,
  style,
  textStyle,
  ...rest
}: MenuItemProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const { getItemProps } = useMenuContext();
  const propGetterReturn = getItemProps(index, { onSelect, disabled });
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  const handlePress = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  return (
    <Pressable
      {...rnAccessibility}
      {...rest}
      disabled={disabled}
      onPress={propGetterReturn.onAction ? handlePress : undefined}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: bt.entropixSpacing2 as number,
          paddingHorizontal: bt.entropixSpacing3 as number,
          borderRadius: bt.entropixRadiusSm as number,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {wrapStringChildren(children, {
        fontSize: bt.entropixFontSizeSm as number,
        color: t.entropixColorTextPrimary as string,
        ...textStyle,
      })}
    </Pressable>
  );
}
