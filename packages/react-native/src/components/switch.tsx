import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useToggle } from "@entropix/core";
import { mapAccessibilityToRN } from "../utils/map-accessibility-to-rn.js";
import { useTheme } from "../theme/theme-context.js";

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 24;
const TRACK_PADDING = 2;
const THUMB_SIZE = TRACK_HEIGHT - TRACK_PADDING * 2; // 20
const THUMB_TRAVEL = TRACK_WIDTH - TRACK_PADDING * 2 - THUMB_SIZE; // 20

export interface SwitchProps
  extends Omit<PressableProps, "disabled" | "onPress" | "style" | "children"> {
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state for uncontrolled mode */
  defaultChecked?: boolean;
  /** Called when checked state changes */
  onChange?: (checked: boolean) => void;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Accessible label */
  label?: string;
  /** Override track style */
  style?: StyleProp<ViewStyle>;
}

/**
 * Switch — styled toggle with track + sliding thumb.
 *
 * ```tsx
 * <Switch checked={isOn} onChange={setIsOn} label="Notifications" />
 * ```
 */
export function Switch({
  checked,
  defaultChecked,
  onChange,
  disabled,
  label,
  style,
  ...rest
}: SwitchProps) {
  const { tokens: t, baseTokens: bt } = useTheme();

  const { isDisabled, getToggleProps } = useToggle({
    checked,
    defaultChecked,
    onChange,
    disabled,
    role: "switch",
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

  // Animated thumb position
  const thumbAnim = useRef(
    new Animated.Value(defaultChecked || checked ? THUMB_TRAVEL : 0)
  ).current;

  useEffect(() => {
    Animated.timing(thumbAnim, {
      toValue: isChecked ? THUMB_TRAVEL : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isChecked, thumbAnim]);

  return (
    <Pressable
      {...rnAccessibility}
      {...rest}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : handlePress}
      style={[
        {
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: bt.entropixRadiusFull as number,
          backgroundColor: isChecked
            ? (t.entropixColorActionPrimaryDefault as string)
            : (t.entropixColorGray300 as string),
          padding: TRACK_PADDING,
          justifyContent: "center",
        },
        isDisabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: bt.entropixRadiusFull as number,
          backgroundColor: t.entropixColorWhite as string,
          transform: [{ translateX: thumbAnim }],
        }}
      />
    </Pressable>
  );
}
