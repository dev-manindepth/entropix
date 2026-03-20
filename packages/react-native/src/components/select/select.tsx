import React from "react";
import { View, Text, type StyleProp, type ViewStyle, type TextStyle } from "react-native";
import { useSelect, type UseSelectOptions } from "@entropix/core";
import { useTheme } from "../../theme/theme-context.js";
import { SelectContext } from "./select-context.js";

export interface SelectProps extends UseSelectOptions {
  /** Label text displayed above the select */
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
 * Select -- compound component root that provides select state via context.
 *
 * ```tsx
 * <Select label="Country" onChange={setCountry} placeholder="Choose...">
 *   <SelectTrigger />
 *   <SelectContent>
 *     <SelectOption value="us">United States</SelectOption>
 *     <SelectOption value="ca">Canada</SelectOption>
 *   </SelectContent>
 * </Select>
 * ```
 */
export function Select({
  label,
  style,
  textStyle,
  children,
  testID,
  ...options
}: SelectProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const select = useSelect(options);

  return (
    <SelectContext.Provider value={select}>
      <View
        testID={testID}
        style={[{ gap: bt.entropixSpacing1 as number }, style]}
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
    </SelectContext.Provider>
  );
}
