import React from "react";
import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../../components/button";

describe("Button", () => {
  it("renders children", () => {
    const { getByText } = render(
      <Button>
        <Text>Click me</Text>
      </Button>,
    );
    expect(getByText("Click me")).toBeTruthy();
  });

  it("has accessibilityRole='button'", () => {
    const { getByRole } = render(
      <Button>
        <Text>Click</Text>
      </Button>,
    );
    expect(getByRole("button")).toBeTruthy();
  });

  it("calls onPress on press", () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button onPress={onPress}>
        <Text>Click</Text>
      </Button>,
    );
    fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button disabled onPress={onPress}>
        <Text>Click</Text>
      </Button>,
    );
    fireEvent.press(getByRole("button"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("sets accessibilityState.disabled when disabled", () => {
    const { getByRole } = render(
      <Button disabled>
        <Text>Click</Text>
      </Button>,
    );
    const button = getByRole("button");
    expect(button.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it("sets accessibilityState.busy when loading", () => {
    const { getByRole } = render(
      <Button loading>
        <Text>Click</Text>
      </Button>,
    );
    const button = getByRole("button");
    expect(button.props.accessibilityState).toEqual(
      expect.objectContaining({ busy: true }),
    );
  });
});
