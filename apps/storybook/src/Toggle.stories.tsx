import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "@entropix/react";

const meta: Meta<typeof Toggle> = {
  title: "Components/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: { children: "Toggle me" },
};

export const Checked: Story = {
  args: { children: "Checked", defaultChecked: true },
};

export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
};

export const WithLabel: Story = {
  args: { label: "Accept terms" },
};
