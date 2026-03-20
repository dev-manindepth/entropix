import { useCallback, useMemo } from "react";
import { useControllableState } from "./use-controllable-state.js";
import { useId } from "./use-id.js";
import { createKeyboardHandler } from "../utils/create-keyboard-handler.js";
import type { PropGetterReturn } from "../types/prop-getters.js";
import type { InteractionKeyMap } from "../types/interactions.js";

export interface UseAccordionOptions {
  /** Controlled expanded keys */
  expandedKeys?: string[];
  /** Default expanded keys for uncontrolled mode */
  defaultExpandedKeys?: string[];
  /** Called when expanded keys change */
  onExpandedKeysChange?: (keys: string[]) => void;
  /** Allow multiple items expanded simultaneously. Default: false */
  allowMultiple?: boolean;
  /** Allow all items to be collapsed. Default: true */
  collapsible?: boolean;
  /** Whether all items are disabled */
  disabled?: boolean;
}

export interface UseAccordionReturn {
  /** Currently expanded item keys */
  expandedKeys: string[];
  /** Check if a specific item is expanded */
  isExpanded: (key: string) => boolean;
  /** Toggle an item's expanded state */
  toggle: (key: string) => void;
  /** Expand a specific item */
  expand: (key: string) => void;
  /** Collapse a specific item */
  collapse: (key: string) => void;
  /** Props for an item's trigger element */
  getItemTriggerProps: (key: string) => PropGetterReturn;
  /** Props for an item's panel element */
  getItemPanelProps: (key: string) => PropGetterReturn;
}

const ACCORDION_TRIGGER_KEY_MAP: InteractionKeyMap = {
  ArrowDown: "moveDown",
  ArrowUp: "moveUp",
  Home: "moveStart",
  End: "moveEnd",
  Enter: "activate",
  " ": "activate",
};

/**
 * Headless accordion hook.
 *
 * Manages expand/collapse state for multiple items with support for
 * single-expand or multi-expand modes. Provides prop getters for
 * trigger and panel elements with proper ARIA linking.
 */
export function useAccordion(
  options: UseAccordionOptions = {},
): UseAccordionReturn {
  const {
    expandedKeys: controlledExpandedKeys,
    defaultExpandedKeys = [],
    onExpandedKeysChange,
    allowMultiple = false,
    collapsible = true,
    disabled = false,
  } = options;

  const [expandedKeys, setExpandedKeys] = useControllableState<string[]>({
    value: controlledExpandedKeys,
    defaultValue: defaultExpandedKeys,
    onChange: onExpandedKeysChange,
  });

  const baseId = useId("accordion");

  const keyboardConfig = useMemo(
    () => createKeyboardHandler(ACCORDION_TRIGGER_KEY_MAP),
    [],
  );

  const isExpanded = useCallback(
    (key: string) => expandedKeys.includes(key),
    [expandedKeys],
  );

  const expand = useCallback(
    (key: string) => {
      if (disabled) return;
      if (allowMultiple) {
        if (!expandedKeys.includes(key)) {
          setExpandedKeys([...expandedKeys, key]);
        }
      } else {
        setExpandedKeys([key]);
      }
    },
    [disabled, allowMultiple, expandedKeys, setExpandedKeys],
  );

  const collapse = useCallback(
    (key: string) => {
      if (disabled) return;
      if (!collapsible && expandedKeys.length === 1 && expandedKeys[0] === key) {
        return; // Can't collapse the last item when not collapsible
      }
      setExpandedKeys(expandedKeys.filter((k) => k !== key));
    },
    [disabled, collapsible, expandedKeys, setExpandedKeys],
  );

  const toggle = useCallback(
    (key: string) => {
      if (isExpanded(key)) {
        collapse(key);
      } else {
        expand(key);
      }
    },
    [isExpanded, expand, collapse],
  );

  const getItemTriggerProps = useCallback(
    (key: string): PropGetterReturn => {
      return {
        accessibility: {
          role: "button",
          expanded: isExpanded(key),
          controls: `${baseId}-panel-${key}`,
          disabled: disabled || undefined,
        },
        keyboardConfig: disabled ? undefined : keyboardConfig,
        onAction: disabled ? undefined : () => toggle(key),
      };
    },
    [baseId, isExpanded, disabled, keyboardConfig, toggle],
  );

  const getItemPanelProps = useCallback(
    (key: string): PropGetterReturn => {
      return {
        accessibility: {
          role: "region",
          labelledBy: `${baseId}-trigger-${key}`,
          hidden: !isExpanded(key) || undefined,
        },
      };
    },
    [baseId, isExpanded],
  );

  return {
    expandedKeys,
    isExpanded,
    toggle,
    expand,
    collapse,
    getItemTriggerProps,
    getItemPanelProps,
  };
}
