import React, { useCallback } from "react";
import {
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { useTheme } from "../../theme/theme-context.js";
import { useSelectContext } from "./select-context.js";

export interface SelectOptionProps
  extends Omit<PressableProps, "disabled" | "onPress" | "style" | "children"> {
  /** The value this option represents */
  value: string;
  /** Index of this option in the list */
  index: number;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Override container style */
  style?: StyleProp<ViewStyle>;
  /** Override text style */
  textStyle?: TextStyle;
  children: React.ReactNode;
}

/**
 * SelectOption -- an individual option within SelectContent.
 *
 * Renders as a Pressable row. Selected option gets a highlight
 * background to indicate the current selection.
 */
export function SelectOption({
  value,
  index,
  disabled,
  style,
  textStyle,
  children,
  ...rest
}: SelectOptionProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const { getOptionProps } = useSelectContext();
  const propGetterReturn = getOptionProps(value, index, { disabled });
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);
  const isSelected = propGetterReturn.accessibility.selected === true;

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
          backgroundColor: isSelected
            ? (t.entropixColorBgSecondary as string)
            : "transparent",
        },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text
          style={[
            {
              fontSize: bt.entropixFontSizeSm as number,
              fontWeight: isSelected ? "600" : "400",
              color: t.entropixColorTextPrimary as string,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
