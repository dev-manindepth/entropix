import type { AccessibilityProps } from "./accessibility.js";
import type { KeyboardHandlerConfig } from "./interactions.js";

/**
 * Base return type for all prop getters.
 *
 * Contains accessibility declarations + keyboard config + action handler.
 * Platform layers spread these onto elements:
 * - Web: maps accessibility → aria-*, keyboardConfig → onKeyDown, onAction → onClick
 * - RN: maps accessibility → accessibilityState/Role, onAction → onPress
 */
export interface PropGetterReturn {
  /** Platform-neutral accessibility properties */
  accessibility: AccessibilityProps;
  /** Keyboard interaction configuration (platform layer maps to onKeyDown) */
  keyboardConfig?: KeyboardHandlerConfig;
  /**
   * Generic interaction handler — platform layer maps to onClick (web)
   * or onPress (native)
   */
  onAction?: () => void;
}

/**
 * A prop getter function. Takes optional overrides, returns prop declarations.
 */
export type PropGetter<TOverrides = Record<string, unknown>> = (
  overrides?: TOverrides,
) => PropGetterReturn;
