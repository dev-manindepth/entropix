import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useControllableState } from "../../hooks/use-controllable-state.js";

describe("useControllableState", () => {
  it("uses defaultValue in uncontrolled mode", () => {
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: "hello" }),
    );
    expect(result.current[0]).toBe("hello");
  });

  it("updates value on setValue in uncontrolled mode", () => {
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 0 }),
    );

    act(() => {
      result.current[1](42);
    });

    expect(result.current[0]).toBe(42);
  });

  it("calls onChange when value changes in uncontrolled mode", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 0, onChange }),
    );

    act(() => {
      result.current[1](5);
    });

    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("returns controlled value when provided", () => {
    const { result } = renderHook(() =>
      useControllableState({ value: "controlled", defaultValue: "default" }),
    );
    expect(result.current[0]).toBe("controlled");
  });

  it("calls onChange but does not update internal state in controlled mode", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({
        value: "controlled",
        defaultValue: "default",
        onChange,
      }),
    );

    act(() => {
      result.current[1]("new-value");
    });

    // Value should still be the controlled value
    expect(result.current[0]).toBe("controlled");
    expect(onChange).toHaveBeenCalledWith("new-value");
  });

  it("supports updater function form", () => {
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 10 }),
    );

    act(() => {
      result.current[1]((prev: number) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
  });
});
