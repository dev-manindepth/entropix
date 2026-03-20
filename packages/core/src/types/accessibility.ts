/**
 * Platform-neutral ARIA role subset relevant to the design system.
 * Platform layers map these to appropriate native equivalents:
 * - Web: HTML role attribute
 * - React Native: accessibilityRole
 */
export type AriaRole =
  | "button"
  | "checkbox"
  | "dialog"
  | "switch"
  | "link"
  | "tab"
  | "tabpanel"
  | "tablist"
  | "menu"
  | "menuitem"
  | "menuitemcheckbox"
  | "menuitemradio"
  | "option"
  | "radio"
  | "radiogroup"
  | "slider"
  | "spinbutton"
  | "textbox"
  | "combobox"
  | "listbox"
  | "alert"
  | "alertdialog"
  | "status"
  | "tooltip"
  | "progressbar"
  | "region"
  | "none"
  | "presentation";

/** Live region politeness */
export type AriaLive = "off" | "polite" | "assertive";

/** HasPopup values */
export type AriaHasPopup =
  | boolean
  | "menu"
  | "listbox"
  | "tree"
  | "grid"
  | "dialog";

/**
 * Platform-neutral accessibility contract.
 *
 * Platform layers map these to the appropriate native attributes:
 * - Web: aria-label, aria-expanded, aria-checked, etc.
 * - React Native: accessibilityRole, accessibilityState, accessibilityLabel, etc.
 *
 * The core never produces platform-specific attributes — only these
 * neutral declarations that platform adapters translate.
 */
export interface AccessibilityProps {
  /** Semantic role */
  role?: AriaRole;
  /** Human-readable label */
  label?: string;
  /** ID of element that labels this element */
  labelledBy?: string;
  /** ID of element that describes this element */
  describedBy?: string;
  /** Whether the element is disabled */
  disabled?: boolean;
  /** Whether the element is expanded (for disclosure widgets) */
  expanded?: boolean;
  /** Whether the element is selected */
  selected?: boolean;
  /** Whether the element is checked (for checkboxes/switches) */
  checked?: boolean | "mixed";
  /** Whether the element is pressed (for toggle buttons) */
  pressed?: boolean | "mixed";
  /** Whether the element is busy/loading */
  busy?: boolean;
  /** Whether the element is modal */
  modal?: boolean;
  /** Whether the element has a popup */
  hasPopup?: AriaHasPopup;
  /** ID of controlled element */
  controls?: string;
  /** ID of owned elements */
  owns?: string;
  /** Live region politeness */
  live?: AriaLive;
  /** Orientation of the element (for tablists, sliders, etc.) */
  orientation?: "horizontal" | "vertical";
  /** Tab ordering */
  tabIndex?: number;
  /** Whether the element is required */
  required?: boolean;
  /** Whether the element is in an invalid state */
  invalid?: boolean;
  /** Whether element is hidden from accessibility tree */
  hidden?: boolean;
  /** Current value for range widgets */
  valueNow?: number;
  valueMin?: number;
  valueMax?: number;
  valueText?: string;
}
