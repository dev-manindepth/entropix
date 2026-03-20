import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useButton } from "../../hooks/use-button.js";

describe("useButton", () => {
  it("returns isDisabled=false and isLoading=false by default", () => {
    const { result } = renderHook(() => useButton());
    expect(result.current.isDisabled).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("getButtonProps: no explicit role for native button element", () => {
    const { result } = renderHook(() => useButton());
    const props = result.current.getButtonProps();
    expect(props.accessibility.role).toBeUndefined();
  });

  it("getButtonProps: sets role='button' for non-native elements", () => {
    const { result } = renderHook(() => useButton({ elementType: "div" }));
    const props = result.current.getButtonProps();
    expect(props.accessibility.role).toBe("button");
    expect(props.accessibility.tabIndex).toBe(0);
  });

  it("getButtonProps: includes onAction when not disabled", () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => useButton({ onPress }));
    const props = result.current.getButtonProps();

    expect(props.onAction).toBeDefined();
    props.onAction!();
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("disabled: sets disabled, removes onAction, tabIndex=-1 for non-native", () => {
    const onPress = vi.fn();
    const { result } = renderHook(() =>
      useButton({ disabled: true, onPress, elementType: "div" }),
    );
    const props = result.current.getButtonProps();

    expect(result.current.isDisabled).toBe(true);
    expect(props.accessibility.disabled).toBe(true);
    expect(props.accessibility.tabIndex).toBe(-1);
    expect(props.onAction).toBeUndefined();
    expect(props.keyboardConfig).toBeUndefined();
  });

  it("loading: sets busy=true, acts as disabled", () => {
    const { result } = renderHook(() => useButton({ loading: true }));
    const props = result.current.getButtonProps();

    expect(result.current.isDisabled).toBe(true);
    expect(result.current.isLoading).toBe(true);
    expect(props.accessibility.busy).toBe(true);
    expect(props.onAction).toBeUndefined();
  });

  it("keyboard config maps Enter and Space to 'activate'", () => {
    const { result } = renderHook(() => useButton());
    const props = result.current.getButtonProps();

    expect(props.keyboardConfig).toBeDefined();
    expect(props.keyboardConfig!.getIntent("Enter")).toBe("activate");
    expect(props.keyboardConfig!.getIntent(" ")).toBe("activate");
  });

  it("disabled removes keyboard config", () => {
    const { result } = renderHook(() => useButton({ disabled: true }));
    const props = result.current.getButtonProps();
    expect(props.keyboardConfig).toBeUndefined();
  });

  it("overrides: custom onAction replaces default", () => {
    const onPress = vi.fn();
    const customAction = vi.fn();
    const { result } = renderHook(() => useButton({ onPress }));
    const props = result.current.getButtonProps({ onAction: customAction });

    props.onAction!();
    expect(customAction).toHaveBeenCalledOnce();
    expect(onPress).not.toHaveBeenCalled();
  });
});
