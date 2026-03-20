import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, RadioItem } from "@entropix/react";

const meta: Meta<typeof RadioGroup> = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "select", options: ["vertical", "horizontal"] },
    disabled: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  args: { label: "Select a plan", defaultValue: "startup" },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioItem value="startup">Startup</RadioItem>
      <RadioItem value="business">Business</RadioItem>
      <RadioItem value="enterprise">Enterprise</RadioItem>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  args: { label: "Size", defaultValue: "md", orientation: "horizontal" },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioItem value="sm">Small</RadioItem>
      <RadioItem value="md">Medium</RadioItem>
      <RadioItem value="lg">Large</RadioItem>
    </RadioGroup>
  ),
};

export const WithDisabledItem: Story = {
  name: "With Disabled Item",
  args: { label: "Subscription", defaultValue: "free" },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioItem value="free">Free</RadioItem>
      <RadioItem value="pro">Pro</RadioItem>
      <RadioItem value="team" disabled>Team (Coming soon)</RadioItem>
    </RadioGroup>
  ),
};

export const Controlled: Story = {
  name: "Controlled",
  render: () => {
    const [value, setValue] = useState("react");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <RadioGroup label="Framework" value={value} onChange={setValue}>
          <RadioItem value="react">React</RadioItem>
          <RadioItem value="vue">Vue</RadioItem>
          <RadioItem value="angular">Angular</RadioItem>
        </RadioGroup>
        <p style={{ fontSize: "0.875rem", color: "var(--entropix-color-text-secondary)" }}>
          Selected: <strong>{value}</strong>
        </p>
      </div>
    );
  },
};

export const DisabledGroup: Story = {
  name: "Disabled Group",
  args: { label: "Disabled group", defaultValue: "a", disabled: true },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioItem value="a">Option A</RadioItem>
      <RadioItem value="b">Option B</RadioItem>
      <RadioItem value="c">Option C</RadioItem>
    </RadioGroup>
  ),
};
