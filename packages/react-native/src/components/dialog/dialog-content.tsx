import React from "react";
import {
  Modal,
  View,
  type ViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useDialogContext } from "./dialog-context.js";
import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn.js";
import { useTheme } from "../../theme/theme-context.js";

export interface DialogContentProps extends Omit<ViewProps, "style"> {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Style for the inner card. */
  cardStyle?: StyleProp<ViewStyle>;
  /** Modal animation type. Default: "fade" */
  animationType?: "none" | "slide" | "fade";
  /** Whether the modal background is transparent. Default: true */
  transparent?: boolean;
}

/**
 * DialogContent — wraps children in RN's Modal component.
 *
 * Modal provides native focus trapping for screen readers.
 * onRequestClose handles Android back button (maps to core's "dismiss" intent).
 */
export function DialogContent({
  children,
  style,
  cardStyle,
  animationType = "fade",
  transparent = true,
  ...rest
}: DialogContentProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const { isOpen, close, ids, getContentProps } = useDialogContext();
  const propGetterReturn = getContentProps();
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  return (
    <Modal
      visible={isOpen}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={close}
      supportedOrientations={["portrait", "landscape"]}
    >
      <View
        {...rest}
        style={[
          {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          style,
        ]}
      >
        <View
          {...rnAccessibility}
          nativeID={ids.content}
          style={[
            {
              backgroundColor: t.entropixColorBgPrimary as string,
              borderRadius: bt.entropixRadiusLg as number,
              padding: bt.entropixSpacing6 as number,
              width: "90%",
              maxWidth: 480,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            },
            cardStyle,
          ]}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}
