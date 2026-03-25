import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useTheme } from "../../theme/theme-context.js";
import type { PopoverPlacement } from "@entropix/core";

export interface TooltipProps {
  /** Tooltip text content */
  content: string;
  /** Trigger element */
  children: React.ReactNode;
  /** Placement relative to trigger. Default: "top" */
  placement?: PopoverPlacement;
  /** Override tooltip container style */
  style?: StyleProp<ViewStyle>;
  /** Override tooltip text style */
  textStyle?: TextStyle;
  /** testID for testing */
  testID?: string;
}

/**
 * Tooltip — simplified popover that shows on long press.
 *
 * Renders a dark background tooltip near the trigger element.
 * Dismisses on backdrop press.
 */
export function Tooltip({
  content,
  children,
  placement = "top",
  style,
  textStyle,
  testID,
}: TooltipProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<View>(null);
  const [triggerLayout, setTriggerLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const handleLongPress = useCallback(() => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          setTriggerLayout({ x, y, width, height });
          setIsVisible(true);
        },
      );
    } else {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  const positionStyle = getTooltipPosition(triggerLayout, placement);

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={handleLongPress}
        onLongPress={handleLongPress}
        testID={testID}
      >
        {children}
      </Pressable>
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}
        supportedOrientations={["portrait", "landscape"]}
      >
        <Pressable style={{ flex: 1 }} onPress={handleDismiss}>
          <View
            style={[
              {
                position: "absolute",
                ...positionStyle,
                backgroundColor: t.entropixColorBgInverse as string,
                borderRadius: bt.entropixRadiusSm as number,
                paddingVertical: bt.entropixSpacing1 as number,
                paddingHorizontal: bt.entropixSpacing2 as number,
                maxWidth: 240,
              },
              style,
            ]}
            accessibilityRole="text"
          >
            <Text
              style={[
                {
                  fontSize: bt.entropixFontSizeXs as number,
                  color: t.entropixColorTextInverse as string,
                  fontWeight: "500",
                },
                textStyle,
              ]}
            >
              {content}
            </Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function getTooltipPosition(
  layout: { x: number; y: number; width: number; height: number } | null,
  placement: PopoverPlacement,
): { top?: number; left?: number } {
  if (!layout) {
    return { top: 100, left: 20 };
  }

  const tooltipOffset = 6;

  switch (placement) {
    case "top":
      return {
        top: layout.y - tooltipOffset - 28,
        left: layout.x,
      };
    case "bottom":
      return {
        top: layout.y + layout.height + tooltipOffset,
        left: layout.x,
      };
    case "left":
      return {
        top: layout.y,
        left: layout.x - tooltipOffset,
      };
    case "right":
      return {
        top: layout.y,
        left: layout.x + layout.width + tooltipOffset,
      };
    default:
      return {
        top: layout.y - tooltipOffset - 28,
        left: layout.x,
      };
  }
}
