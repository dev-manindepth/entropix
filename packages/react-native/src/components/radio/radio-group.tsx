import React from "react";
import { View, Text, type StyleProp, type ViewStyle, type TextStyle } from "react-native";
import { useRadioGroup, type UseRadioGroupOptions } from "@entropix/core";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { useTheme } from "../../theme/theme-context.js";
import { RadioGroupContext } from "./radio-context.js";

export interface RadioGroupProps extends UseRadioGroupOptions {
  /** Label text for the radio group */
  label?: string;
  /** Override wrapper View style */
  style?: StyleProp<ViewStyle>;
  /** Override label text style */
  textStyle?: TextStyle;
  children: React.ReactNode;
  /** testID for testing */
  testID?: string;
}

/**
 * RadioGroup -- container for RadioItem components.
 *
 * Provides radio group state via context. All RadioItem children
 * share the same selection state.
 *
 * ```tsx
 * <RadioGroup label="Color" onChange={setColor} defaultValue="red">
 *   <RadioItem value="red">Red</RadioItem>
 *   <RadioItem value="blue">Blue</RadioItem>
 * </RadioGroup>
 * ```
 */
export function RadioGroup({
  label,
  style,
  textStyle,
  children,
  testID,
  ...options
}: RadioGroupProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const radioGroup = useRadioGroup(options);
  const propGetterReturn = radioGroup.getRadioGroupProps();
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  if (label) {
    rnAccessibility.accessibilityLabel = label;
  }

  return (
    <RadioGroupContext.Provider value={radioGroup}>
      <View
        {...rnAccessibility}
        testID={testID}
        style={[
          {
            gap: bt.entropixSpacing2 as number,
          },
          style,
        ]}
      >
        {label ? (
          <Text
            style={[
              {
                fontSize: bt.entropixFontSizeSm as number,
                fontWeight: "500",
                color: t.entropixColorTextPrimary as string,
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
        ) : null}
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
}
