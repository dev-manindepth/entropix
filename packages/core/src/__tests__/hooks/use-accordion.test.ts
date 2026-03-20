import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAccordion } from "../../hooks/use-accordion.js";

describe("useAccordion", () => {
  it("uncontrolled: starts with no items expanded by default", () => {
    const { result } = renderHook(() => useAccordion());
    expect(result.current.expandedKeys).toEqual([]);
  });

  it("uncontrolled: starts with defaultExpandedKeys", () => {
    const { result } = renderHook(() =>
      useAccordion({ defaultExpandedKeys: ["item1"] }),
    );
    expect(result.current.expandedKeys).toEqual(["item1"]);
    expect(result.current.isExpanded("item1")).toBe(true);
  });

  it("toggle: expands an item", () => {
    const { result } = renderHook(() => useAccordion());
    act(() => result.current.toggle("item1"));
    expect(result.current.isExpanded("item1")).toBe(true);
  });

  it("toggle: collapses an expanded item", () => {
    const { result } = renderHook(() =>
      useAccordion({ defaultExpandedKeys: ["item1"] }),
    );
    act(() => result.current.toggle("item1"));
    expect(result.current.isExpanded("item1")).toBe(false);
  });

  it("single-expand (default): expanding one item collapses previous", () => {
    const { result } = renderHook(() =>
      useAccordion({ defaultExpandedKeys: ["item1"] }),
    );
    act(() => result.current.expand("item2"));
    expect(result.current.isExpanded("item1")).toBe(false);
    expect(result.current.isExpanded("item2")).toBe(true);
  });

  it("multi-expand: multiple items open simultaneously", () => {
    const { result } = renderHook(() =>
      useAccordion({ allowMultiple: true }),
    );
    act(() => result.current.expand("item1"));
    act(() => result.current.expand("item2"));
    expect(result.current.isExpanded("item1")).toBe(true);
    expect(result.current.isExpanded("item2")).toBe(true);
  });

  it("collapsible=false: prevents closing last open item", () => {
    const { result } = renderHook(() =>
      useAccordion({
        defaultExpandedKeys: ["item1"],
        collapsible: false,
      }),
    );
    act(() => result.current.collapse("item1"));
    expect(result.current.isExpanded("item1")).toBe(true);
  });

  it("collapsible=true (default): allows closing all items", () => {
    const { result } = renderHook(() =>
      useAccordion({ defaultExpandedKeys: ["item1"] }),
    );
    act(() => result.current.collapse("item1"));
    expect(result.current.expandedKeys).toEqual([]);
  });

  it("controlled: reflects provided expandedKeys", () => {
    const { result } = renderHook(() =>
      useAccordion({ expandedKeys: ["item2"] }),
    );
    expect(result.current.expandedKeys).toEqual(["item2"]);
  });

  it("controlled: calls onExpandedKeysChange on toggle", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useAccordion({
        expandedKeys: [],
        onExpandedKeysChange: onChange,
      }),
    );
    act(() => result.current.toggle("item1"));
    expect(onChange).toHaveBeenCalledWith(["item1"]);
  });

  it("getItemTriggerProps: returns correct props", () => {
    const { result } = renderHook(() =>
      useAccordion({ defaultExpandedKeys: ["item1"] }),
    );

    const expanded = result.current.getItemTriggerProps("item1");
    expect(expanded.accessibility.role).toBe("button");
    expect(expanded.accessibility.expanded).toBe(true);
    expect(expanded.accessibility.controls).toContain("panel-item1");
    expect(expanded.onAction).toBeDefined();

    const collapsed = result.current.getItemTriggerProps("item2");
    expect(collapsed.accessibility.expanded).toBe(false);
  });

  it("getItemPanelProps: returns correct props", () => {
    const { result } = renderHook(() =>
      useAccordion({ defaultExpandedKeys: ["item1"] }),
    );

    const expanded = result.current.getItemPanelProps("item1");
    expect(expanded.accessibility.role).toBe("region");
    expect(expanded.accessibility.labelledBy).toContain("trigger-item1");
    expect(expanded.accessibility.hidden).toBeUndefined();

    const collapsed = result.current.getItemPanelProps("item2");
    expect(collapsed.accessibility.hidden).toBe(true);
  });

  it("keyboard intents on trigger", () => {
    const { result } = renderHook(() => useAccordion());
    const props = result.current.getItemTriggerProps("item1");
    expect(props.keyboardConfig?.getIntent("ArrowDown")).toBe("moveDown");
    expect(props.keyboardConfig?.getIntent("ArrowUp")).toBe("moveUp");
    expect(props.keyboardConfig?.getIntent("Home")).toBe("moveStart");
    expect(props.keyboardConfig?.getIntent("End")).toBe("moveEnd");
    expect(props.keyboardConfig?.getIntent("Enter")).toBe("activate");
    expect(props.keyboardConfig?.getIntent(" ")).toBe("activate");
  });

  it("disabled: no onAction, no keyboardConfig", () => {
    const { result } = renderHook(() => useAccordion({ disabled: true }));
    const props = result.current.getItemTriggerProps("item1");
    expect(props.accessibility.disabled).toBe(true);
    expect(props.onAction).toBeUndefined();
    expect(props.keyboardConfig).toBeUndefined();
  });
});
