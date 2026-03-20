import { useCallback, useMemo, useState } from "react";
import { useControllableState } from "./use-controllable-state.js";
import { useIds } from "./use-id.js";
import { createKeyboardHandler } from "../utils/create-keyboard-handler.js";
import type { PropGetterReturn } from "../types/prop-getters.js";
import type { InteractionKeyMap } from "../types/interactions.js";

export interface UseSelectOptions {
  /** Controlled selected value */
  value?: string;
  /** Default selected value for uncontrolled mode */
  defaultValue?: string;
  /** Called when the selected value changes */
  onChange?: (value: string) => void;
  /** Controlled open state */
  isOpen?: boolean;
  /** Default open state for uncontrolled mode */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Arrow keys wrap around when reaching start/end. Default: true */
  loop?: boolean;
}

/**
 * Focus management intent declarations for the select.
 * Platform layers read these to implement actual focus behavior.
 */
export interface SelectFocusIntent {
  /** Focus the first option when the listbox opens */
  autoFocusFirst: boolean;
  /** Restore focus to the trigger when the listbox closes */
  restoreFocus: boolean;
}

export interface UseSelectReturn {
  /** Currently selected value */
  selectedValue: string;
  /** Current open state */
  isOpen: boolean;
  /** Index of the currently active (focused) option. -1 when no option is active */
  activeIndex: number;
  /** Whether the select is disabled */
  isDisabled: boolean;
  /** Open the listbox */
  open: () => void;
  /** Close the listbox */
  close: () => void;
  /** Toggle the listbox */
  toggle: () => void;
  /** Set the active option index */
  setActiveIndex: (index: number) => void;
  /** Focus management intent for the platform layer */
  focusIntent: SelectFocusIntent;
  /** Props for the trigger element */
  getTriggerProps: () => PropGetterReturn;
  /** Props for the listbox element */
  getListboxProps: () => PropGetterReturn;
  /** Props for an option element */
  getOptionProps: (
    value: string,
    index: number,
    options?: { disabled?: boolean },
  ) => PropGetterReturn;
  /** Props for the label element */
  getLabelProps: () => { id: string; htmlFor: string };
}

const SELECT_TRIGGER_KEY_MAP: InteractionKeyMap = {
  Enter: "activate",
  " ": "activate",
  ArrowDown: "moveDown",
};

const SELECT_LISTBOX_KEY_MAP: InteractionKeyMap = {
  ArrowDown: "moveDown",
  ArrowUp: "moveUp",
  Escape: "dismiss",
  Enter: "activate",
  " ": "activate",
};

/**
 * Headless select hook.
 *
 * Manages open/close state, selected value, and active option index
 * for dropdown select patterns. Provides prop getters for trigger,
 * listbox, options, and label with full ARIA support and keyboard
 * navigation intents.
 */
export function useSelect(options: UseSelectOptions = {}): UseSelectReturn {
  const {
    value: controlledValue,
    defaultValue = "",
    onChange,
    isOpen: controlledIsOpen,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
  } = options;

  const [selectedValue, setSelectedValue] = useControllableState<string>({
    value: controlledValue,
    defaultValue,
    onChange,
  });

  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: controlledIsOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const selectIds = useIds("select", "trigger", "listbox", "label");

  const ids = {
    trigger: selectIds["trigger"]!,
    listbox: selectIds["listbox"]!,
    label: selectIds["label"]!,
  };

  const open = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      setActiveIndex(0);
    }
  }, [disabled, setIsOpen]);

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
    () => createKeyboardHandler(SELECT_TRIGGER_KEY_MAP),
    [],
  );

  const listboxKeyboardConfig = useMemo(
    () => createKeyboardHandler(SELECT_LISTBOX_KEY_MAP),
    [],
  );

  const focusIntent: SelectFocusIntent = {
    autoFocusFirst: true,
    restoreFocus: true,
  };

  const getTriggerProps = useCallback((): PropGetterReturn => {
    return {
      accessibility: {
        role: "combobox",
        expanded: isOpen,
        hasPopup: "listbox",
        controls: isOpen ? ids.listbox : undefined,
        disabled: disabled || undefined,
        tabIndex: disabled ? -1 : 0,
      },
      keyboardConfig: disabled ? undefined : triggerKeyboardConfig,
      onAction: disabled ? undefined : toggle,
    };
  }, [isOpen, ids.listbox, disabled, triggerKeyboardConfig, toggle]);

  const getListboxProps = useCallback((): PropGetterReturn => {
    return {
      accessibility: {
        role: "listbox",
        labelledBy: ids.trigger,
      },
      keyboardConfig: isOpen ? listboxKeyboardConfig : undefined,
    };
  }, [isOpen, ids.trigger, listboxKeyboardConfig]);

  const getOptionProps = useCallback(
    (
      value: string,
      index: number,
      opts?: { disabled?: boolean },
    ): PropGetterReturn => {
      const isDisabled = opts?.disabled ?? false;
      const isSelected = value === selectedValue;

      return {
        accessibility: {
          role: "option",
          selected: isSelected,
          disabled: isDisabled || undefined,
          tabIndex: activeIndex === index ? 0 : -1,
        },
        onAction: isDisabled
          ? undefined
          : () => {
              setSelectedValue(value);
              close();
            },
      };
    },
    [selectedValue, activeIndex, setSelectedValue, close],
  );

  const getLabelProps = useCallback(() => {
    return {
      id: ids.label,
      htmlFor: ids.trigger,
    };
  }, [ids.label, ids.trigger]);

  return {
    selectedValue,
    isOpen,
    activeIndex,
    isDisabled: disabled,
    open,
    close,
    toggle,
    setActiveIndex,
    focusIntent,
    getTriggerProps,
    getListboxProps,
    getOptionProps,
    getLabelProps,
  };
}
