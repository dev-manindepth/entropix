import { useCallback, useMemo } from "react";
import { useControllableState } from "./use-controllable-state.js";
import { useIds } from "./use-id.js";
import { createKeyboardHandler } from "../utils/create-keyboard-handler.js";
import type { PropGetterReturn } from "../types/prop-getters.js";
import type { InteractionKeyMap } from "../types/interactions.js";

export interface UseDialogOptions {
  /** Controlled open state */
  isOpen?: boolean;
  /** Default open state for uncontrolled mode */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Whether clicking the overlay closes the dialog. Default: true */
  closeOnOverlayPress?: boolean;
  /** Whether pressing Escape closes the dialog. Default: true */
  closeOnEscape?: boolean;
  /** Whether the dialog is modal (traps focus, adds aria-modal). Default: true */
  modal?: boolean;
  /** Role override: "dialog" or "alertdialog". Default: "dialog" */
  role?: "dialog" | "alertdialog";
}

/**
 * Focus management intent declarations.
 * These are declarative — the platform layer reads them and
 * implements actual focus trapping/restoration using platform APIs.
 */
export interface FocusManagementIntent {
  /** Should focus be trapped within the dialog content? */
  trapFocus: boolean;
  /** Should focus be restored to the trigger when dialog closes? */
  restoreFocus: boolean;
  /** Should the first focusable element receive focus on open? */
  autoFocus: boolean;
}

export interface UseDialogReturn {
  /** Current open state */
  isOpen: boolean;
  /** Open the dialog */
  open: () => void;
  /** Close the dialog */
  close: () => void;
  /** Toggle the dialog */
  toggle: () => void;
  /** Focus management intent for the platform layer */
  focusManagement: FocusManagementIntent;
  /** Generated IDs for ARIA linking */
  ids: {
    base: string;
    title: string;
    description: string;
    content: string;
  };
  /** Props for the trigger element (button that opens the dialog) */
  getTriggerProps: (overrides?: { onAction?: () => void }) => PropGetterReturn;
  /** Props for the dialog content container */
  getContentProps: () => PropGetterReturn;
  /** Props for the close button inside the dialog */
  getCloseProps: (overrides?: { onAction?: () => void }) => PropGetterReturn;
  /** Props for the overlay/backdrop */
  getOverlayProps: (overrides?: { onAction?: () => void }) => PropGetterReturn;
}

const DIALOG_KEY_MAP: InteractionKeyMap = {
  Escape: "dismiss",
};

/**
 * Headless dialog hook.
 *
 * Manages open/close state, generates ARIA-linked IDs, provides
 * prop getters for trigger/content/close/overlay elements, and declares
 * focus management intent for the platform layer to implement.
 */
export function useDialog(options: UseDialogOptions = {}): UseDialogReturn {
  const {
    isOpen: controlledIsOpen,
    defaultOpen = false,
    onOpenChange,
    closeOnOverlayPress = true,
    closeOnEscape = true,
    modal = true,
    role = "dialog",
  } = options;

  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: controlledIsOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const dialogIds = useIds("dialog", "title", "description", "content");

  const ids = {
    base: dialogIds["base"]!,
    title: dialogIds["title"]!,
    description: dialogIds["description"]!,
    content: dialogIds["content"]!,
  };

  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const toggle = useCallback(
    () => setIsOpen((prev: boolean) => !prev),
    [setIsOpen],
  );

  const contentKeyboardConfig = useMemo(
    () => (closeOnEscape ? createKeyboardHandler(DIALOG_KEY_MAP) : undefined),
    [closeOnEscape],
  );

  const focusManagement: FocusManagementIntent = {
    trapFocus: modal,
    restoreFocus: true,
    autoFocus: true,
  };

  const getTriggerProps = useCallback(
    (overrides?: { onAction?: () => void }): PropGetterReturn => {
      const action = overrides?.onAction ?? toggle;
      return {
        accessibility: {
          expanded: isOpen,
          hasPopup: "dialog",
          controls: isOpen ? ids.content : undefined,
        },
        onAction: action,
      };
    },
    [isOpen, ids.content, toggle],
  );

  const getContentProps = useCallback((): PropGetterReturn => {
    return {
      accessibility: {
        role,
        modal: modal || undefined,
        labelledBy: ids.title,
        describedBy: ids.description,
      },
      keyboardConfig: contentKeyboardConfig,
    };
  }, [role, modal, ids.title, ids.description, contentKeyboardConfig]);

  const getCloseProps = useCallback(
    (overrides?: { onAction?: () => void }): PropGetterReturn => {
      const action = overrides?.onAction ?? close;
      return {
        accessibility: {
          label: "Close dialog",
        },
        onAction: action,
      };
    },
    [close],
  );

  const getOverlayProps = useCallback(
    (overrides?: { onAction?: () => void }): PropGetterReturn => {
      const action = closeOnOverlayPress
        ? (overrides?.onAction ?? close)
        : overrides?.onAction;
      return {
        accessibility: {
          hidden: true,
        },
        onAction: action,
      };
    },
    [closeOnOverlayPress, close],
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    focusManagement,
    ids,
    getTriggerProps,
    getContentProps,
    getCloseProps,
    getOverlayProps,
  };
}
