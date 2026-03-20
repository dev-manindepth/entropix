import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { Tabs, TabList, Tab, TabPanel } from "../../components/tabs/index.js";

function TestTabs(props: { defaultSelectedKey?: string; onSelectedKeyChange?: (key: string) => void }) {
  return (
    <Tabs defaultSelectedKey={props.defaultSelectedKey ?? "tab1"} onSelectedKeyChange={props.onSelectedKeyChange}>
      <TabList>
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2">Tab 2</Tab>
        <Tab value="tab3">Tab 3</Tab>
      </TabList>
      <TabPanel value="tab1">Panel 1 content</TabPanel>
      <TabPanel value="tab2">Panel 2 content</TabPanel>
      <TabPanel value="tab3">Panel 3 content</TabPanel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("renders tablist with correct role", () => {
    const { getByRole } = render(<TestTabs />);
    expect(getByRole("tablist")).toBeTruthy();
  });

  it("renders tabs with correct role", () => {
    const { getAllByRole } = render(<TestTabs />);
    expect(getAllByRole("tab")).toHaveLength(3);
  });

  it("selected tab has aria-selected=true", () => {
    const { getAllByRole } = render(<TestTabs defaultSelectedKey="tab1" />);
    const tabs = getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
  });

  it("clicking tab selects it and shows panel", () => {
    const { getAllByRole, getByText, queryByText } = render(<TestTabs />);

    expect(getByText("Panel 1 content")).toBeTruthy();
    expect(queryByText("Panel 2 content")).toBeNull();

    fireEvent.click(getAllByRole("tab")[1]!);
    expect(queryByText("Panel 1 content")).toBeNull();
    expect(getByText("Panel 2 content")).toBeTruthy();
  });

  it("calls onSelectedKeyChange when tab is clicked", () => {
    const onChange = vi.fn();
    const { getAllByRole } = render(<TestTabs onSelectedKeyChange={onChange} />);

    fireEvent.click(getAllByRole("tab")[1]!);
    expect(onChange).toHaveBeenCalledWith("tab2");
  });

  it("tabpanel has correct role and aria-labelledby", () => {
    const { getByRole } = render(<TestTabs />);
    const panel = getByRole("tabpanel");
    expect(panel).toHaveAttribute("aria-labelledby");
  });

  it("selected tab has tabIndex=0, others have tabIndex=-1", () => {
    const { getAllByRole } = render(<TestTabs defaultSelectedKey="tab2" />);
    const tabs = getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("tabindex", "-1");
    expect(tabs[1]).toHaveAttribute("tabindex", "0");
    expect(tabs[2]).toHaveAttribute("tabindex", "-1");
  });
});
