import { describe, it, expect } from "vitest";
import { mergeProps } from "../../utils/merge-props.js";

describe("mergeProps", () => {
  it("merges non-conflicting properties", () => {
    const result = mergeProps({ a: 1 }, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("later values override earlier non-function values", () => {
    const result = mergeProps({ a: 1 }, { a: 2 });
    expect(result).toEqual({ a: 2 });
  });

  it("composes function handlers — both get called in order", () => {
    const order: number[] = [];
    const fn1 = () => order.push(1);
    const fn2 = () => order.push(2);

    const result = mergeProps({ onClick: fn1 }, { onClick: fn2 });
    (result.onClick as () => void)();

    expect(order).toEqual([1, 2]);
  });

  it("deep merges accessibility objects", () => {
    const result = mergeProps(
      { accessibility: { role: "button" as const, disabled: true } },
      { accessibility: { label: "Click me" } },
    );

    expect(result.accessibility).toEqual({
      role: "button",
      disabled: true,
      label: "Click me",
    });
  });

  it("handles undefined sources gracefully", () => {
    const result = mergeProps(undefined, { a: 1 }, undefined, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("handles empty call with no sources", () => {
    const result = mergeProps();
    expect(result).toEqual({});
  });
});
