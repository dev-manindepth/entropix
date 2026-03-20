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
import { useToggle } from "@entropix/core";
import { mapAccessibilityToRN } from "../utils/map-accessibility-to-rn.js";
import { useTheme } from "../theme/theme-context.js";

export type CheckboxSize = "sm" | "md" | "lg";

export interface CheckboxProps
  extends Omit<PressableProps, "disabled" | "onPress" | "style" | "children"> {
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state for uncontrolled mode */
  defaultChecked?: boolean;
  /** Called when checked state changes */
  onChange?: (checked: boolean) => void;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Whether the checkbox is in an indeterminate state */
  indeterminate?: boolean;
  /** Accessible label */
  label?: string;
  /** Size variant. Default: "md" */
  size?: CheckboxSize;
  /** Override container style */
  style?: StyleProp<ViewStyle>;
  /** Override label text style */
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

/**
 * Checkbox -- styled checkbox with indicator box and label.
 *
 * Renders a row with a square indicator (filled when checked with
 * a checkmark, dash when indeterminate) and a text label.
 *
 * ```tsx
 * <Checkbox onChange={setAccepted} label="Accept Terms">
 *   I agree to the terms and conditions
 * </Checkbox>
 * ```
 */
export function Checkbox({
  checked,
  defaultChecked,
  onChange,
  disabled,
  indeterminate,
  label,
  size = "md",
  style,
  textStyle,
  children,
  ...rest
}: CheckboxProps) {
  const { tokens: t, baseTokens: bt } = useTheme();

  const { isChecked, isDisabled, getToggleProps } = useToggle({
    checked,
    defaultChecked,
    onChange,
    disabled,
    role: "checkbox",
  });

  const propGetterReturn = getToggleProps();
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  // Override checked state for indeterminate
  if (indeterminate) {
    rnAccessibility.accessibilityState = {
      ...rnAccessibility.accessibilityState,
      checked: "mixed",
    };
  }

  if (label) {
    rnAccessibility.accessibilityLabel = label;
  }

  const handlePress = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  const sizeStyles = getSizeStyles(size, bt);
  const isActive = indeterminate || isChecked;

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
      <View
        style={{
          width: sizeStyles.boxSize,
          height: sizeStyles.boxSize,
          borderWidth: 2,
          borderColor: isActive
            ? (t.entropixColorActionPrimaryDefault as string)
            : (t.entropixColorBorderDefault as string),
          borderRadius: bt.entropixRadiusSm as number,
          backgroundColor: isActive
            ? (t.entropixColorActionPrimaryDefault as string)
            : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {indeterminate ? (
          <Text
            style={{
              fontSize: sizeStyles.indicatorFontSize,
              fontWeight: "700",
              color: t.entropixColorTextInverse as string,
              lineHeight: sizeStyles.boxSize - 2,
            }}
          >
            {"\u2013"}
          </Text>
        ) : isChecked ? (
          <Text
            style={{
              fontSize: sizeStyles.indicatorFontSize,
              fontWeight: "700",
              color: t.entropixColorTextInverse as string,
              lineHeight: sizeStyles.boxSize - 2,
            }}
          >
            {"\u2713"}
          </Text>
        ) : null}
      </View>

      {typeof children === "string" ? (
        <Text
          style={[
            {
              fontSize: sizeStyles.fontSize,
              color: t.entropixColorTextPrimary as string,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : children != null ? (
        children
      ) : label ? (
        <Text
          style={[
            {
              fontSize: sizeStyles.fontSize,
              color: t.entropixColorTextPrimary as string,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

function getSizeStyles(size: CheckboxSize, bt: Record<string, unknown>) {
  switch (size) {
    case "sm":
      return {
        boxSize: 16,
        indicatorFontSize: 10,
        fontSize: bt.entropixFontSizeXs as number,
      };
    case "lg":
      return {
        boxSize: 24,
        indicatorFontSize: 16,
        fontSize: bt.entropixFontSizeBase as number,
      };
    default:
      return {
        boxSize: 20,
        indicatorFontSize: 13,
        fontSize: bt.entropixFontSizeSm as number,
      };
  }
}
