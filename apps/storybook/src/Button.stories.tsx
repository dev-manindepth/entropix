import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@entropix/react";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary", size: "md", children: "Primary Button" },
};

export const Secondary: Story = {
  args: { variant: "secondary", size: "md", children: "Secondary Button" },
};

export const Outline: Story = {
  args: { variant: "outline", size: "md", children: "Outline Button" },
};

export const Ghost: Story = {
  args: { variant: "ghost", size: "md", children: "Ghost Button" },
};

export const Danger: Story = {
  args: { variant: "danger", size: "md", children: "Danger Button" },
};

export const Disabled: Story = {
  args: {
    variant: "primary",
    size: "md",
    children: "Disabled",
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    variant: "primary",
    size: "md",
    children: "Loading...",
    loading: true,
  },
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Button variant="primary" size="md">Primary</Button>
      <Button variant="secondary" size="md">Secondary</Button>
      <Button variant="outline" size="md">Outline</Button>
      <Button variant="ghost" size="md">Ghost</Button>
      <Button variant="danger" size="md">Danger</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  name: "All Sizes",
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="md">Medium</Button>
      <Button variant="primary" size="lg">Large</Button>
    </div>
  ),
};
