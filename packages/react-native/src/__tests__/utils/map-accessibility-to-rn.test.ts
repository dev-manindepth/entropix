import { mapAccessibilityToRN } from "../../utils/map-accessibility-to-rn";

describe("mapAccessibilityToRN", () => {
  it("always sets accessible: true", () => {
    expect(mapAccessibilityToRN({}).accessible).toBe(true);
  });

  it("maps role to accessibilityRole with RN equivalents", () => {
    expect(mapAccessibilityToRN({ role: "button" }).accessibilityRole).toBe(
      "button",
    );
    expect(mapAccessibilityToRN({ role: "slider" }).accessibilityRole).toBe(
      "adjustable",
    );
    expect(mapAccessibilityToRN({ role: "dialog" }).accessibilityRole).toBe(
      "none",
    );
    expect(
      mapAccessibilityToRN({ role: "alertdialog" }).accessibilityRole,
    ).toBe("alert");
    expect(mapAccessibilityToRN({ role: "checkbox" }).accessibilityRole).toBe(
      "checkbox",
    );
    expect(mapAccessibilityToRN({ role: "switch" }).accessibilityRole).toBe(
      "switch",
    );
  });

  it("maps label to accessibilityLabel", () => {
    const result = mapAccessibilityToRN({ label: "Submit" });
    expect(result.accessibilityLabel).toBe("Submit");
  });

  it("maps describedBy to accessibilityHint", () => {
    const result = mapAccessibilityToRN({ describedBy: "Saves your changes" });
    expect(result.accessibilityHint).toBe("Saves your changes");
  });

  it("maps labelledBy to accessibilityLabelledBy", () => {
    const result = mapAccessibilityToRN({ labelledBy: "title-id" });
    expect(result.accessibilityLabelledBy).toBe("title-id");
  });

  it("aggregates boolean states into accessibilityState", () => {
    const result = mapAccessibilityToRN({
      disabled: true,
      expanded: false,
      selected: true,
      checked: true,
      busy: false,
    });
    expect(result.accessibilityState).toEqual({
      disabled: true,
      expanded: false,
      selected: true,
      checked: true,
      busy: false,
    });
  });

  it("handles checked='mixed'", () => {
    const result = mapAccessibilityToRN({ checked: "mixed" });
    expect(result.accessibilityState?.checked).toBe("mixed");
  });

  it("omits accessibilityState when no state props provided", () => {
    const result = mapAccessibilityToRN({ role: "button" });
    expect(result.accessibilityState).toBeUndefined();
  });

  it("aggregates value props into accessibilityValue", () => {
    const result = mapAccessibilityToRN({
      valueNow: 50,
      valueMin: 0,
      valueMax: 100,
      valueText: "50%",
    });
    expect(result.accessibilityValue).toEqual({
      now: 50,
      min: 0,
      max: 100,
      text: "50%",
    });
  });

  it("maps live region correctly", () => {
    expect(
      mapAccessibilityToRN({ live: "polite" }).accessibilityLiveRegion,
    ).toBe("polite");
    expect(
      mapAccessibilityToRN({ live: "assertive" }).accessibilityLiveRegion,
    ).toBe("assertive");
    expect(mapAccessibilityToRN({ live: "off" }).accessibilityLiveRegion).toBe(
      "none",
    );
  });

  it("maps hidden to both iOS and Android props", () => {
    const result = mapAccessibilityToRN({ hidden: true });
    expect(result.accessibilityElementsHidden).toBe(true);
    expect(result.importantForAccessibility).toBe("no-hide-descendants");
  });

  it("does not set hidden props when hidden is false", () => {
    const result = mapAccessibilityToRN({ hidden: false });
    expect(result.accessibilityElementsHidden).toBeUndefined();
    expect(result.importantForAccessibility).toBeUndefined();
  });

  it("drops unsupported props silently", () => {
    const result = mapAccessibilityToRN({
      modal: true,
      hasPopup: "dialog",
      controls: "panel",
      owns: "menu",
      tabIndex: 0,
      pressed: true,
    });
    // Only accessible: true should be set
    expect(result).toEqual({ accessible: true });
  });
});
