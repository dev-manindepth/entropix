import React, { useCallback } from "react";
import {
  View,
  TextInput,
  Text,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useInput } from "@entropix/core";
import { mapAccessibilityToRN } from "../utils/map-accessibility-to-rn.js";
import { useTheme } from "../theme/theme-context.js";

export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps {
  /** Controlled value */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Called when the value changes */
  onChange?: (value: string) => void;
  /** Whether the textarea is disabled */
  disabled?: boolean;
  /** Whether the textarea is read-only */
  readOnly?: boolean;
  /** Whether the textarea is required */
  required?: boolean;
  /** Whether the textarea is in an invalid state */
  invalid?: boolean;
  /** Label text displayed above the textarea */
  label?: string;
  /** Helper text displayed below the textarea */
  helperText?: string;
  /** Error message displayed below the textarea when invalid */
  errorMessage?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Number of visible lines. Default: 4 */
  numberOfLines?: number;
  /** Size variant. Default: "md" */
  size?: TextareaSize;
  /** Override wrapper View style */
  style?: StyleProp<ViewStyle>;
  /** Override TextInput style */
  inputStyle?: StyleProp<TextStyle>;
  /** Override label and helper Text style */
  textStyle?: TextStyle;
  /** testID for testing */
  testID?: string;
}

/**
 * Textarea -- multiline text input with label, helper text, and error message.
 *
 * ```tsx
 * <Textarea
 *   label="Description"
 *   placeholder="Enter description..."
 *   numberOfLines={6}
 *   onChange={setDescription}
 * />
 * ```
 */
export function Textarea({
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
  numberOfLines = 4,
  size = "md",
  style,
  inputStyle,
  textStyle,
  testID,
}: TextareaProps) {
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
    type: "text",
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
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
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
            minHeight: numberOfLines * (sizeStyles.fontSize + 8),
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

function getSizeStyles(size: TextareaSize, bt: Record<string, unknown>) {
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
