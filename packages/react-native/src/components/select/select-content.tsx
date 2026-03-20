import React from "react";
import {
  Modal,
  View,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { useTheme } from "../../theme/theme-context.js";
import { useSelectContext } from "./select-context.js";

export interface SelectContentProps {
  children: React.ReactNode;
  /** Override listbox container style */
  style?: StyleProp<ViewStyle>;
  /** testID for testing */
  testID?: string;
}

/**
 * SelectContent -- the dropdown listbox rendered inside a Modal.
 *
 * Displays the option list when the select is open.
 * Tapping the overlay closes the select.
 */
export function SelectContent({ children, style, testID }: SelectContentProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const { isOpen, close, getListboxProps } = useSelectContext();
  const propGetterReturn = getListboxProps();
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
        onPress={close}
      >
        <Pressable
          onPress={() => {
            // Prevent overlay close when tapping inside the content
          }}
        >
          <View
            {...rnAccessibility}
            testID={testID}
            style={[
              {
                minWidth: 240,
                maxHeight: 300,
                padding: bt.entropixSpacing1 as number,
                backgroundColor: t.entropixColorBgPrimary as string,
                borderWidth: 1,
                borderColor: t.entropixColorBorderDefault as string,
                borderRadius: bt.entropixRadiusMd as number,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
              },
              style,
            ]}
          >
            {children}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
