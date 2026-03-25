import React, { useCallback } from "react";
import {
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { usePopoverContext } from "./popover-context.js";

export interface PopoverTriggerProps {
  children: React.ReactNode;
  /** Override wrapper style */
  style?: StyleProp<ViewStyle>;
  /** testID for testing */
  testID?: string;
}

/**
 * PopoverTrigger — wraps children in a View with ref for measurement.
 *
 * For click trigger mode: wraps in Pressable with onPress.
 * For hover mode: uses onLongPress (mobile equivalent of hover).
 */
export function PopoverTrigger({
  children,
  style,
  testID,
}: PopoverTriggerProps) {
  const { toggle, open, triggerRef, setTriggerLayout, triggerMode } =
    usePopoverContext();

  const measureAndAct = useCallback(
    (action: () => void) => {
      if (triggerRef.current) {
        triggerRef.current.measureInWindow(
          (x: number, y: number, width: number, height: number) => {
            setTriggerLayout({ x, y, width, height });
            action();
          },
        );
      } else {
        action();
      }
    },
    [triggerRef, setTriggerLayout],
  );

  const handlePress = useCallback(() => {
    measureAndAct(toggle);
  }, [measureAndAct, toggle]);

  const handleLongPress = useCallback(() => {
    measureAndAct(open);
  }, [measureAndAct, open]);

  return (
    <Pressable
      ref={triggerRef}
      onPress={triggerMode === "click" ? handlePress : undefined}
      onLongPress={triggerMode === "hover" ? handleLongPress : undefined}
      style={style}
      testID={testID}
      accessibilityRole="button"
    >
      {children}
    </Pressable>
  );
}
