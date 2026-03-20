import React, { useCallback } from "react";
import {
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useButton } from "@entropix/core";
import { mapAccessibilityToRN } from "../utils/map-accessibility-to-rn.js";
import { useTheme } from "../theme/theme-context.js";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<PressableProps, "disabled" | "onPress" | "style" | "children"> {
  /** Called when the button is pressed */
  onPress?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Visual variant. Default: "primary" */
  variant?: ButtonVariant;
  /** Size. Default: "md" */
  size?: ButtonSize;
  /** Override container style */
  style?: StyleProp<ViewStyle>;
  /** Override label text style */
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

/**
 * Button — styled React Native button with variant and size support.
 *
 * ```tsx
 * <Button variant="primary" size="md" onPress={handlePress}>
 *   Save Changes
 * </Button>
 * ```
 */
export function Button({
  onPress,
  disabled,
  loading,
  variant = "primary",
  size = "md",
  style,
  textStyle,
  children,
  ...rest
}: ButtonProps) {
  const { tokens: t, baseTokens: bt } = useTheme();

  const { isDisabled, isLoading, getButtonProps } = useButton({
    disabled,
    loading,
    onPress,
    elementType: "div",
  });

  const propGetterReturn = getButtonProps();
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  const handlePress = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  const sizeStyles = getSizeStyle(size, bt);
  const variantStyles = getVariantStyle(variant, t);
  const labelColor = getVariantTextColor(variant, t);
  const isInactive = isDisabled || isLoading;

  return (
    <Pressable
      {...rnAccessibility}
      {...rest}
      disabled={isInactive}
      onPress={isInactive ? undefined : handlePress}
      style={[
        baseStyle,
        sizeStyles.container,
        variantStyles,
        isInactive && { opacity: 0.5 },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text
          style={[
            { color: labelColor, fontSize: sizeStyles.fontSize, fontWeight: "500" },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const baseStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
};

function getSizeStyle(size: ButtonSize, bt: Record<string, unknown>) {
  switch (size) {
    case "sm":
      return {
        container: {
          paddingVertical: bt.entropixSpacing1 as number,
          paddingHorizontal: bt.entropixSpacing3 as number,
          borderRadius: bt.entropixRadiusSm as number,
          gap: bt.entropixButtonGap as number,
        } as ViewStyle,
        fontSize: bt.entropixFontSizeXs as number,
      };
    case "lg":
      return {
        container: {
          paddingVertical: bt.entropixSpacing3 as number,
          paddingHorizontal: bt.entropixSpacing6 as number,
          borderRadius: bt.entropixRadiusLg as number,
          gap: bt.entropixButtonGap as number,
        } as ViewStyle,
        fontSize: bt.entropixFontSizeBase as number,
      };
    default:
      return {
        container: {
          paddingVertical: bt.entropixButtonPaddingY as number,
          paddingHorizontal: bt.entropixButtonPaddingX as number,
          borderRadius: bt.entropixButtonBorderRadius as number,
          gap: bt.entropixButtonGap as number,
        } as ViewStyle,
        fontSize: bt.entropixButtonFontSize as number,
      };
  }
}

function getVariantStyle(variant: ButtonVariant, t: Record<string, unknown>): ViewStyle {
  switch (variant) {
    case "primary":
      return { backgroundColor: t.entropixButtonPrimaryBg as string, borderWidth: 1, borderColor: t.entropixButtonPrimaryBorder as string };
    case "secondary":
      return { backgroundColor: t.entropixButtonSecondaryBg as string, borderWidth: 1, borderColor: t.entropixButtonSecondaryBorder as string };
    case "outline":
      return { backgroundColor: "transparent", borderWidth: 1, borderColor: t.entropixColorBorderDefault as string };
    case "ghost":
      return { backgroundColor: "transparent", borderWidth: 1, borderColor: "transparent" };
    case "danger":
      return { backgroundColor: t.entropixButtonDangerBg as string, borderWidth: 1, borderColor: t.entropixButtonDangerBorder as string };
  }
}

function getVariantTextColor(variant: ButtonVariant, t: Record<string, unknown>): string {
  switch (variant) {
    case "primary": return t.entropixButtonPrimaryText as string;
    case "secondary": return t.entropixButtonSecondaryText as string;
    case "outline":
    case "ghost": return t.entropixColorTextPrimary as string;
    case "danger": return t.entropixButtonDangerText as string;
  }
}
