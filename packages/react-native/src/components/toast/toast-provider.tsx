import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useToast, type ToastType } from "@entropix/core";
import { useTheme } from "../../theme/theme-context.js";
import { useLocale } from "../../i18n/i18n-context.js";
import { ToastContext } from "./toast-context.js";

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Auto-dismiss duration in ms. Set to 0 to disable. Default: 5000 */
  duration?: number;
  /** Maximum number of visible toasts. Default: 5 */
  maxToasts?: number;
  /** Override container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * ToastProvider — wraps children and renders toast notifications.
 *
 * Renders an absolute-positioned toast container at the bottom of the screen.
 * Each toast fades in and slides up on appearance.
 */
export function ToastProvider({
  children,
  duration = 5000,
  maxToasts = 5,
  style,
}: ToastProviderProps) {
  const { baseTokens: bt } = useTheme();
  const locale = useLocale();
  const toast = useToast({ maxToasts, defaultDuration: duration });

  const add = useCallback(
    (options: { message: string; type?: ToastType }): string => {
      return toast.add({ message: options.message, type: options.type ?? "info" });
    },
    [toast],
  );

  const contextValue = {
    toasts: toast.toasts,
    add,
    dismiss: toast.dismiss,
    dismissAll: toast.dismissAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <View
        style={[
          {
            position: "absolute",
            bottom: bt.entropixSpacing6 as number,
            left: bt.entropixSpacing4 as number,
            right: bt.entropixSpacing4 as number,
            alignItems: "center",
            gap: bt.entropixSpacing2 as number,
            pointerEvents: "box-none",
          },
          style,
        ]}
        accessibilityRole="none"
        accessibilityLiveRegion="polite"
        accessibilityLabel={locale.toast_regionLabel}
      >
        {toast.toasts.map((item) => (
          <ToastItem
            key={item.id}
            id={item.id}
            message={item.message}
            type={item.type}
            onDismiss={toast.dismiss}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

// ─── Internal toast item with animation ─────────────────────────────────────

interface ToastItemProps {
  id: string;
  message: string;
  type: ToastType;
  onDismiss: (id: string) => void;
}

function ToastItem({ id, message, type, onDismiss }: ToastItemProps) {
  const { tokens: t, baseTokens: bt } = useTheme();
  const locale = useLocale();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: bt.entropixDurationNormal as number,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: bt.entropixDurationNormal as number,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, bt]);

  const colors = getTypeColors(type, t);
  const icon = getTypeIcon(type);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.bg,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: bt.entropixRadiusMd as number,
          paddingVertical: bt.entropixSpacing3 as number,
          paddingHorizontal: bt.entropixSpacing4 as number,
          width: "100%",
          maxWidth: 400,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
          gap: bt.entropixSpacing2 as number,
        },
      ]}
      accessibilityRole="alert"
    >
      <Text
        style={{
          fontSize: bt.entropixFontSizeBase as number,
          color: colors.icon,
        }}
      >
        {icon}
      </Text>
      <Text
        style={{
          flex: 1,
          fontSize: bt.entropixFontSizeSm as number,
          color: t.entropixColorTextPrimary as string,
          fontWeight: "500",
        }}
        numberOfLines={3}
      >
        {message}
      </Text>
      <Pressable
        onPress={() => onDismiss(id)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={locale.toast_dismiss}
      >
        <Text
          style={{
            fontSize: bt.entropixFontSizeLg as number,
            color: t.entropixColorTextTertiary as string,
            fontWeight: "600",
          }}
        >
          {"\u00D7"}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function getTypeColors(
  type: ToastType,
  t: Record<string, unknown>,
): { bg: string; border: string; icon: string } {
  switch (type) {
    case "success":
      return {
        bg: t.entropixColorFeedbackBgSuccess as string,
        border: t.entropixColorFeedbackSuccess as string,
        icon: t.entropixColorFeedbackSuccess as string,
      };
    case "error":
      return {
        bg: t.entropixColorFeedbackBgError as string,
        border: t.entropixColorFeedbackError as string,
        icon: t.entropixColorFeedbackError as string,
      };
    case "warning":
      return {
        bg: t.entropixColorFeedbackBgWarning as string,
        border: t.entropixColorFeedbackWarning as string,
        icon: t.entropixColorFeedbackWarning as string,
      };
    case "info":
    default:
      return {
        bg: t.entropixColorFeedbackBgInfo as string,
        border: t.entropixColorFeedbackInfo as string,
        icon: t.entropixColorFeedbackInfo as string,
      };
  }
}

function getTypeIcon(type: ToastType): string {
  switch (type) {
    case "success":
      return "\u2713";
    case "error":
      return "\u2717";
    case "warning":
      return "\u26A0";
    case "info":
    default:
      return "\u2139";
  }
}
