import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "../../components/accordion/index.js";

function TestAccordion(props: {
  defaultExpandedKeys?: string[];
  allowMultiple?: boolean;
  collapsible?: boolean;
  onExpandedKeysChange?: (keys: string[]) => void;
}) {
  return (
    <Accordion {...props}>
      <AccordionItem value="item1">
        <AccordionTrigger>Trigger 1</AccordionTrigger>
        <AccordionPanel>Panel 1 content</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>Trigger 2</AccordionTrigger>
        <AccordionPanel>Panel 2 content</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion", () => {
  it("triggers have aria-expanded", () => {
    const { getByText } = render(
      <TestAccordion defaultExpandedKeys={["item1"]} />,
    );
    expect(getByText("Trigger 1")).toHaveAttribute("aria-expanded", "true");
    expect(getByText("Trigger 2")).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking trigger toggles panel", () => {
    const { getByText, queryByText } = render(<TestAccordion />);
    expect(queryByText("Panel 1 content")).toBeNull();

    fireEvent.click(getByText("Trigger 1"));
    expect(getByText("Panel 1 content")).toBeTruthy();

    fireEvent.click(getByText("Trigger 1"));
    expect(queryByText("Panel 1 content")).toBeNull();
  });

  it("single-expand: only one panel open at a time", () => {
    const { getByText, queryByText } = render(
      <TestAccordion defaultExpandedKeys={["item1"]} />,
    );
    expect(getByText("Panel 1 content")).toBeTruthy();

    fireEvent.click(getByText("Trigger 2"));
    expect(queryByText("Panel 1 content")).toBeNull();
    expect(getByText("Panel 2 content")).toBeTruthy();
  });

  it("multi-expand: multiple panels open", () => {
    const { getByText } = render(<TestAccordion allowMultiple />);

    fireEvent.click(getByText("Trigger 1"));
    fireEvent.click(getByText("Trigger 2"));

    expect(getByText("Panel 1 content")).toBeTruthy();
    expect(getByText("Panel 2 content")).toBeTruthy();
  });

  it("panel has role=region and aria-labelledby", () => {
    const { getByRole } = render(
      <TestAccordion defaultExpandedKeys={["item1"]} />,
    );
    const panel = getByRole("region");
    expect(panel).toHaveAttribute("aria-labelledby");
  });

  it("trigger has aria-controls pointing to panel", () => {
    const { getByText } = render(
      <TestAccordion defaultExpandedKeys={["item1"]} />,
    );
    expect(getByText("Trigger 1")).toHaveAttribute("aria-controls");
  });

  it("calls onExpandedKeysChange", () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <TestAccordion onExpandedKeysChange={onChange} />,
    );
    fireEvent.click(getByText("Trigger 1"));
    expect(onChange).toHaveBeenCalledWith(["item1"]);
  });
});
