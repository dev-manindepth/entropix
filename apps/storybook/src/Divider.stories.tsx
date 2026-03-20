import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Divider, Stack } from "@entropix/react";

const meta: Meta<typeof Divider> = {
  title: "Layout/Divider",
  component: Divider,
  tags: ["autodocs"],
  argTypes: {
    spacing: { control: "select", options: ["none", "sm", "md", "lg"] },
  },
};
export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <p>Content above</p>
      <Divider />
      <p>Content below</p>
    </div>
  ),
};

export const WithSpacing: Story = {
  name: "With Spacing",
  render: () => (
    <div style={{ width: 400 }}>
      <p>Content above</p>
      <Divider spacing="lg" />
      <p>Content below with large spacing</p>
    </div>
  ),
};

export const InStack: Story = {
  name: "In Stack",
  render: () => (
    <Stack gap="md" style={{ width: 400 }}>
      <p>Section one content goes here.</p>
      <Divider />
      <p>Section two content goes here.</p>
      <Divider />
      <p>Section three content goes here.</p>
    </Stack>
  ),
};

export const AllSpacings: Story = {
  name: "All Spacings",
  render: () => (
    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
      {(["none", "sm", "md", "lg"] as const).map((spacing) => (
        <div key={spacing} style={{ width: 200 }}>
          <p style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.5rem" }}>{spacing}</p>
          <p>Above</p>
          <Divider spacing={spacing} />
          <p>Below</p>
        </div>
      ))}
    </div>
  ),
};
