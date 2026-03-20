import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@entropix/react";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion defaultExpandedKeys={["item1"]}>
      <AccordionItem value="item1">
        <AccordionTrigger>What is Entropix?</AccordionTrigger>
        <AccordionPanel>
          Entropix is a cross-platform React design system with a custom headless core.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>How does theming work?</AccordionTrigger>
        <AccordionPanel>
          Themes are powered by CSS custom properties. Toggle between light and dark
          by setting the data-theme attribute on a parent element.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item3">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionPanel>
          Yes! All components follow WAI-ARIA patterns with proper roles, states,
          and keyboard navigation built into the headless core.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
};

export const MultipleExpand: Story = {
  name: "Multiple Expand",
  render: () => (
    <Accordion allowMultiple defaultExpandedKeys={["item1", "item2"]}>
      <AccordionItem value="item1">
        <AccordionTrigger>Section One</AccordionTrigger>
        <AccordionPanel>Content for section one.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>Section Two</AccordionTrigger>
        <AccordionPanel>Content for section two.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item3">
        <AccordionTrigger>Section Three</AccordionTrigger>
        <AccordionPanel>Content for section three.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
};
