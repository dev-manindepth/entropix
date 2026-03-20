import { useCallback, useMemo, useState } from "react";
import { useControllableState } from "./use-controllable-state.js";
import { useIds } from "./use-id.js";
import { createKeyboardHandler } from "../utils/create-keyboard-handler.js";
import type { PropGetterReturn } from "../types/prop-getters.js";
import type { InteractionKeyMap } from "../types/interactions.js";

export interface UseMenuOptions {
  /** Controlled open state */
  isOpen?: boolean;
  /** Default open state for uncontrolled mode */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Close the menu after an item is selected. Default: true */
  closeOnSelect?: boolean;
  /** Arrow keys wrap around when reaching start/end. Default: true */
  loop?: boolean;
}

/**
 * Focus management intent declarations for the menu.
 * Platform layers read these to implement actual focus behavior.
 */
export interface MenuFocusIntent {
  /** Focus the first item when the menu opens */
  autoFocusFirst: boolean;
  /** Restore focus to the trigger when the menu closes */
  restoreFocus: boolean;
}

export interface UseMenuReturn {
  /** Current open state */
  isOpen: boolean;
  /** Index of the currently active (focused) item. -1 when no item is active */
  activeIndex: number;
  /** Open the menu */
  open: () => void;
  /** Close the menu */
  close: () => void;
  /** Toggle the menu */
  toggle: () => void;
  /** Set the active item index */
  setActiveIndex: (index: number) => void;
  /** Focus management intent for the platform layer */
  focusIntent: MenuFocusIntent;
  /** Props for the trigger element */
  getTriggerProps: () => PropGetterReturn;
  /** Props for the menu container */
  getMenuProps: () => PropGetterReturn;
  /** Props for a menu item */
  getItemProps: (
    index: number,
    options?: { onSelect?: () => void; disabled?: boolean },
  ) => PropGetterReturn;
}

const MENU_TRIGGER_KEY_MAP: InteractionKeyMap = {
  Enter: "activate",
  " ": "activate",
  ArrowDown: "moveDown",
  ArrowUp: "moveUp",
};

const MENU_CONTENT_KEY_MAP: InteractionKeyMap = {
  ArrowDown: "moveDown",
  ArrowUp: "moveUp",
  Home: "moveStart",
  End: "moveEnd",
  Escape: "dismiss",
  Enter: "activate",
  " ": "activate",
};

/**
 * Headless menu hook.
 *
 * Manages open/close state and active item index for dropdown menus.
 * Provides prop getters for trigger, menu container, and menu items
 * with full ARIA support and keyboard navigation intents.
 */
export function useMenu(options: UseMenuOptions = {}): UseMenuReturn {
  const {
    isOpen: controlledIsOpen,
    defaultOpen = false,
    onOpenChange,
    closeOnSelect = true,
  } = options;

  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: controlledIsOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const menuIds = useIds("menu", "trigger", "menu");

  const ids = {
    trigger: menuIds["trigger"]!,
    menu: menuIds["menu"]!,
    base: menuIds["base"]!,
  };

  const open = useCallback(() => {
    setIsOpen(true);
    setActiveIndex(0);
  }, [setIsOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, [setIsOpen]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const triggerKeyboardConfig = useMemo(
    () => createKeyboardHandler(MENU_TRIGGER_KEY_MAP),
    [],
  );

  const menuKeyboardConfig = useMemo(
    () => createKeyboardHandler(MENU_CONTENT_KEY_MAP),
    [],
  );

  const focusIntent: MenuFocusIntent = {
    autoFocusFirst: true,
    restoreFocus: true,
  };

  const getTriggerProps = useCallback((): PropGetterReturn => {
    return {
      accessibility: {
        role: "button",
        expanded: isOpen,
        hasPopup: "menu",
        controls: isOpen ? ids.menu : undefined,
      },
      keyboardConfig: triggerKeyboardConfig,
      onAction: toggle,
    };
  }, [isOpen, ids.menu, triggerKeyboardConfig, toggle]);

  const getMenuProps = useCallback((): PropGetterReturn => {
    return {
      accessibility: {
        role: "menu",
        labelledBy: ids.trigger,
      },
      keyboardConfig: isOpen ? menuKeyboardConfig : undefined,
    };
  }, [isOpen, ids.trigger, menuKeyboardConfig]);

  const getItemProps = useCallback(
    (
      index: number,
      opts?: { onSelect?: () => void; disabled?: boolean },
    ): PropGetterReturn => {
      const isDisabled = opts?.disabled ?? false;

      return {
        accessibility: {
          role: "menuitem",
          disabled: isDisabled || undefined,
          tabIndex: activeIndex === index ? 0 : -1,
        },
        onAction: isDisabled
          ? undefined
          : () => {
              opts?.onSelect?.();
              if (closeOnSelect) {
                close();
              }
            },
      };
    },
    [activeIndex, closeOnSelect, close],
  );

  return {
    isOpen,
    activeIndex,
    open,
    close,
    toggle,
    setActiveIndex,
    focusIntent,
    getTriggerProps,
    getMenuProps,
    getItemProps,
  };
}
