import React from "react";
import {
  Modal,
  View,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { usePopoverContext } from "./popover-context.js";
import { useTheme } from "../../theme/theme-context.js";
import type { PopoverPlacement } from "@entropix/core";

export interface PopoverContentProps {
  children?: React.ReactNode;
  /** Override content View style */
  style?: StyleProp<ViewStyle>;
  /** testID for testing */
  testID?: string;
}

/**
 * PopoverContent — renders popover content in a transparent Modal.
 *
 * Measures trigger position via triggerLayout and positions the content
 * View near the trigger based on placement prop.
 * Closes on backdrop press.
 */
export function PopoverContent({
  children,
  style,
  testID,
}: PopoverContentProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const { isOpen, close, triggerLayout, placement, offset } =
    usePopoverContext();

  const positionStyle = getPositionStyle(triggerLayout, placement, offset);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={close}
      supportedOrientations={["portrait", "landscape"]}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={close}
        accessibilityRole="none"
      >
        <View
          style={[
            {
              position: "absolute",
              ...positionStyle,
              backgroundColor: t.entropixColorBgPrimary as string,
              borderRadius: bt.entropixRadiusMd as number,
              padding: bt.entropixSpacing4 as number,
              borderWidth: 1,
              borderColor: t.entropixColorBorderDefault as string,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
              minWidth: 120,
            },
            style,
          ]}
          testID={testID}
          accessibilityRole="none"
          onStartShouldSetResponder={() => true}
        >
          {children}
        </View>
      </Pressable>
    </Modal>
  );
}

function getPositionStyle(
  layout: { x: number; y: number; width: number; height: number } | null,
  placement: PopoverPlacement,
  offset: number,
): { top?: number; left?: number } {
  if (!layout) {
    return { top: 100, left: 20 };
  }

  switch (placement) {
    case "top":
      return {
        top: layout.y - offset,
        left: layout.x,
      };
    case "bottom":
      return {
        top: layout.y + layout.height + offset,
        left: layout.x,
      };
    case "left":
      return {
        top: layout.y,
        left: layout.x - offset,
      };
    case "right":
      return {
        top: layout.y,
        left: layout.x + layout.width + offset,
      };
    default:
      return {
        top: layout.y + layout.height + offset,
        left: layout.x,
      };
  }
}
