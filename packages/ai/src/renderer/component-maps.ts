import type { ComponentMap } from "./types.js";

// ── Web component name → export name mappings ────────────────────────────

const WEB_REACT_MAP: Record<string, string> = {
  // Action
  Button: "Button",
  Toggle: "Toggle",

  // Input
  Input: "Input",
  Textarea: "Textarea",
  Checkbox: "Checkbox",
  Switch: "Switch",
  RadioGroup: "RadioGroup",
  RadioItem: "RadioItem",
  Select: "Select",
  SelectTrigger: "SelectTrigger",
  SelectContent: "SelectContent",
  SelectOption: "SelectOption",
  DatePicker: "DatePicker",
  Calendar: "Calendar",

  // Display
  Breadcrumb: "Breadcrumb",
  BreadcrumbItem: "BreadcrumbItem",
  Pagination: "Pagination",
  Toast: "Toast",
  ToastProvider: "ToastProvider",

  // Overlay
  Dialog: "Dialog",
  DialogTrigger: "DialogTrigger",
  DialogOverlay: "DialogOverlay",
  DialogContent: "DialogContent",
  DialogTitle: "DialogTitle",
  DialogDescription: "DialogDescription",
  DialogClose: "DialogClose",
  Popover: "Popover",
  PopoverTrigger: "PopoverTrigger",
  PopoverContent: "PopoverContent",
  Tooltip: "Tooltip",
  Menu: "Menu",
  MenuTrigger: "MenuTrigger",
  MenuContent: "MenuContent",
  MenuItem: "MenuItem",

  // Navigation
  Tabs: "Tabs",
  TabList: "TabList",
  Tab: "Tab",
  TabPanel: "TabPanel",
  Accordion: "Accordion",
  AccordionItem: "AccordionItem",
  AccordionTrigger: "AccordionTrigger",
  AccordionPanel: "AccordionPanel",

  // Layout
  Stack: "Stack",
  Inline: "Inline",
  Container: "Container",
  Divider: "Divider",
};

const WEB_DATA_MAP: Record<string, string> = {
  // Data
  DataTable: "DataTable",
  ChartContainer: "ChartContainer",
  XAxis: "XAxis",
  YAxis: "YAxis",
  ChartTooltip: "ChartTooltip",
  ChartLegend: "ChartLegend",
  BarChart: "BarChart",
  LineChart: "LineChart",
  AreaChart: "AreaChart",
  PieChart: "PieChart",
};

// ── Native component name → export name mappings ─────────────────────────

const NATIVE_REACT_MAP: Record<string, string> = {
  Button: "Button",
  Toggle: "Toggle",
  Input: "Input",
  Textarea: "Textarea",
  Checkbox: "Checkbox",
  Switch: "Switch",
  RadioGroup: "RadioGroup",
  RadioItem: "RadioItem",
  Select: "Select",
  SelectTrigger: "SelectTrigger",
  SelectContent: "SelectContent",
  SelectOption: "SelectOption",
  DatePicker: "DatePicker",
  Calendar: "Calendar",
  Breadcrumb: "Breadcrumb",
  BreadcrumbItem: "BreadcrumbItem",
  Pagination: "Pagination",
  Toast: "Toast",
  ToastProvider: "ToastProvider",
  Dialog: "Dialog",
  DialogTrigger: "DialogTrigger",
  DialogOverlay: "DialogOverlay",
  DialogContent: "DialogContent",
  DialogTitle: "DialogTitle",
  DialogDescription: "DialogDescription",
  DialogClose: "DialogClose",
  Popover: "Popover",
  PopoverTrigger: "PopoverTrigger",
  PopoverContent: "PopoverContent",
  Tooltip: "Tooltip",
  Menu: "Menu",
  MenuTrigger: "MenuTrigger",
  MenuContent: "MenuContent",
  MenuItem: "MenuItem",
  Tabs: "Tabs",
  TabList: "TabList",
  Tab: "Tab",
  TabPanel: "TabPanel",
  Accordion: "Accordion",
  AccordionItem: "AccordionItem",
  AccordionTrigger: "AccordionTrigger",
  AccordionPanel: "AccordionPanel",
  Stack: "Stack",
  Inline: "Inline",
  Container: "Container",
  Divider: "Divider",
};

const NATIVE_DATA_MAP: Record<string, string> = {
  DataTable: "DataTable",
  ChartContainer: "ChartContainer",
  XAxis: "XAxis",
  YAxis: "YAxis",
  ChartTooltip: "ChartTooltip",
  ChartLegend: "ChartLegend",
  BarChart: "BarChart",
  LineChart: "LineChart",
  AreaChart: "AreaChart",
  PieChart: "PieChart",
};

// ── Factory helpers ──────────────────────────────────────────────────────

function buildMap(
  moduleExports: Record<string, unknown>,
  nameMap: Record<string, string>,
): ComponentMap {
  const map: ComponentMap = {};
  for (const [componentName, exportName] of Object.entries(nameMap)) {
    const component = moduleExports[exportName];
    if (typeof component === "function" || typeof component === "object") {
      map[componentName] = component as React.ComponentType<unknown>;
    }
  }
  return map;
}

/**
 * Creates a `ComponentMap` from `@entropix/react` and `@entropix/data`
 * package exports.
 *
 * Usage:
 * ```ts
 * import * as entropixReact from "@entropix/react";
 * import * as entropixData from "@entropix/data";
 *
 * const components = createWebComponentMap(entropixReact, entropixData);
 * ```
 */
export function createWebComponentMap(
  entropixReact: Record<string, unknown>,
  entropixData: Record<string, unknown>,
): ComponentMap {
  return {
    ...buildMap(entropixReact, WEB_REACT_MAP),
    ...buildMap(entropixData, WEB_DATA_MAP),
  };
}

/**
 * Creates a `ComponentMap` from `@entropix/react-native` and
 * `@entropix/data-native` package exports.
 *
 * Usage:
 * ```ts
 * import * as entropixRN from "@entropix/react-native";
 * import * as entropixDataNative from "@entropix/data-native";
 *
 * const components = createNativeComponentMap(entropixRN, entropixDataNative);
 * ```
 */
export function createNativeComponentMap(
  entropixReactNative: Record<string, unknown>,
  entropixDataNative: Record<string, unknown>,
): ComponentMap {
  return {
    ...buildMap(entropixReactNative, NATIVE_REACT_MAP),
    ...buildMap(entropixDataNative, NATIVE_DATA_MAP),
  };
}
