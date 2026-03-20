import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../../components/button.js";

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeDefined();
  });

  it("calls onPress on click", () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Click</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("calls onPress on Enter key", () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Click</Button>);

    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("calls onPress on Space key", () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Click</Button>);

    fireEvent.keyDown(screen.getByRole("button"), { key: " " });
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("disabled: sets aria-disabled and native disabled, no click fires", () => {
    const onPress = vi.fn();
    render(
      <Button disabled onPress={onPress}>
        Click
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("loading: sets data-state='loading' and aria-busy", () => {
    render(<Button loading>Click</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("data-state", "loading");
  });

  it("sets data-variant and data-size", () => {
    render(
      <Button variant="primary" size="lg">
        Click
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-variant", "primary");
    expect(button).toHaveAttribute("data-size", "lg");
  });

  it("renders with as prop for non-button elements", () => {
    render(
      <Button as="div" onPress={() => {}}>
        Click
      </Button>,
    );

    // Should have explicit role="button" for non-native elements
    const el = screen.getByRole("button");
    expect(el.tagName).toBe("DIV");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Click</Button>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it("passes through className and style", () => {
    render(
      <Button className="custom" style={{ color: "red" }}>
        Click
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom");
    expect(button.style.color).toBe("red");
  });
});
