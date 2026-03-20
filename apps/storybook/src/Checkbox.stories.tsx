import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "@entropix/react";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    indeterminate: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: { children: "Accept terms and conditions" },
};

export const Checked: Story = {
  args: { children: "Subscribe to newsletter", defaultChecked: true },
};

export const Disabled: Story = {
  args: { children: "Enable notifications", disabled: true },
};

export const DisabledChecked: Story = {
  name: "Disabled Checked",
  args: { children: "Already accepted", disabled: true, defaultChecked: true },
};

export const Indeterminate: Story = {
  args: { children: "Select all", indeterminate: true },
};

export const WithLabel: Story = {
  name: "With Label Prop",
  args: { label: "I agree to the privacy policy" },
};

export const AllStates: Story = {
  name: "All States",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Checkbox>Unchecked</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox indeterminate>Indeterminate</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox disabled defaultChecked>Disabled Checked</Checkbox>
    </div>
  ),
};
