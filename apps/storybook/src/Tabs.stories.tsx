import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabList, Tab, TabPanel } from "@entropix/react";

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultSelectedKey="tab1">
      <TabList>
        <Tab value="tab1">Account</Tab>
        <Tab value="tab2">Notifications</Tab>
        <Tab value="tab3">Security</Tab>
      </TabList>
      <TabPanel value="tab1">Manage your account settings and preferences.</TabPanel>
      <TabPanel value="tab2">Configure how you receive notifications.</TabPanel>
      <TabPanel value="tab3">Update your password and security settings.</TabPanel>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultSelectedKey="tab1" orientation="vertical">
      <div style={{ display: "flex", gap: "1rem" }}>
        <TabList>
          <Tab value="tab1">General</Tab>
          <Tab value="tab2">Editor</Tab>
          <Tab value="tab3">Plugins</Tab>
        </TabList>
        <div>
          <TabPanel value="tab1">General settings content.</TabPanel>
          <TabPanel value="tab2">Editor configuration options.</TabPanel>
          <TabPanel value="tab3">Manage your installed plugins.</TabPanel>
        </div>
      </div>
    </Tabs>
  ),
};

export const DisabledTab: Story = {
  name: "Disabled Tab",
  render: () => (
    <Tabs defaultSelectedKey="tab1" disabledKeys={["tab2"]}>
      <TabList>
        <Tab value="tab1">Active</Tab>
        <Tab value="tab2">Disabled</Tab>
        <Tab value="tab3">Another</Tab>
      </TabList>
      <TabPanel value="tab1">First tab content.</TabPanel>
      <TabPanel value="tab2">This tab is disabled.</TabPanel>
      <TabPanel value="tab3">Third tab content.</TabPanel>
    </Tabs>
  ),
};
