import React from "react";
import { useDialog, type UseDialogOptions } from "@entropix/core";
import { DialogContext } from "./dialog-context.js";

export interface DialogProps extends UseDialogOptions {
  children: React.ReactNode;
}

/**
 * Dialog root — provides dialog state to compound sub-components.
 * Renders no UI of its own.
 */
export function Dialog({
  children,
  isOpen,
  defaultOpen,
  onOpenChange,
  closeOnOverlayPress,
  closeOnEscape,
  modal,
  role,
}: DialogProps) {
  const dialog = useDialog({
    isOpen,
    defaultOpen,
    onOpenChange,
    closeOnOverlayPress,
    closeOnEscape,
    modal,
    role,
  });

  return (
    <DialogContext.Provider value={dialog}>{children}</DialogContext.Provider>
  );
}
