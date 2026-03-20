import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "@entropix/react";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "filled"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
    rows: { control: "number" },
    resize: { control: "select", options: ["none", "vertical", "both"] },
    label: { control: "text" },
    placeholder: { control: "text" },
    helperText: { control: "text" },
    errorMessage: { control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { label: "Bio", placeholder: "Tell us about yourself", rows: 4 },
};

export const WithHelperText: Story = {
  name: "With Helper Text",
  args: { label: "Description", placeholder: "Write a description...", helperText: "Max 200 characters", rows: 3 },
};

export const WithError: Story = {
  name: "With Error",
  args: { label: "Comments", errorMessage: "Comments cannot be empty", rows: 3 },
};

export const Filled: Story = {
  args: { label: "Notes", variant: "filled", placeholder: "Your notes...", rows: 4 },
};

export const Disabled: Story = {
  args: { label: "Locked", value: "This content is locked", disabled: true, rows: 3 },
};

export const NoResize: Story = {
  name: "No Resize",
  args: { label: "Fixed Size", placeholder: "Cannot resize", resize: "none", rows: 4 },
};

export const AllStates: Story = {
  name: "All States",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 400 }}>
      <Textarea label="Normal" placeholder="Normal textarea" rows={3} />
      <Textarea label="With Helper" placeholder="Has helper" helperText="Keep it short" rows={3} />
      <Textarea label="Error State" errorMessage="This field is required" rows={3} />
      <Textarea label="Disabled" value="Cannot edit this" disabled rows={3} />
    </div>
  ),
};
