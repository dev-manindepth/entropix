import { useCallback, useMemo } from "react";
import { useControllableState } from "./use-controllable-state.js";
import { useIds } from "./use-id.js";
import { createKeyboardHandler } from "../utils/create-keyboard-handler.js";
import type { PropGetterReturn } from "../types/prop-getters.js";
import type { InteractionKeyMap } from "../types/interactions.js";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";
export type PopoverTriggerMode = "click" | "hover";

export interface UsePopoverOptions {
  /** Controlled open state */
  isOpen?: boolean;
  /** Default open state for uncontrolled mode */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Preferred placement relative to trigger. Default: "bottom" */
  placement?: PopoverPlacement;
  /** How the popover is triggered. Default: "click" */
  trigger?: PopoverTriggerMode;
  /** ARIA role for the content. Default: "dialog" */
  role?: "dialog" | "tooltip";
  /** Offset distance in px from the trigger. Default: 8 */
  offset?: number;
}

export interface UsePopoverReturn {
  /** Current open state */
  isOpen: boolean;
  /** Open the popover */
  open: () => void;
  /** Close the popover */
  close: () => void;
  /** Toggle the popover */
  toggle: () => void;
  /** Current placement */
  placement: PopoverPlacement;
  /** Current trigger mode */
  trigger: PopoverTriggerMode;
  /** Offset from trigger */
  offset: number;
  /** Props for the trigger element */
  getTriggerProps: () => PropGetterReturn;
  /** Props for the popover content */
  getContentProps: () => PropGetterReturn;
}

const POPOVER_KEY_MAP: InteractionKeyMap = {
  Escape: "dismiss",
};

/**
 * Headless popover hook.
 *
 * Manages open/close state for popovers and tooltips with support for
 * click and hover trigger modes. Generates ARIA-linked IDs and provides
 * prop getters for trigger and content elements.
 */
export function usePopover(
  options: UsePopoverOptions = {},
): UsePopoverReturn {
  const {
    isOpen: controlledIsOpen,
    defaultOpen = false,
    onOpenChange,
    placement = "bottom",
    trigger = "click",
    role = "dialog",
    offset = 8,
  } = options;

  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: controlledIsOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const popoverIds = useIds("popover", "trigger", "content");

  const ids = {
    base: popoverIds["base"]!,
    trigger: popoverIds["trigger"]!,
    content: popoverIds["content"]!,
  };

  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const toggle = useCallback(
    () => setIsOpen((prev: boolean) => !prev),
    [setIsOpen],
  );

  const contentKeyboardConfig = useMemo(
    () => createKeyboardHandler(POPOVER_KEY_MAP),
    [],
  );

  const getTriggerProps = useCallback((): PropGetterReturn => {
    const baseProps: PropGetterReturn = {
      accessibility: {
        expanded: isOpen,
        hasPopup: role === "tooltip" ? false : "dialog",
        controls: isOpen ? ids.content : undefined,
      },
    };

    if (trigger === "click") {
      baseProps.onAction = toggle;
    }
    // For hover mode, the platform layer reads trigger mode and
    // wires up onMouseEnter/onMouseLeave. The core provides the
    // open/close callbacks and a hoverIntent declaration.

    return baseProps;
  }, [isOpen, ids.content, role, trigger, toggle]);

  const getContentProps = useCallback((): PropGetterReturn => {
    return {
      accessibility: {
        role: role === "tooltip" ? "tooltip" : "dialog",
        labelledBy: ids.trigger,
      },
      keyboardConfig: isOpen ? contentKeyboardConfig : undefined,
    };
  }, [role, ids.trigger, isOpen, contentKeyboardConfig]);

  return {
    isOpen,
    open,
    close,
    toggle,
    placement,
    trigger,
    offset,
    getTriggerProps,
    getContentProps,
  };
}
