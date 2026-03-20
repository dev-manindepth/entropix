import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Button,
} from "@entropix/react";

const meta: Meta<typeof Menu> = {
  title: "Components/Menu",
  component: Menu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Menu>;

export const Default: Story = {
  render: () => (
    <Menu>
      <MenuTrigger>
        <Button variant="secondary" size="md">Options</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem index={0} onSelect={() => console.log("Edit")}>
          Edit
        </MenuItem>
        <MenuItem index={1} onSelect={() => console.log("Duplicate")}>
          Duplicate
        </MenuItem>
        <MenuItem index={2} onSelect={() => console.log("Archive")}>
          Archive
        </MenuItem>
        <MenuItem index={3} disabled>
          Delete (disabled)
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const KeepOpen: Story = {
  name: "Keep Open on Select",
  render: () => (
    <Menu closeOnSelect={false}>
      <MenuTrigger>
        <Button variant="outline" size="md">Multi-Select</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem index={0} onSelect={() => console.log("Option A")}>
          Option A
        </MenuItem>
        <MenuItem index={1} onSelect={() => console.log("Option B")}>
          Option B
        </MenuItem>
        <MenuItem index={2} onSelect={() => console.log("Option C")}>
          Option C
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};
