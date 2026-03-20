import { describe, it, expect, vi } from "vitest";
import { callAllHandlers } from "../../utils/call-all-handlers.js";

describe("callAllHandlers", () => {
  it("calls all provided handlers in order", () => {
    const order: number[] = [];
    const a = () => order.push(1);
    const b = () => order.push(2);
    const c = () => order.push(3);

    callAllHandlers(a, b, c)();
    expect(order).toEqual([1, 2, 3]);
  });

  it("skips undefined handlers", () => {
    const fn = vi.fn();
    callAllHandlers(undefined, fn, undefined)();
    expect(fn).toHaveBeenCalledOnce();
  });

  it("passes arguments through to each handler", () => {
    const a = vi.fn();
    const b = vi.fn();

    callAllHandlers(a, b)("arg1", "arg2");
    expect(a).toHaveBeenCalledWith("arg1", "arg2");
    expect(b).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("returns a no-op function when given no handlers", () => {
    const combined = callAllHandlers();
    expect(() => combined()).not.toThrow();
  });
});
