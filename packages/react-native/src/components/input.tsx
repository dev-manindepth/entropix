import React, { useCallback } from "react";
import {
  View,
  TextInput,
  Text,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type KeyboardTypeOptions,
} from "react-native";
import { useInput, type UseInputOptions } from "@entropix/core";
import { mapAccessibilityToRN } from "../utils/map-accessibility-to-rn.js";
import { useTheme } from "../theme/theme-context.js";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps {
  /** Controlled value */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Called when the value changes */
  onChange?: (value: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is read-only */
  readOnly?: boolean;
  /** Whether the input is required */
  required?: boolean;
  /** Whether the input is in an invalid state */
  invalid?: boolean;
  /** Label text displayed above the input */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message displayed below the input when invalid */
  errorMessage?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Input type — maps to React Native keyboardType */
  type?: UseInputOptions["type"];
  /** Size variant. Default: "md" */
  size?: InputSize;
  /** Override wrapper View style */
  style?: StyleProp<ViewStyle>;
  /** Override TextInput style */
  inputStyle?: StyleProp<TextStyle>;
  /** Override label and helper Text style */
  textStyle?: TextStyle;
  /** testID for testing */
  testID?: string;
}

const KEYBOARD_TYPE_MAP: Record<
  NonNullable<UseInputOptions["type"]>,
  KeyboardTypeOptions
> = {
  text: "default",
  email: "email-address",
  password: "default",
  number: "numeric",
  tel: "phone-pad",
  url: "url",
  search: "default",
};

/**
 * Input -- styled text input with label, helper text, and error message.
 *
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="you@example.com"
 *   type="email"
 *   onChange={setEmail}
 * />
 * ```
 */
export function Input({
  value,
  defaultValue,
  onChange,
  disabled,
  readOnly,
  required,
  invalid,
  label,
  helperText,
  errorMessage,
  placeholder,
  type = "text",
  size = "md",
  style,
  inputStyle,
  textStyle,
  testID,
}: InputProps) {
  const { tokens: t, baseTokens: bt } = useTheme();

  const {
    value: inputValue,
    isDisabled,
    isReadOnly,
    isInvalid,
    setValue,
    getInputProps,
  } = useInput({
    value,
    defaultValue,
    onChange,
    disabled,
    readOnly,
    required,
    invalid,
    type,
    placeholder,
  });

  const propGetterReturn = getInputProps();
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  const handleChangeText = useCallback(
    (text: string) => {
      setValue(text);
    },
    [setValue],
  );

  const sizeStyles = getSizeStyles(size, bt);
  const showError = isInvalid && errorMessage;

  return (
    <View style={[{ gap: bt.entropixSpacing1 as number }, style]}>
      {label ? (
        <Text
          style={[
            {
              fontSize: sizeStyles.labelFontSize,
              fontWeight: "500",
              color: t.entropixColorTextPrimary as string,
            },
            textStyle,
          ]}
        >
          {label}
          {required ? " *" : ""}
        </Text>
      ) : null}

      <TextInput
        {...rnAccessibility}
        testID={testID}
        value={inputValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.entropixColorTextTertiary as string}
        editable={!isDisabled && !isReadOnly}
        secureTextEntry={type === "password"}
        keyboardType={KEYBOARD_TYPE_MAP[type] ?? "default"}
        style={[
          {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            fontSize: sizeStyles.fontSize,
            borderWidth: 1,
            borderColor: showError
              ? (t.entropixColorBorderDanger as string)
              : (t.entropixColorBorderDefault as string),
            borderRadius: bt.entropixRadiusMd as number,
            backgroundColor: t.entropixColorBgPrimary as string,
            color: t.entropixColorTextPrimary as string,
          },
          isDisabled && { opacity: 0.5 },
          inputStyle,
        ]}
      />

      {showError ? (
        <Text
          style={[
            {
              fontSize: sizeStyles.helperFontSize,
              color: t.entropixColorTextDanger as string,
            },
            textStyle,
          ]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {errorMessage}
        </Text>
      ) : helperText ? (
        <Text
          style={[
            {
              fontSize: sizeStyles.helperFontSize,
              color: t.entropixColorTextSecondary as string,
            },
            textStyle,
          ]}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

function getSizeStyles(size: InputSize, bt: Record<string, unknown>) {
  switch (size) {
    case "sm":
      return {
        paddingVertical: bt.entropixSpacing1 as number,
        paddingHorizontal: bt.entropixSpacing2 as number,
        fontSize: bt.entropixFontSizeXs as number,
        labelFontSize: bt.entropixFontSizeXs as number,
        helperFontSize: (bt.entropixFontSizeXs as number) - 1,
      };
    case "lg":
      return {
        paddingVertical: bt.entropixSpacing3 as number,
        paddingHorizontal: bt.entropixSpacing4 as number,
        fontSize: bt.entropixFontSizeBase as number,
        labelFontSize: bt.entropixFontSizeBase as number,
        helperFontSize: bt.entropixFontSizeSm as number,
      };
    default:
      return {
        paddingVertical: bt.entropixSpacing2 as number,
        paddingHorizontal: bt.entropixSpacing3 as number,
        fontSize: bt.entropixFontSizeSm as number,
        labelFontSize: bt.entropixFontSizeSm as number,
        helperFontSize: bt.entropixFontSizeXs as number,
      };
  }
}
