import React from "react";
import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "../../components/accordion/index";

function TestAccordion(props: {
  defaultExpandedKeys?: string[];
  allowMultiple?: boolean;
  onExpandedKeysChange?: (keys: string[]) => void;
}) {
  return (
    <Accordion {...props}>
      <AccordionItem value="item1">
        <AccordionTrigger>
          <Text>Trigger 1</Text>
        </AccordionTrigger>
        <AccordionPanel>
          <Text>Panel 1</Text>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item2">
        <AccordionTrigger>
          <Text>Trigger 2</Text>
        </AccordionTrigger>
        <AccordionPanel>
          <Text>Panel 2</Text>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion (RN)", () => {
  it("triggers have accessibilityState.expanded", () => {
    const { getAllByRole } = render(
      <TestAccordion defaultExpandedKeys={["item1"]} />,
    );
    // The accordion triggers render as Pressable with role="button"
    const buttons = getAllByRole("button");
    expect(buttons[0]!.props.accessibilityState?.expanded).toBe(true);
    expect(buttons[1]!.props.accessibilityState?.expanded).toBe(false);
  });

  it("pressing trigger toggles panel", () => {
    const { getByText, queryByText } = render(<TestAccordion />);
    expect(queryByText("Panel 1")).toBeNull();

    fireEvent.press(getByText("Trigger 1"));
    expect(getByText("Panel 1")).toBeTruthy();
  });

  it("single-expand: only one panel open at a time", () => {
    const { getByText, queryByText } = render(
      <TestAccordion defaultExpandedKeys={["item1"]} />,
    );

    fireEvent.press(getByText("Trigger 2"));
    expect(queryByText("Panel 1")).toBeNull();
    expect(getByText("Panel 2")).toBeTruthy();
  });

  it("multi-expand: multiple panels open", () => {
    const { getByText } = render(<TestAccordion allowMultiple />);

    fireEvent.press(getByText("Trigger 1"));
    fireEvent.press(getByText("Trigger 2"));

    expect(getByText("Panel 1")).toBeTruthy();
    expect(getByText("Panel 2")).toBeTruthy();
  });

  it("calls onExpandedKeysChange", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <TestAccordion onExpandedKeysChange={onChange} />,
    );
    fireEvent.press(getByText("Trigger 1"));
    expect(onChange).toHaveBeenCalledWith(["item1"]);
  });
});
