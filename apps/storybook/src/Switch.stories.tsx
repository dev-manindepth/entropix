import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "@entropix/react";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: { label: "Dark mode" },
};

export const Checked: Story = {
  args: { label: "Notifications", defaultChecked: true },
};

export const Disabled: Story = {
  args: { label: "Unavailable", disabled: true },
};

export const AllStates: Story = {
  name: "All States",
  render: () => (
    <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
      <Switch label="Off" />
      <Switch label="On" defaultChecked />
      <Switch label="Disabled off" disabled />
      <Switch label="Disabled on" disabled defaultChecked />
    </div>
  ),
};
