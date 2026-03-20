// === Types ===
export type {
  AccessibilityProps,
  AriaRole,
  AriaLive,
  AriaHasPopup,
} from "./types/accessibility.js";

export type {
  InteractionKeyMap,
  KeyIntent,
  PressEvent,
  KeyboardHandlerConfig,
} from "./types/interactions.js";

export type { PropGetter, PropGetterReturn } from "./types/prop-getters.js";

export type {
  MaybeFunction,
  CallbackFn,
  ControllableStateOptions,
} from "./types/shared.js";

// === Utilities ===
export { createKeyboardHandler } from "./utils/create-keyboard-handler.js";
export { mergeProps } from "./utils/merge-props.js";
export { callAllHandlers } from "./utils/call-all-handlers.js";

// === Hooks ===
export { useControllableState } from "./hooks/use-controllable-state.js";
export { useId, useIds } from "./hooks/use-id.js";

export { useButton } from "./hooks/use-button.js";
export type { UseButtonOptions, UseButtonReturn } from "./hooks/use-button.js";

export { useToggle } from "./hooks/use-toggle.js";
export type {
  UseToggleOptions,
  UseToggleReturn,
} from "./hooks/use-toggle.js";

export { useDialog } from "./hooks/use-dialog.js";
export type {
  UseDialogOptions,
  UseDialogReturn,
  FocusManagementIntent,
} from "./hooks/use-dialog.js";

export { useTabs } from "./hooks/use-tabs.js";
export type { UseTabsOptions, UseTabsReturn } from "./hooks/use-tabs.js";

export { useAccordion } from "./hooks/use-accordion.js";
export type {
  UseAccordionOptions,
  UseAccordionReturn,
} from "./hooks/use-accordion.js";

export { useMenu } from "./hooks/use-menu.js";
export type {
  UseMenuOptions,
  UseMenuReturn,
  MenuFocusIntent,
} from "./hooks/use-menu.js";

export { useInput } from "./hooks/use-input.js";
export type {
  UseInputOptions,
  UseInputReturn,
} from "./hooks/use-input.js";

export { useRadioGroup } from "./hooks/use-radio-group.js";
export type {
  UseRadioGroupOptions,
  UseRadioGroupReturn,
} from "./hooks/use-radio-group.js";

export { useSelect } from "./hooks/use-select.js";
export type {
  UseSelectOptions,
  UseSelectReturn,
  SelectFocusIntent,
} from "./hooks/use-select.js";
