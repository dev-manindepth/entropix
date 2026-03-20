import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMenu } from "../../hooks/use-menu.js";

describe("useMenu", () => {
  it("uncontrolled: starts closed", () => {
    const { result } = renderHook(() => useMenu());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.activeIndex).toBe(-1);
  });

  it("open/close/toggle work", () => {
    const { result } = renderHook(() => useMenu());

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.activeIndex).toBe(0);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.activeIndex).toBe(-1);

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it("controlled: reflects isOpen", () => {
    const { result } = renderHook(() => useMenu({ isOpen: true }));
    expect(result.current.isOpen).toBe(true);
  });

  it("calls onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useMenu({ onOpenChange }));

    act(() => result.current.open());
    expect(onOpenChange).toHaveBeenCalledWith(true);

    act(() => result.current.close());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("setActiveIndex updates activeIndex", () => {
    const { result } = renderHook(() => useMenu());

    act(() => result.current.open());
    act(() => result.current.setActiveIndex(2));
    expect(result.current.activeIndex).toBe(2);
  });

  it("getTriggerProps: role=button, expanded, hasPopup=menu", () => {
    const { result } = renderHook(() => useMenu());

    let props = result.current.getTriggerProps();
    expect(props.accessibility.role).toBe("button");
    expect(props.accessibility.expanded).toBe(false);
    expect(props.accessibility.hasPopup).toBe("menu");
    expect(props.accessibility.controls).toBeUndefined();

    act(() => result.current.open());

    props = result.current.getTriggerProps();
    expect(props.accessibility.expanded).toBe(true);
    expect(props.accessibility.controls).toBeDefined();
  });

  it("getMenuProps: role=menu, labelledBy", () => {
    const { result } = renderHook(() => useMenu());
    const props = result.current.getMenuProps();
    expect(props.accessibility.role).toBe("menu");
    expect(props.accessibility.labelledBy).toBeDefined();
  });

  it("getMenuProps: keyboardConfig only when open", () => {
    const { result } = renderHook(() => useMenu());

    expect(result.current.getMenuProps().keyboardConfig).toBeUndefined();

    act(() => result.current.open());
    expect(result.current.getMenuProps().keyboardConfig).toBeDefined();
  });

  it("getItemProps: role=menuitem, tabIndex based on activeIndex", () => {
    const { result } = renderHook(() => useMenu());

    act(() => result.current.open());
    // activeIndex is 0 after open

    const active = result.current.getItemProps(0);
    expect(active.accessibility.role).toBe("menuitem");
    expect(active.accessibility.tabIndex).toBe(0);

    const inactive = result.current.getItemProps(1);
    expect(inactive.accessibility.tabIndex).toBe(-1);
  });

  it("getItemProps: disabled item has no onAction", () => {
    const { result } = renderHook(() => useMenu());
    const props = result.current.getItemProps(0, { disabled: true });
    expect(props.accessibility.disabled).toBe(true);
    expect(props.onAction).toBeUndefined();
  });

  it("getItemProps onAction: calls onSelect callback", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useMenu());
    const props = result.current.getItemProps(0, { onSelect });
    props.onAction!();
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("closeOnSelect=true (default): item onAction closes menu", () => {
    const { result } = renderHook(() => useMenu());
    act(() => result.current.open());

    const props = result.current.getItemProps(0, { onSelect: vi.fn() });
    act(() => props.onAction!());
    expect(result.current.isOpen).toBe(false);
  });

  it("closeOnSelect=false: item onAction does not close menu", () => {
    const { result } = renderHook(() => useMenu({ closeOnSelect: false }));
    act(() => result.current.open());

    const props = result.current.getItemProps(0, { onSelect: vi.fn() });
    act(() => props.onAction!());
    expect(result.current.isOpen).toBe(true);
  });

  it("trigger keyboard intents", () => {
    const { result } = renderHook(() => useMenu());
    const props = result.current.getTriggerProps();
    expect(props.keyboardConfig?.getIntent("Enter")).toBe("activate");
    expect(props.keyboardConfig?.getIntent(" ")).toBe("activate");
    expect(props.keyboardConfig?.getIntent("ArrowDown")).toBe("moveDown");
    expect(props.keyboardConfig?.getIntent("ArrowUp")).toBe("moveUp");
  });

  it("menu keyboard intents", () => {
    const { result } = renderHook(() => useMenu());
    act(() => result.current.open());
    const props = result.current.getMenuProps();
    expect(props.keyboardConfig?.getIntent("ArrowDown")).toBe("moveDown");
    expect(props.keyboardConfig?.getIntent("ArrowUp")).toBe("moveUp");
    expect(props.keyboardConfig?.getIntent("Home")).toBe("moveStart");
    expect(props.keyboardConfig?.getIntent("End")).toBe("moveEnd");
    expect(props.keyboardConfig?.getIntent("Escape")).toBe("dismiss");
    expect(props.keyboardConfig?.getIntent("Enter")).toBe("activate");
  });

  it("focusIntent: autoFocusFirst and restoreFocus are true", () => {
    const { result } = renderHook(() => useMenu());
    expect(result.current.focusIntent.autoFocusFirst).toBe(true);
    expect(result.current.focusIntent.restoreFocus).toBe(true);
  });
});
