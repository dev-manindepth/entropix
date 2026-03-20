import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTabs } from "../../hooks/use-tabs.js";

describe("useTabs", () => {
  it("uncontrolled: defaults to defaultSelectedKey", () => {
    const { result } = renderHook(() =>
      useTabs({ defaultSelectedKey: "tab1" }),
    );
    expect(result.current.selectedKey).toBe("tab1");
  });

  it("controlled: reflects selectedKey", () => {
    const { result } = renderHook(() => useTabs({ selectedKey: "tab2" }));
    expect(result.current.selectedKey).toBe("tab2");
  });

  it("select(key) updates selectedKey and calls onSelectedKeyChange", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTabs({ defaultSelectedKey: "tab1", onSelectedKeyChange: onChange }),
    );

    act(() => result.current.select("tab2"));
    expect(result.current.selectedKey).toBe("tab2");
    expect(onChange).toHaveBeenCalledWith("tab2");
  });

  it("disabled keys: select on disabled key is no-op", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTabs({
        defaultSelectedKey: "tab1",
        disabledKeys: ["tab2"],
        onSelectedKeyChange: onChange,
      }),
    );

    act(() => result.current.select("tab2"));
    expect(result.current.selectedKey).toBe("tab1");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("getTabListProps: role=tablist, orientation set", () => {
    const { result } = renderHook(() =>
      useTabs({ orientation: "vertical" }),
    );
    const props = result.current.getTabListProps();
    expect(props.accessibility.role).toBe("tablist");
    expect(props.accessibility.orientation).toBe("vertical");
  });

  it("getTabListProps: defaults to horizontal orientation", () => {
    const { result } = renderHook(() => useTabs());
    expect(result.current.getTabListProps().accessibility.orientation).toBe(
      "horizontal",
    );
  });

  it("getTabProps: role=tab, selected correct, controls set", () => {
    const { result } = renderHook(() =>
      useTabs({ defaultSelectedKey: "tab1" }),
    );

    const selected = result.current.getTabProps("tab1");
    expect(selected.accessibility.role).toBe("tab");
    expect(selected.accessibility.selected).toBe(true);
    expect(selected.accessibility.tabIndex).toBe(0);
    expect(selected.accessibility.controls).toContain("panel-tab1");

    const unselected = result.current.getTabProps("tab2");
    expect(unselected.accessibility.selected).toBe(false);
    expect(unselected.accessibility.tabIndex).toBe(-1);
  });

  it("getTabProps: disabled tab has no onAction", () => {
    const { result } = renderHook(() =>
      useTabs({ disabledKeys: ["tab2"] }),
    );
    const props = result.current.getTabProps("tab2");
    expect(props.accessibility.disabled).toBe(true);
    expect(props.onAction).toBeUndefined();
    expect(props.keyboardConfig).toBeUndefined();
  });

  it("getTabPanelProps: role=tabpanel, labelledBy, tabIndex=0", () => {
    const { result } = renderHook(() =>
      useTabs({ defaultSelectedKey: "tab1" }),
    );

    const selected = result.current.getTabPanelProps("tab1");
    expect(selected.accessibility.role).toBe("tabpanel");
    expect(selected.accessibility.labelledBy).toContain("tab-tab1");
    expect(selected.accessibility.tabIndex).toBe(0);
    expect(selected.accessibility.hidden).toBeUndefined();

    const hidden = result.current.getTabPanelProps("tab2");
    expect(hidden.accessibility.hidden).toBe(true);
  });

  it("horizontal keyboard: ArrowLeft/Right mapped", () => {
    const { result } = renderHook(() =>
      useTabs({ orientation: "horizontal" }),
    );
    const props = result.current.getTabProps("tab1");
    expect(props.keyboardConfig?.getIntent("ArrowLeft")).toBe("moveLeft");
    expect(props.keyboardConfig?.getIntent("ArrowRight")).toBe("moveRight");
    expect(props.keyboardConfig?.getIntent("Home")).toBe("moveStart");
    expect(props.keyboardConfig?.getIntent("End")).toBe("moveEnd");
  });

  it("vertical keyboard: ArrowUp/Down mapped", () => {
    const { result } = renderHook(() =>
      useTabs({ orientation: "vertical" }),
    );
    const props = result.current.getTabProps("tab1");
    expect(props.keyboardConfig?.getIntent("ArrowUp")).toBe("moveUp");
    expect(props.keyboardConfig?.getIntent("ArrowDown")).toBe("moveDown");
  });

  it("globally disabled: all tabs have no onAction", () => {
    const { result } = renderHook(() =>
      useTabs({ disabled: true, defaultSelectedKey: "tab1" }),
    );
    const props = result.current.getTabProps("tab1");
    expect(props.onAction).toBeUndefined();
    expect(props.accessibility.disabled).toBe(true);
  });
});
