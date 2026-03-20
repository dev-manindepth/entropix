import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToggle } from "../../hooks/use-toggle.js";

describe("useToggle", () => {
  it("uncontrolled: starts with defaultChecked=false", () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current.isChecked).toBe(false);
  });

  it("uncontrolled: starts with defaultChecked when provided", () => {
    const { result } = renderHook(() =>
      useToggle({ defaultChecked: true }),
    );
    expect(result.current.isChecked).toBe(true);
  });

  it("uncontrolled: toggle() flips the state", () => {
    const { result } = renderHook(() => useToggle());

    act(() => result.current.toggle());
    expect(result.current.isChecked).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.isChecked).toBe(false);
  });

  it("uncontrolled: calls onChange on toggle", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useToggle({ onChange }));

    act(() => result.current.toggle());
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("controlled: reflects controlled value", () => {
    const { result } = renderHook(() => useToggle({ checked: true }));
    expect(result.current.isChecked).toBe(true);
  });

  it("controlled: calls onChange but does not change internal state", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useToggle({ checked: false, onChange }),
    );

    act(() => result.current.toggle());
    expect(result.current.isChecked).toBe(false);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("getToggleProps: returns correct role", () => {
    const { result: checkbox } = renderHook(() => useToggle());
    expect(checkbox.current.getToggleProps().accessibility.role).toBe(
      "checkbox",
    );

    const { result: switchToggle } = renderHook(() =>
      useToggle({ role: "switch" }),
    );
    expect(switchToggle.current.getToggleProps().accessibility.role).toBe(
      "switch",
    );
  });

  it("getToggleProps: reflects checked state", () => {
    const { result } = renderHook(() =>
      useToggle({ defaultChecked: true }),
    );
    expect(result.current.getToggleProps().accessibility.checked).toBe(true);
  });

  it("disabled: no onAction, no keyboard config, tabIndex=-1", () => {
    const { result } = renderHook(() => useToggle({ disabled: true }));
    const props = result.current.getToggleProps();

    expect(result.current.isDisabled).toBe(true);
    expect(props.accessibility.disabled).toBe(true);
    expect(props.accessibility.tabIndex).toBe(-1);
    expect(props.onAction).toBeUndefined();
    expect(props.keyboardConfig).toBeUndefined();
  });

  it("disabled: toggle() does nothing", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useToggle({ disabled: true, onChange }),
    );

    act(() => result.current.toggle());
    expect(result.current.isChecked).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("setChecked: sets explicit value", () => {
    const { result } = renderHook(() => useToggle());

    act(() => result.current.setChecked(true));
    expect(result.current.isChecked).toBe(true);

    act(() => result.current.setChecked(false));
    expect(result.current.isChecked).toBe(false);
  });

  it("keyboard config maps Space and Enter to 'toggle'", () => {
    const { result } = renderHook(() => useToggle());
    const props = result.current.getToggleProps();

    expect(props.keyboardConfig!.getIntent(" ")).toBe("toggle");
    expect(props.keyboardConfig!.getIntent("Enter")).toBe("toggle");
  });
});
