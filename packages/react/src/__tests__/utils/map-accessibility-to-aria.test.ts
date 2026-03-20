import { describe, it, expect } from "vitest";
import { mapAccessibilityToAria } from "../../utils/map-accessibility-to-aria.js";
import type { AccessibilityProps } from "@entropix/core";

describe("mapAccessibilityToAria", () => {
  it("maps all AccessibilityProps fields to correct DOM attributes", () => {
    const props: AccessibilityProps = {
      role: "button",
      label: "Click me",
      labelledBy: "label-id",
      describedBy: "desc-id",
      disabled: true,
      expanded: false,
      selected: true,
      checked: true,
      pressed: false,
      busy: true,
      modal: true,
      hasPopup: "dialog",
      controls: "panel-id",
      owns: "menu-id",
      live: "polite",
      tabIndex: 0,
      hidden: false,
      valueNow: 50,
      valueMin: 0,
      valueMax: 100,
      valueText: "50%",
    };

    const result = mapAccessibilityToAria(props);

    expect(result["role"]).toBe("button");
    expect(result["aria-label"]).toBe("Click me");
    expect(result["aria-labelledby"]).toBe("label-id");
    expect(result["aria-describedby"]).toBe("desc-id");
    expect(result["aria-disabled"]).toBe(true);
    expect(result["aria-expanded"]).toBe(false);
    expect(result["aria-selected"]).toBe(true);
    expect(result["aria-checked"]).toBe(true);
    expect(result["aria-pressed"]).toBe(false);
    expect(result["aria-busy"]).toBe(true);
    expect(result["aria-modal"]).toBe(true);
    expect(result["aria-haspopup"]).toBe("dialog");
    expect(result["aria-controls"]).toBe("panel-id");
    expect(result["aria-owns"]).toBe("menu-id");
    expect(result["aria-live"]).toBe("polite");
    expect(result["tabIndex"]).toBe(0);
    expect(result["aria-hidden"]).toBe(false);
    expect(result["aria-valuenow"]).toBe(50);
    expect(result["aria-valuemin"]).toBe(0);
    expect(result["aria-valuemax"]).toBe(100);
    expect(result["aria-valuetext"]).toBe("50%");
  });

  it("filters out undefined values", () => {
    const result = mapAccessibilityToAria({
      role: "button",
      label: undefined,
      disabled: undefined,
    });

    expect(result).toEqual({ role: "button" });
    expect("aria-label" in result).toBe(false);
    expect("aria-disabled" in result).toBe(false);
  });

  it("returns empty object for empty input", () => {
    expect(mapAccessibilityToAria({})).toEqual({});
  });

  it("handles checked='mixed' correctly", () => {
    const result = mapAccessibilityToAria({ checked: "mixed" });
    expect(result["aria-checked"]).toBe("mixed");
  });

  it("maps tabIndex to tabIndex (not aria-tabindex)", () => {
    const result = mapAccessibilityToAria({ tabIndex: -1 });
    expect(result["tabIndex"]).toBe(-1);
    expect("aria-tabindex" in result).toBe(false);
  });
});
