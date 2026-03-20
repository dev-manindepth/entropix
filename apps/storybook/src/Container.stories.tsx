import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Container } from "@entropix/react";

const ContentBlock = () => (
  <div style={{
    padding: "2rem",
    background: "var(--entropix-color-action-secondary-default)",
    borderRadius: "var(--entropix-radius-md)",
    textAlign: "center",
    color: "var(--entropix-color-text-primary)",
  }}>
    Content inside container
  </div>
);

const meta: Meta<typeof Container> = {
  title: "Layout/Container",
  component: Container,
  tags: ["autodocs"],
  argTypes: {
    maxWidth: { control: "select", options: ["sm", "md", "lg", "xl"] },
  },
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: { maxWidth: "xl" },
  render: (args) => (
    <Container {...args}>
      <ContentBlock />
    </Container>
  ),
};

export const Small: Story = {
  args: { maxWidth: "sm" },
  render: (args) => (
    <Container {...args}>
      <ContentBlock />
    </Container>
  ),
};

export const Medium: Story = {
  args: { maxWidth: "md" },
  render: (args) => (
    <Container {...args}>
      <ContentBlock />
    </Container>
  ),
};

export const AllSizes: Story = {
  name: "All Sizes",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size}>
          <p style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.5rem", paddingLeft: "1rem" }}>{size}</p>
          <Container maxWidth={size}>
            <ContentBlock />
          </Container>
        </div>
      ))}
    </div>
  ),
};
