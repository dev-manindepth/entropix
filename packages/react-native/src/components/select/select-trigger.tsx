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
import { useLocale } from "../../i18n/i18n-context.js";
import { useSelectContext } from "./select-context.js";

export interface SelectTriggerProps
  extends Omit<PressableProps, "disabled" | "onPress" | "style" | "children"> {
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Display label for the currently selected value */
  displayValue?: string;
  /** Override container style */
  style?: StyleProp<ViewStyle>;
  /** Override text style */
  textStyle?: TextStyle;
}

/**
 * SelectTrigger -- the button that opens the select dropdown.
 *
 * Renders as a bordered input-like row with the selected value
 * (or placeholder) and a chevron indicator.
 */
export function SelectTrigger({
  placeholder,
  displayValue,
  style,
  textStyle,
  ...rest
}: SelectTriggerProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const locale = useLocale();
  const { selectedValue, isDisabled, isOpen, getTriggerProps } =
    useSelectContext();
  const propGetterReturn = getTriggerProps();
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  const handlePress = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  const hasValue = selectedValue !== "";
  const label = displayValue ?? (hasValue ? selectedValue : (placeholder ?? locale.select_placeholder));

  return (
    <Pressable
      {...rnAccessibility}
      {...rest}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : handlePress}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: bt.entropixSpacing2 as number,
          paddingHorizontal: bt.entropixSpacing3 as number,
          borderWidth: 1,
          borderColor: isOpen
            ? (t.entropixColorActionPrimaryDefault as string)
            : (t.entropixColorBorderDefault as string),
          borderRadius: bt.entropixRadiusMd as number,
          backgroundColor: t.entropixColorBgPrimary as string,
        },
        isDisabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text
        style={[
          {
            fontSize: bt.entropixFontSizeSm as number,
            color: hasValue
              ? (t.entropixColorTextPrimary as string)
              : (t.entropixColorTextTertiary as string),
            flex: 1,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: bt.entropixFontSizeXs as number,
          color: t.entropixColorTextSecondary as string,
          marginLeft: bt.entropixSpacing2 as number,
        }}
      >
        {"\u25BC"}
      </Text>
    </Pressable>
  );
}
