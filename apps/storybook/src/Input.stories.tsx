import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@entropix/react";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "filled"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
    label: { control: "text" },
    placeholder: { control: "text" },
    helperText: { control: "text" },
    errorMessage: { control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { label: "Full Name", placeholder: "Enter your name" },
};

export const WithHelperText: Story = {
  name: "With Helper Text",
  args: { label: "Email", type: "email", placeholder: "you@example.com", helperText: "We'll never share your email" },
};

export const WithError: Story = {
  name: "With Error",
  args: { label: "Username", errorMessage: "This field is required" },
};

export const Filled: Story = {
  args: { label: "Search", variant: "filled", placeholder: "Search..." },
};

export const Disabled: Story = {
  args: { label: "API Key", value: "sk-***", disabled: true },
};

export const Required: Story = {
  args: { label: "Email", required: true, placeholder: "Required field" },
};

export const AllSizes: Story = {
  name: "All Sizes",
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
      <Input label="Small" size="sm" placeholder="sm" />
      <Input label="Medium" size="md" placeholder="md" />
      <Input label="Large" size="lg" placeholder="lg" />
    </div>
  ),
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
      <Input label="Default" placeholder="Default variant" />
      <Input label="Filled" variant="filled" placeholder="Filled variant" />
    </div>
  ),
};

export const AllStates: Story = {
  name: "All States",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 320 }}>
      <Input label="Normal" placeholder="Normal input" />
      <Input label="With Helper" placeholder="Has helper" helperText="Some helpful text" />
      <Input label="Error State" errorMessage="This field is required" />
      <Input label="Disabled" value="Cannot edit" disabled />
      <Input label="Read Only" value="Read only value" readOnly />
      <Input label="Required" required placeholder="Required field" />
    </div>
  ),
};
