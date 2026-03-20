import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDialog } from "../../hooks/use-dialog.js";

describe("useDialog", () => {
  it("uncontrolled: starts closed by default", () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current.isOpen).toBe(false);
  });

  it("uncontrolled: open/close/toggle work", () => {
    const { result } = renderHook(() => useDialog());

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it("uncontrolled: calls onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useDialog({ onOpenChange }));

    act(() => result.current.open());
    expect(onOpenChange).toHaveBeenCalledWith(true);

    act(() => result.current.close());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("controlled: reflects controlled isOpen", () => {
    const { result } = renderHook(() => useDialog({ isOpen: true }));
    expect(result.current.isOpen).toBe(true);
  });

  it("getTriggerProps: expanded reflects isOpen, hasPopup='dialog'", () => {
    const { result } = renderHook(() => useDialog());

    let triggerProps = result.current.getTriggerProps();
    expect(triggerProps.accessibility.expanded).toBe(false);
    expect(triggerProps.accessibility.hasPopup).toBe("dialog");
    expect(triggerProps.accessibility.controls).toBeUndefined();

    act(() => result.current.open());

    triggerProps = result.current.getTriggerProps();
    expect(triggerProps.accessibility.expanded).toBe(true);
    expect(triggerProps.accessibility.controls).toBeDefined();
  });

  it("getTriggerProps: onAction toggles the dialog", () => {
    const { result } = renderHook(() => useDialog());

    act(() => result.current.getTriggerProps().onAction!());
    expect(result.current.isOpen).toBe(true);
  });

  it("getContentProps: role, modal, labelledBy, describedBy", () => {
    const { result } = renderHook(() => useDialog());
    const contentProps = result.current.getContentProps();

    expect(contentProps.accessibility.role).toBe("dialog");
    expect(contentProps.accessibility.modal).toBe(true);
    expect(contentProps.accessibility.labelledBy).toBe(result.current.ids.title);
    expect(contentProps.accessibility.describedBy).toBe(
      result.current.ids.description,
    );
  });

  it("getContentProps: role='alertdialog' when specified", () => {
    const { result } = renderHook(() => useDialog({ role: "alertdialog" }));
    expect(result.current.getContentProps().accessibility.role).toBe(
      "alertdialog",
    );
  });

  it("getCloseProps: label and onAction closes", () => {
    const { result } = renderHook(() => useDialog({ defaultOpen: true }));
    const closeProps = result.current.getCloseProps();

    expect(closeProps.accessibility.label).toBe("Close dialog");
    act(() => closeProps.onAction!());
    expect(result.current.isOpen).toBe(false);
  });

  it("getOverlayProps: hidden=true, onAction closes when closeOnOverlayPress", () => {
    const { result } = renderHook(() => useDialog({ defaultOpen: true }));
    const overlayProps = result.current.getOverlayProps();

    expect(overlayProps.accessibility.hidden).toBe(true);
    expect(overlayProps.onAction).toBeDefined();

    act(() => overlayProps.onAction!());
    expect(result.current.isOpen).toBe(false);
  });

  it("getOverlayProps: no onAction when closeOnOverlayPress=false", () => {
    const { result } = renderHook(() =>
      useDialog({ closeOnOverlayPress: false }),
    );
    const overlayProps = result.current.getOverlayProps();
    expect(overlayProps.onAction).toBeUndefined();
  });

  it("keyboard: Escape mapped to 'dismiss' in content", () => {
    const { result } = renderHook(() => useDialog());
    const contentProps = result.current.getContentProps();

    expect(contentProps.keyboardConfig).toBeDefined();
    expect(contentProps.keyboardConfig!.getIntent("Escape")).toBe("dismiss");
  });

  it("keyboard: no keyboard config when closeOnEscape=false", () => {
    const { result } = renderHook(() => useDialog({ closeOnEscape: false }));
    const contentProps = result.current.getContentProps();
    expect(contentProps.keyboardConfig).toBeUndefined();
  });

  it("focusManagement: trapFocus matches modal", () => {
    const { result: modal } = renderHook(() => useDialog({ modal: true }));
    expect(modal.current.focusManagement.trapFocus).toBe(true);

    const { result: nonModal } = renderHook(() => useDialog({ modal: false }));
    expect(nonModal.current.focusManagement.trapFocus).toBe(false);
  });

  it("focusManagement: restoreFocus and autoFocus default true", () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current.focusManagement.restoreFocus).toBe(true);
    expect(result.current.focusManagement.autoFocus).toBe(true);
  });

  it("ids: title, description, content are derived from base", () => {
    const { result } = renderHook(() => useDialog());
    const { ids } = result.current;

    expect(ids.title).toBe(`${ids.base}-title`);
    expect(ids.description).toBe(`${ids.base}-description`);
    expect(ids.content).toBe(`${ids.base}-content`);
  });
});
