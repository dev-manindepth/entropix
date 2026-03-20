import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "@entropix/react";

const DemoBox = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    padding: "0.75rem 1rem",
    background: "var(--entropix-color-action-secondary-default)",
    borderRadius: "var(--entropix-radius-md)",
    color: "var(--entropix-color-text-primary)",
  }}>
    {children}
  </div>
);

const meta: Meta<typeof Stack> = {
  title: "Layout/Stack",
  component: Stack,
  tags: ["autodocs"],
  argTypes: {
    gap: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl"] },
    align: { control: "select", options: ["start", "center", "end", "stretch"] },
  },
};
export default meta;
type Story = StoryObj<typeof Stack>;

export const Default: Story = {
  args: { gap: "md" },
  render: (args) => (
    <Stack {...args}>
      <DemoBox>Stack item 1</DemoBox>
      <DemoBox>Stack item 2</DemoBox>
      <DemoBox>Stack item 3</DemoBox>
    </Stack>
  ),
};

export const Small: Story = {
  args: { gap: "sm" },
  render: (args) => (
    <Stack {...args}>
      <DemoBox>Tight spacing 1</DemoBox>
      <DemoBox>Tight spacing 2</DemoBox>
      <DemoBox>Tight spacing 3</DemoBox>
    </Stack>
  ),
};

export const Large: Story = {
  args: { gap: "xl" },
  render: (args) => (
    <Stack {...args}>
      <DemoBox>Wide spacing 1</DemoBox>
      <DemoBox>Wide spacing 2</DemoBox>
      <DemoBox>Wide spacing 3</DemoBox>
    </Stack>
  ),
};

export const CenterAligned: Story = {
  name: "Center Aligned",
  render: () => (
    <Stack gap="md" align="center">
      <DemoBox>Short</DemoBox>
      <DemoBox>Medium width item</DemoBox>
      <DemoBox>A much longer content item here</DemoBox>
    </Stack>
  ),
};

export const AllGaps: Story = {
  name: "All Gap Sizes",
  render: () => (
    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((gap) => (
        <div key={gap}>
          <p style={{ marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.875rem" }}>{gap}</p>
          <Stack gap={gap}>
            <DemoBox>A</DemoBox>
            <DemoBox>B</DemoBox>
            <DemoBox>C</DemoBox>
          </Stack>
        </div>
      ))}
    </div>
  ),
};
