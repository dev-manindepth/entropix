import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "../../components/menu/index.js";

function TestMenu(props: { onOpenChange?: (isOpen: boolean) => void; closeOnSelect?: boolean }) {
  const onSelect1 = vi.fn();
  const onSelect2 = vi.fn();
  return (
    <Menu {...props}>
      <MenuTrigger>Open Menu</MenuTrigger>
      <MenuContent>
        <MenuItem index={0} onSelect={onSelect1}>
          Item 1
        </MenuItem>
        <MenuItem index={1} onSelect={onSelect2}>
          Item 2
        </MenuItem>
        <MenuItem index={2} disabled>
          Item 3 (disabled)
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

describe("Menu", () => {
  it("trigger click opens menu", () => {
    const { getByText, queryByText } = render(<TestMenu />);
    expect(queryByText("Item 1")).toBeNull();

    fireEvent.click(getByText("Open Menu"));
    expect(getByText("Item 1")).toBeTruthy();
  });

  it("trigger has correct ARIA attributes", () => {
    const { getByText } = render(<TestMenu />);
    const trigger = getByText("Open Menu");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("trigger aria-expanded updates when opened", () => {
    const { getByText } = render(<TestMenu />);
    const trigger = getByText("Open Menu");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("menu has role=menu", () => {
    const { getByText, getByRole } = render(<TestMenu />);
    fireEvent.click(getByText("Open Menu"));
    expect(getByRole("menu")).toBeTruthy();
  });

  it("menu items have role=menuitem", () => {
    const { getByText, getAllByRole } = render(<TestMenu />);
    fireEvent.click(getByText("Open Menu"));
    expect(getAllByRole("menuitem")).toHaveLength(3);
  });

  it("clicking item closes menu (closeOnSelect=true default)", () => {
    const { getByText, queryByText } = render(<TestMenu />);
    fireEvent.click(getByText("Open Menu"));
    fireEvent.click(getByText("Item 1"));
    expect(queryByText("Item 1")).toBeNull();
  });

  it("closeOnSelect=false keeps menu open after item click", () => {
    const { getByText } = render(<TestMenu closeOnSelect={false} />);
    fireEvent.click(getByText("Open Menu"));
    fireEvent.click(getByText("Item 1"));
    expect(getByText("Item 1")).toBeTruthy();
  });

  it("disabled item has aria-disabled", () => {
    const { getByText } = render(<TestMenu />);
    fireEvent.click(getByText("Open Menu"));
    expect(getByText("Item 3 (disabled)")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("calls onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { getByText } = render(<TestMenu onOpenChange={onOpenChange} />);
    fireEvent.click(getByText("Open Menu"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
