import React, { useCallback } from "react";
import {
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useToggle, type UseToggleOptions } from "@entropix/core";
import { mapAccessibilityToRN } from "../utils/map-accessibility-to-rn.js";
import { useTheme } from "../theme/theme-context.js";

export interface ToggleProps
  extends Omit<PressableProps, "disabled" | "onPress" | "style" | "children"> {
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state for uncontrolled mode */
  defaultChecked?: boolean;
  /** Called when checked state changes */
  onChange?: (checked: boolean) => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Accessible label */
  label?: string;
  /** Override container style */
  style?: StyleProp<ViewStyle>;
  /** Override label text style */
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

/** Internal props used by Switch to override the role */
interface ToggleInternalProps extends ToggleProps {
  /** @internal Override the ARIA role */
  role?: UseToggleOptions["role"];
}

/**
 * Toggle — styled checkbox toggle.
 *
 * Renders as a bordered pill that fills blue when checked.
 *
 * ```tsx
 * <Toggle onChange={setChecked}>Accept Terms</Toggle>
 * ```
 */
export function Toggle(props: ToggleProps) {
  return <ToggleInner {...props} role="checkbox" />;
}

/** @internal Shared implementation for Toggle and Switch */
export function ToggleInner({
  checked,
  defaultChecked,
  onChange,
  disabled,
  label,
  role = "checkbox",
  style,
  textStyle,
  children,
  ...rest
}: ToggleInternalProps) {
  const { tokens: t, baseTokens: bt } = useTheme();

  const { isDisabled, getToggleProps } = useToggle({
    checked,
    defaultChecked,
    onChange,
    disabled,
    role,
  });

  const propGetterReturn = getToggleProps();
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);
  const isChecked = propGetterReturn.accessibility.checked === true;

  if (label) {
    rnAccessibility.accessibilityLabel = label;
  }

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
          justifyContent: "center",
          paddingVertical: bt.entropixSpacing2 as number,
          paddingHorizontal: bt.entropixSpacing3 as number,
          borderWidth: 1,
          borderColor: isChecked ? "transparent" : (t.entropixColorBorderDefault as string),
          borderRadius: bt.entropixRadiusMd as number,
          backgroundColor: isChecked
            ? (t.entropixColorActionPrimaryDefault as string)
            : (t.entropixColorBgPrimary as string),
        },
        isDisabled && { opacity: 0.5 },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text
          style={[
            {
              fontSize: bt.entropixFontSizeSm as number,
              fontWeight: "500",
              color: isChecked
                ? (t.entropixColorTextInverse as string)
                : (t.entropixColorTextPrimary as string),
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : children != null ? (
        children
      ) : (
        <Text
          style={{
            fontSize: bt.entropixFontSizeSm as number,
            fontWeight: "500",
            color: isChecked
              ? (t.entropixColorTextInverse as string)
              : (t.entropixColorTextPrimary as string),
          }}
        >
          {isChecked ? "On" : "Off"}
        </Text>
      )}
    </Pressable>
  );
}
