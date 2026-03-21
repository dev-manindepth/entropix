import type {
  AccessibilityRole,
  AccessibilityState,
  AccessibilityValue,
} from "react-native";

/**
 * The RN accessibility props that mapAccessibilityToRN produces.
 * These spread directly onto Pressable/View/Text components.
 */
export interface RNAccessibilityProps {
  accessible?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityLabelledBy?: string | string[];
  accessibilityState?: AccessibilityState;
  accessibilityValue?: AccessibilityValue;
  accessibilityLiveRegion?: "none" | "polite" | "assertive";
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: "auto" | "yes" | "no" | "no-hide-descendants";
}
