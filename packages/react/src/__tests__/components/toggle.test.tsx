import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toggle } from "../../components/toggle.js";
import { Switch } from "../../components/switch.js";

describe("Toggle", () => {
  it("renders with role='checkbox'", () => {
    render(<Toggle>Accept</Toggle>);
    expect(screen.getByRole("checkbox")).toBeDefined();
  });

  it("starts unchecked by default", () => {
    render(<Toggle>Accept</Toggle>);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "data-state",
      "unchecked",
    );
  });

  it("click toggles checked state", () => {
    render(<Toggle>Accept</Toggle>);
    const toggle = screen.getByRole("checkbox");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(toggle).toHaveAttribute("data-state", "checked");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange with new value on toggle", () => {
    const onChange = vi.fn();
    render(<Toggle onChange={onChange}>Accept</Toggle>);

    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("controlled mode: reflects checked prop", () => {
    const { rerender } = render(<Toggle checked={false}>Accept</Toggle>);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "false",
    );

    rerender(<Toggle checked={true}>Accept</Toggle>);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("disabled: no click, disabled attribute set", () => {
    const onChange = vi.fn();
    render(
      <Toggle disabled onChange={onChange}>
        Accept
      </Toggle>,
    );

    const toggle = screen.getByRole("checkbox");
    expect(toggle).toBeDisabled();

    fireEvent.click(toggle);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Space key toggles", () => {
    const onChange = vi.fn();
    render(<Toggle onChange={onChange}>Accept</Toggle>);

    fireEvent.keyDown(screen.getByRole("checkbox"), { key: " " });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("label prop sets aria-label when no children", () => {
    render(<Toggle label="Dark mode" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-label",
      "Dark mode",
    );
  });

  it("defaultChecked starts checked", () => {
    render(<Toggle defaultChecked>Accept</Toggle>);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});

describe("Switch", () => {
  it("renders with role='switch'", () => {
    render(<Switch>Dark mode</Switch>);
    expect(screen.getByRole("switch")).toBeDefined();
  });

  it("click toggles checked state", () => {
    render(<Switch>Dark mode</Switch>);
    const sw = screen.getByRole("switch");

    fireEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(sw).toHaveAttribute("data-state", "checked");
  });
});
