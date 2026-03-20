import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Select, SelectTrigger, SelectContent, SelectOption } from "@entropix/react";

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select label="Framework">
      <SelectTrigger placeholder="Choose a framework" />
      <SelectContent>
        <SelectOption value="react">React</SelectOption>
        <SelectOption value="vue">Vue</SelectOption>
        <SelectOption value="angular">Angular</SelectOption>
        <SelectOption value="svelte">Svelte</SelectOption>
      </SelectContent>
    </Select>
  ),
};

export const WithDefaultValue: Story = {
  name: "With Default Value",
  render: () => (
    <Select label="Color" defaultValue="blue">
      <SelectTrigger placeholder="Pick a color" />
      <SelectContent>
        <SelectOption value="red">Red</SelectOption>
        <SelectOption value="blue">Blue</SelectOption>
        <SelectOption value="green">Green</SelectOption>
      </SelectContent>
    </Select>
  ),
};

export const WithDisabledOption: Story = {
  name: "With Disabled Option",
  render: () => (
    <Select label="Plan">
      <SelectTrigger placeholder="Select a plan" />
      <SelectContent>
        <SelectOption value="free">Free</SelectOption>
        <SelectOption value="pro">Pro</SelectOption>
        <SelectOption value="enterprise" disabled>Enterprise (Contact us)</SelectOption>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select label="Locked" disabled>
      <SelectTrigger placeholder="Cannot change" />
      <SelectContent>
        <SelectOption value="a">Option A</SelectOption>
      </SelectContent>
    </Select>
  ),
};

export const Controlled: Story = {
  name: "Controlled",
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Select label="Country" value={value} onChange={setValue}>
          <SelectTrigger placeholder="Select a country" />
          <SelectContent>
            <SelectOption value="us">United States</SelectOption>
            <SelectOption value="uk">United Kingdom</SelectOption>
            <SelectOption value="in">India</SelectOption>
            <SelectOption value="jp">Japan</SelectOption>
          </SelectContent>
        </Select>
        <p style={{ fontSize: "0.875rem", color: "var(--entropix-color-text-secondary)" }}>
          Selected: <strong>{value || "none"}</strong>
        </p>
      </div>
    );
  },
};
