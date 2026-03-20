import React from "react";
import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "../../components/menu/index";

describe("Menu (RN)", () => {
  it("trigger press opens menu", () => {
    const { getByText, queryByText } = render(
      <Menu>
        <MenuTrigger>
          <Text>Open</Text>
        </MenuTrigger>
        <MenuContent>
          <MenuItem index={0}>
            <Text>Item 1</Text>
          </MenuItem>
        </MenuContent>
      </Menu>,
    );
    expect(queryByText("Item 1")).toBeNull();

    fireEvent.press(getByText("Open"));
    expect(getByText("Item 1")).toBeTruthy();
  });

  it("menu item press calls onSelect and closes menu", () => {
    const onSelect = jest.fn();
    const { getByText, queryByText } = render(
      <Menu>
        <MenuTrigger>
          <Text>Open</Text>
        </MenuTrigger>
        <MenuContent>
          <MenuItem index={0} onSelect={onSelect}>
            <Text>Item 1</Text>
          </MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.press(getByText("Open"));
    fireEvent.press(getByText("Item 1"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(queryByText("Item 1")).toBeNull();
  });

  it("closeOnSelect=false keeps menu open", () => {
    const { getByText } = render(
      <Menu closeOnSelect={false}>
        <MenuTrigger>
          <Text>Open</Text>
        </MenuTrigger>
        <MenuContent>
          <MenuItem index={0} onSelect={jest.fn()}>
            <Text>Item 1</Text>
          </MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.press(getByText("Open"));
    fireEvent.press(getByText("Item 1"));
    expect(getByText("Item 1")).toBeTruthy();
  });

  it("disabled item does not respond to press", () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <Menu>
        <MenuTrigger>
          <Text>Open</Text>
        </MenuTrigger>
        <MenuContent>
          <MenuItem index={0} disabled onSelect={onSelect}>
            <Text>Item 1</Text>
          </MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.press(getByText("Open"));
    fireEvent.press(getByText("Item 1"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("calls onOpenChange", () => {
    const onOpenChange = jest.fn();
    const { getByText } = render(
      <Menu onOpenChange={onOpenChange}>
        <MenuTrigger>
          <Text>Open</Text>
        </MenuTrigger>
        <MenuContent>
          <MenuItem index={0}>
            <Text>Item 1</Text>
          </MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.press(getByText("Open"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
