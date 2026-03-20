import { describe, it, expect } from "vitest";
import { createKeyboardHandler } from "../../utils/create-keyboard-handler.js";

describe("createKeyboardHandler", () => {
  it("returns correct intent for mapped keys", () => {
    const config = createKeyboardHandler({
      Enter: "activate",
      " ": "activate",
      Escape: "dismiss",
    });

    expect(config.getIntent("Enter")).toBe("activate");
    expect(config.getIntent(" ")).toBe("activate");
    expect(config.getIntent("Escape")).toBe("dismiss");
  });

  it("returns undefined for unmapped keys", () => {
    const config = createKeyboardHandler({ Enter: "activate" });
    expect(config.getIntent("Tab")).toBeUndefined();
    expect(config.getIntent("a")).toBeUndefined();
  });

  it("handles empty key map", () => {
    const config = createKeyboardHandler({});
    expect(config.getIntent("Enter")).toBeUndefined();
  });

  it("exposes the keyMap on the returned config", () => {
    const keyMap = { Enter: "activate" as const, Escape: "dismiss" as const };
    const config = createKeyboardHandler(keyMap);
    expect(config.keyMap).toBe(keyMap);
  });
});
