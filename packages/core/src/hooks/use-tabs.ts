import { useCallback, useMemo } from "react";
import { useControllableState } from "./use-controllable-state.js";
import { useId } from "./use-id.js";
import { createKeyboardHandler } from "../utils/create-keyboard-handler.js";
import type { PropGetterReturn } from "../types/prop-getters.js";
import type { InteractionKeyMap } from "../types/interactions.js";

export interface UseTabsOptions {
  /** Controlled selected tab key */
  selectedKey?: string;
  /** Default selected tab key for uncontrolled mode */
  defaultSelectedKey?: string;
  /** Called when selected tab changes */
  onSelectedKeyChange?: (key: string) => void;
  /** Tab layout orientation. Affects arrow key direction. Default: "horizontal" */
  orientation?: "horizontal" | "vertical";
  /**
   * Activation mode:
   * - "automatic": tab is selected when focused (arrow keys select)
   * - "manual": tab is selected on Enter/Space only
   * Default: "automatic"
   */
  activationMode?: "automatic" | "manual";
  /** Whether all tabs are disabled */
  disabled?: boolean;
  /** Keys of individually disabled tabs */
  disabledKeys?: string[];
}

export interface UseTabsReturn {
  /** Currently selected tab key */
  selectedKey: string;
  /** Select a tab by key */
  select: (key: string) => void;
  /** Props for the tablist container */
  getTabListProps: () => PropGetterReturn;
  /** Props for an individual tab */
  getTabProps: (key: string) => PropGetterReturn;
  /** Props for a tab panel */
  getTabPanelProps: (key: string) => PropGetterReturn;
}

const HORIZONTAL_TAB_KEY_MAP: InteractionKeyMap = {
  ArrowLeft: "moveLeft",
  ArrowRight: "moveRight",
  Home: "moveStart",
  End: "moveEnd",
  Enter: "activate",
  " ": "activate",
};

const VERTICAL_TAB_KEY_MAP: InteractionKeyMap = {
  ArrowUp: "moveUp",
  ArrowDown: "moveDown",
  Home: "moveStart",
  End: "moveEnd",
  Enter: "activate",
  " ": "activate",
};

/**
 * Headless tabs hook.
 *
 * Manages tab selection state, generates ARIA-linked IDs, and provides
 * prop getters for tablist, tab, and tabpanel elements.
 */
export function useTabs(options: UseTabsOptions = {}): UseTabsReturn {
  const {
    selectedKey: controlledSelectedKey,
    defaultSelectedKey = "",
    onSelectedKeyChange,
    orientation = "horizontal",
    activationMode: _activationMode = "automatic",
    disabled = false,
    disabledKeys = [],
  } = options;

  const [selectedKey, setSelectedKey] = useControllableState<string>({
    value: controlledSelectedKey,
    defaultValue: defaultSelectedKey,
    onChange: onSelectedKeyChange,
  });

  const baseId = useId("tabs");

  const tabKeyboardConfig = useMemo(
    () =>
      createKeyboardHandler(
        orientation === "horizontal"
          ? HORIZONTAL_TAB_KEY_MAP
          : VERTICAL_TAB_KEY_MAP,
      ),
    [orientation],
  );

  const isTabDisabled = useCallback(
    (key: string) => disabled || disabledKeys.includes(key),
    [disabled, disabledKeys],
  );

  const select = useCallback(
    (key: string) => {
      if (!isTabDisabled(key)) {
        setSelectedKey(key);
      }
    },
    [isTabDisabled, setSelectedKey],
  );

  const getTabListProps = useCallback((): PropGetterReturn => {
    return {
      accessibility: {
        role: "tablist",
        orientation,
      },
    };
  }, [orientation]);

  const getTabProps = useCallback(
    (key: string): PropGetterReturn => {
      const isSelected = selectedKey === key;
      const isDisabled = isTabDisabled(key);

      return {
        accessibility: {
          role: "tab",
          selected: isSelected,
          controls: `${baseId}-panel-${key}`,
          disabled: isDisabled || undefined,
          tabIndex: isSelected ? 0 : -1,
        },
        keyboardConfig: isDisabled ? undefined : tabKeyboardConfig,
        onAction: isDisabled ? undefined : () => select(key),
      };
    },
    [selectedKey, baseId, isTabDisabled, tabKeyboardConfig, select],
  );

  const getTabPanelProps = useCallback(
    (key: string): PropGetterReturn => {
      const isSelected = selectedKey === key;

      return {
        accessibility: {
          role: "tabpanel",
          labelledBy: `${baseId}-tab-${key}`,
          tabIndex: 0,
          hidden: !isSelected || undefined,
        },
      };
    },
    [selectedKey, baseId],
  );

  return {
    selectedKey,
    select,
    getTabListProps,
    getTabProps,
    getTabPanelProps,
  };
}
