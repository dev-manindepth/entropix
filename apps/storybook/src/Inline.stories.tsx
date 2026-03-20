import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Inline } from "@entropix/react";

const Tag = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    padding: "0.5rem 1rem",
    background: "var(--entropix-color-action-secondary-default)",
    borderRadius: "var(--entropix-radius-md)",
    color: "var(--entropix-color-text-primary)",
    whiteSpace: "nowrap",
  }}>
    {children}
  </div>
);

const meta: Meta<typeof Inline> = {
  title: "Layout/Inline",
  component: Inline,
  tags: ["autodocs"],
  argTypes: {
    gap: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl"] },
    justify: { control: "select", options: ["start", "center", "end", "between", "around"] },
    align: { control: "select", options: ["start", "center", "end", "stretch"] },
    wrap: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Inline>;

export const Default: Story = {
  args: { gap: "md" },
  render: (args) => (
    <Inline {...args}>
      <Tag>Item A</Tag>
      <Tag>Item B</Tag>
      <Tag>Item C</Tag>
    </Inline>
  ),
};

export const SpaceBetween: Story = {
  name: "Space Between",
  render: () => (
    <Inline gap="md" justify="between" style={{ width: "100%" }}>
      <Tag>Left</Tag>
      <Tag>Center</Tag>
      <Tag>Right</Tag>
    </Inline>
  ),
};

export const Wrapping: Story = {
  render: () => (
    <div style={{ maxWidth: 300 }}>
      <Inline gap="sm" wrap>
        <Tag>React</Tag>
        <Tag>Vue</Tag>
        <Tag>Angular</Tag>
        <Tag>Svelte</Tag>
        <Tag>Solid</Tag>
        <Tag>Astro</Tag>
      </Inline>
    </div>
  ),
};

export const CenterAligned: Story = {
  name: "Center Aligned",
  render: () => (
    <Inline gap="md" justify="center">
      <Tag>Centered A</Tag>
      <Tag>Centered B</Tag>
      <Tag>Centered C</Tag>
    </Inline>
  ),
};

export const AllGaps: Story = {
  name: "All Gap Sizes",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((gap) => (
        <div key={gap}>
          <p style={{ marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.875rem" }}>{gap}</p>
          <Inline gap={gap}>
            <Tag>A</Tag>
            <Tag>B</Tag>
            <Tag>C</Tag>
          </Inline>
        </div>
      ))}
    </div>
  ),
};
