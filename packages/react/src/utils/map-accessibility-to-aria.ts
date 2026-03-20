import type { AccessibilityProps } from "@entropix/core";

/**
 * Field-level mapping from AccessibilityProps keys to DOM attribute names.
 * `tabIndex` is not an aria-* attribute — it maps directly to `tabIndex`.
 */
const ARIA_MAP: Record<string, string> = {
  role: "role",
  label: "aria-label",
  labelledBy: "aria-labelledby",
  describedBy: "aria-describedby",
  disabled: "aria-disabled",
  expanded: "aria-expanded",
  selected: "aria-selected",
  checked: "aria-checked",
  pressed: "aria-pressed",
  busy: "aria-busy",
  modal: "aria-modal",
  hasPopup: "aria-haspopup",
  controls: "aria-controls",
  owns: "aria-owns",
  live: "aria-live",
  orientation: "aria-orientation",
  tabIndex: "tabIndex",
  hidden: "aria-hidden",
  valueNow: "aria-valuenow",
  valueMin: "aria-valuemin",
  valueMax: "aria-valuemax",
  valueText: "aria-valuetext",
};

/**
 * Maps platform-neutral AccessibilityProps from @entropix/core
 * to DOM-ready aria-* attributes.
 *
 * Filters out undefined values to keep rendered DOM clean.
 */
export function mapAccessibilityToAria(
  props: AccessibilityProps,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, attrName] of Object.entries(ARIA_MAP)) {
    const value = props[key as keyof AccessibilityProps];
    if (value !== undefined) {
      result[attrName] = value;
    }
  }

  return result;
}
