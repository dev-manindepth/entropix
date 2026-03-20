import React from "react";
import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { Tabs, TabList, Tab, TabPanel } from "../../components/tabs/index";

function TestTabs(props: {
  defaultSelectedKey?: string;
  onSelectedKeyChange?: (key: string) => void;
}) {
  return (
    <Tabs defaultSelectedKey={props.defaultSelectedKey ?? "tab1"} onSelectedKeyChange={props.onSelectedKeyChange}>
      <TabList>
        <Tab value="tab1">
          <Text>Tab 1</Text>
        </Tab>
        <Tab value="tab2">
          <Text>Tab 2</Text>
        </Tab>
      </TabList>
      <TabPanel value="tab1">
        <Text>Panel 1</Text>
      </TabPanel>
      <TabPanel value="tab2">
        <Text>Panel 2</Text>
      </TabPanel>
    </Tabs>
  );
}

describe("Tabs (RN)", () => {
  it("renders tabs with correct role", () => {
    const { getAllByRole } = render(<TestTabs />);
    expect(getAllByRole("tab")).toHaveLength(2);
  });

  it("selected tab shows its panel", () => {
    const { getByText, queryByText } = render(<TestTabs />);
    expect(getByText("Panel 1")).toBeTruthy();
    expect(queryByText("Panel 2")).toBeNull();
  });

  it("pressing tab selects it", () => {
    const onChange = jest.fn();
    const { getByText } = render(<TestTabs onSelectedKeyChange={onChange} />);

    fireEvent.press(getByText("Tab 2"));
    expect(onChange).toHaveBeenCalledWith("tab2");
  });

  it("selected tab has accessibilityState.selected=true", () => {
    const { getAllByRole } = render(<TestTabs defaultSelectedKey="tab1" />);
    const tabs = getAllByRole("tab");
    expect(tabs[0]!.props.accessibilityState?.selected).toBe(true);
    expect(tabs[1]!.props.accessibilityState?.selected).toBe(false);
  });
});
