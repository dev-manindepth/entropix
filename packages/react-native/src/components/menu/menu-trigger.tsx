import React, { useCallback } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useMenuContext } from "./menu-context.js";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";

export interface MenuTriggerProps
  extends Omit<PressableProps, "onPress" | "style"> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function MenuTrigger({ children, style, ...rest }: MenuTriggerProps) {
  const { getTriggerProps } = useMenuContext();
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
