import React, { useCallback } from "react";
import {
  Pressable,
  View,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { useTheme } from "../../theme/theme-context.js";
import { useRadioGroupContext } from "./radio-context.js";

export interface RadioItemProps
  extends Omit<PressableProps, "disabled" | "onPress" | "style" | "children"> {
  /** The value this radio option represents */
  value: string;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Override container style */
  style?: StyleProp<ViewStyle>;
  /** Override label text style */
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

/**
 * RadioItem -- individual radio option within a RadioGroup.
 *
 * Renders a Pressable row with a circle indicator and label text.
 * When selected, the circle shows a filled inner dot.
 *
 * ```tsx
 * <RadioItem value="option-1">Option 1</RadioItem>
 * ```
 */
export function RadioItem({
  value,
  disabled,
  style,
  textStyle,
  children,
  ...rest
}: RadioItemProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const { getRadioProps } = useRadioGroupContext();
  const propGetterReturn = getRadioProps(value, { disabled });
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);
  const isChecked = propGetterReturn.accessibility.checked === true;
  const isDisabled = propGetterReturn.accessibility.disabled === true;

  const handlePress = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

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
          gap: bt.entropixSpacing2 as number,
        },
        isDisabled && { opacity: 0.5 },
        style,
      ]}
    >
      {/* Outer circle */}
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: isChecked
            ? (t.entropixColorActionPrimaryDefault as string)
            : (t.entropixColorBorderDefault as string),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Inner filled circle */}
        {isChecked ? (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: t.entropixColorActionPrimaryDefault as string,
            }}
          />
        ) : null}
      </View>

      {typeof children === "string" ? (
        <Text
          style={[
            {
              fontSize: bt.entropixFontSizeSm as number,
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
