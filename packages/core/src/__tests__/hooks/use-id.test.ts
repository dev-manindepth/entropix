import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useId, useIds } from "../../hooks/use-id.js";

describe("useId", () => {
  it("returns a string", () => {
    const { result } = renderHook(() => useId());
    expect(typeof result.current).toBe("string");
    expect(result.current.length).toBeGreaterThan(0);
  });

  it("returns stable ID across re-renders", () => {
    const { result, rerender } = renderHook(() => useId());
    const firstId = result.current;
    rerender();
    expect(result.current).toBe(firstId);
  });

  it("applies prefix when provided", () => {
    const { result } = renderHook(() => useId("dialog"));
    expect(result.current).toMatch(/^dialog-/);
  });

  it("generates unique IDs across multiple calls", () => {
    const { result: r1 } = renderHook(() => useId("a"));
    const { result: r2 } = renderHook(() => useId("b"));
    expect(r1.current).not.toBe(r2.current);
  });
});

describe("useIds", () => {
  it("returns object with base and all suffixes", () => {
    const { result } = renderHook(() =>
      useIds("dialog", "title", "description", "content"),
    );

    expect(result.current["base"]).toBeDefined();
    expect(result.current["title"]).toBeDefined();
    expect(result.current["description"]).toBeDefined();
    expect(result.current["content"]).toBeDefined();
  });

  it("suffixed IDs are derived from base", () => {
    const { result } = renderHook(() => useIds("dialog", "title"));
    const base = result.current["base"]!;
    const title = result.current["title"]!;

    expect(title).toBe(`${base}-title`);
  });
});
