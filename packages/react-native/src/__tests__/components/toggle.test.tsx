import React from "react";
import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { Toggle } from "../../components/toggle";
import { Switch } from "../../components/switch";

describe("Toggle", () => {
  it("has accessibilityRole='checkbox'", () => {
    const { getByRole } = render(
      <Toggle>
        <Text>Accept</Text>
      </Toggle>,
    );
    expect(getByRole("checkbox")).toBeTruthy();
  });

  it("starts unchecked by default", () => {
    const { getByRole } = render(
      <Toggle>
        <Text>Accept</Text>
      </Toggle>,
    );
    expect(getByRole("checkbox").props.accessibilityState?.checked).toBe(false);
  });

  it("press toggles checked state", () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <Toggle onChange={onChange}>
        <Text>Accept</Text>
      </Toggle>,
    );

    fireEvent.press(getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("controlled mode reflects checked prop", () => {
    const { getByRole, rerender } = render(
      <Toggle checked={false}>
        <Text>Accept</Text>
      </Toggle>,
    );
    expect(getByRole("checkbox").props.accessibilityState?.checked).toBe(false);

    rerender(
      <Toggle checked={true}>
        <Text>Accept</Text>
      </Toggle>,
    );
    expect(getByRole("checkbox").props.accessibilityState?.checked).toBe(true);
  });

  it("disabled prevents toggle", () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <Toggle disabled onChange={onChange}>
        <Text>Accept</Text>
      </Toggle>,
    );

    fireEvent.press(getByRole("checkbox"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("label prop sets accessibilityLabel", () => {
    const { getByLabelText } = render(<Toggle label="Dark mode" />);
    expect(getByLabelText("Dark mode")).toBeTruthy();
  });

  it("defaultChecked starts checked", () => {
    const { getByRole } = render(
      <Toggle defaultChecked>
        <Text>Accept</Text>
      </Toggle>,
    );
    expect(getByRole("checkbox").props.accessibilityState?.checked).toBe(true);
  });
});

describe("Switch", () => {
  it("has accessibilityRole='switch'", () => {
    const { getByRole } = render(
      <Switch>
        <Text>Dark mode</Text>
      </Switch>,
    );
    expect(getByRole("switch")).toBeTruthy();
  });

  it("press toggles", () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <Switch onChange={onChange}>
        <Text>Dark mode</Text>
      </Switch>,
    );
    fireEvent.press(getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
