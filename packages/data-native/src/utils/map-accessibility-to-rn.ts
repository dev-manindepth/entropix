import type { AccessibilityProps, AriaRole } from "@entropix/core";
import type { AccessibilityRole, AccessibilityState } from "react-native";
import type { RNAccessibilityProps } from "./types.js";

/**
 * Maps core AriaRole values to React Native AccessibilityRole equivalents.
 * Some roles have no direct RN equivalent and use the closest match.
 */
const RN_ROLE_MAP: Partial<Record<AriaRole, AccessibilityRole>> = {
  button: "button",
  checkbox: "checkbox",
  switch: "switch",
  dialog: "none", // Modal component handles dialog semantics
  alertdialog: "alert",
  link: "link",
  tab: "tab",
  tablist: "tablist",
  menu: "menu",
  menuitem: "menuitem",
  radio: "radio",
  radiogroup: "radiogroup",
  slider: "adjustable",
  spinbutton: "spinbutton",
  textbox: "text",
  combobox: "combobox",
  progressbar: "progressbar",
  alert: "alert",
  status: "text",
  tooltip: "text",
  none: "none",
  presentation: "none",
};

/**
 * Maps platform-neutral AccessibilityProps from @entropix/core
 * to React Native accessibility props.
 *
 * Key differences from the web adapter:
 * - Boolean states aggregated into accessibilityState object
 * - Value props aggregated into accessibilityValue object
 * - describedBy maps to accessibilityHint (closest RN equivalent)
 * - hidden maps to both iOS (accessibilityElementsHidden) and Android (importantForAccessibility)
 * - modal, hasPopup, controls, owns, tabIndex, pressed are silently dropped (no RN equivalent)
 */
export function mapAccessibilityToRN(
  props: AccessibilityProps,
): RNAccessibilityProps {
  const result: RNAccessibilityProps = { accessible: true };

  // Role mapping
  if (props.role) {
    result.accessibilityRole =
      RN_ROLE_MAP[props.role] ?? (props.role as AccessibilityRole);
  }

  // Label
  if (props.label) {
    result.accessibilityLabel = props.label;
  }

  // Hint (describedBy -> accessibilityHint)
  if (props.describedBy) {
    result.accessibilityHint = props.describedBy;
  }

  // LabelledBy (RN 0.71+)
  if (props.labelledBy) {
    result.accessibilityLabelledBy = props.labelledBy;
  }

  // Aggregate boolean states into accessibilityState
  const state: AccessibilityState = {};
  let hasState = false;

  if (props.disabled !== undefined) {
    state.disabled = props.disabled;
    hasState = true;
  }
  if (props.expanded !== undefined) {
    state.expanded = props.expanded;
    hasState = true;
  }
  if (props.selected !== undefined) {
    state.selected = props.selected;
    hasState = true;
  }
  if (props.checked !== undefined) {
    state.checked = props.checked;
    hasState = true;
  }
  if (props.busy !== undefined) {
    state.busy = props.busy;
    hasState = true;
  }
  // Note: props.pressed not supported by RN AccessibilityState

  if (hasState) {
    result.accessibilityState = state;
  }

  // Aggregate value props into accessibilityValue
  if (
    props.valueNow !== undefined ||
    props.valueMin !== undefined ||
    props.valueMax !== undefined ||
    props.valueText !== undefined
  ) {
    result.accessibilityValue = {};
    if (props.valueNow !== undefined)
      result.accessibilityValue.now = props.valueNow;
    if (props.valueMin !== undefined)
      result.accessibilityValue.min = props.valueMin;
    if (props.valueMax !== undefined)
      result.accessibilityValue.max = props.valueMax;
    if (props.valueText !== undefined)
      result.accessibilityValue.text = props.valueText;
  }

  // Live region
  if (props.live) {
    result.accessibilityLiveRegion =
      props.live === "off" ? "none" : props.live;
  }

  // Hidden -- dual platform coverage (iOS + Android)
  if (props.hidden) {
    result.accessibilityElementsHidden = true;
    result.importantForAccessibility = "no-hide-descendants";
  }

  // Required and invalid -- no direct RN state equivalents.
  // Silently dropped (component layers can handle via labels or hints).
  // required (no RN AccessibilityState equivalent)
  // invalid (no RN AccessibilityState equivalent)

  // Silently dropped -- no RN equivalent:
  // modal (handled by <Modal> component)
  // hasPopup, controls, owns (not supported in RN)
  // tabIndex (not applicable in RN)
  // pressed (not in RN AccessibilityState)

  return result;
}
