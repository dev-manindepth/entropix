import type { ComponentRegistry } from "./types.js";

export const defaultRegistry: ComponentRegistry = {
  version: "1.0.0",
  categories: {
    action: "Interactive elements that trigger actions (buttons, toggles)",
    input: "Form elements for user data entry",
    display: "Components for presenting structured content",
    overlay: "Floating layers and modals",
    navigation: "Wayfinding and pagination components",
    data: "Data visualization and tabular display",
    layout: "Structural components for arranging content",
    feedback: "User notification and status components",
  },
  components: {
    // ─── Layout ───────────────────────────────────────────────
    Stack: {
      name: "Stack",
      description: "Vertical stack layout with configurable gap and alignment",
      category: "layout",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      props: [
        {
          name: "gap",
          type: '"none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl"',
          required: false,
          description: "Spacing between children",
          defaultValue: "md",
          allowedValues: ["none", "xs", "sm", "md", "lg", "xl", "2xl"],
        },
        {
          name: "align",
          type: '"start" | "center" | "end" | "stretch"',
          required: false,
          description: "Cross-axis alignment of children",
          defaultValue: "stretch",
          allowedValues: ["start", "center", "end", "stretch"],
        },
        {
          name: "fullWidth",
          type: "boolean",
          required: false,
          description: "Whether the stack takes full available width",
          defaultValue: false,
        },
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Stack content",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Basic vertical stack",
          spec: {
            component: "Stack",
            props: { gap: "md" },
            children: [
              { component: "Button", children: "First" },
              { component: "Button", children: "Second" },
            ],
          },
        },
      ],
    },

    Inline: {
      name: "Inline",
      description: "Horizontal inline layout with gap, alignment, and wrapping",
      category: "layout",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      props: [
        {
          name: "gap",
          type: '"none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl"',
          required: false,
          description: "Spacing between children",
          defaultValue: "md",
          allowedValues: ["none", "xs", "sm", "md", "lg", "xl", "2xl"],
        },
        {
          name: "align",
          type: '"start" | "center" | "end" | "stretch"',
          required: false,
          description: "Cross-axis alignment",
          defaultValue: "center",
          allowedValues: ["start", "center", "end", "stretch"],
        },
        {
          name: "justify",
          type: '"start" | "center" | "end" | "between" | "around"',
          required: false,
          description: "Main-axis justification",
          defaultValue: "start",
          allowedValues: ["start", "center", "end", "between", "around"],
        },
        {
          name: "wrap",
          type: "boolean",
          required: false,
          description: "Whether children should wrap to next line",
          defaultValue: false,
        },
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Inline content",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Inline button group",
          spec: {
            component: "Inline",
            props: { gap: "sm" },
            children: [
              { component: "Button", props: { variant: "primary" }, children: "Save" },
              { component: "Button", props: { variant: "outline" }, children: "Cancel" },
            ],
          },
        },
      ],
    },

    Container: {
      name: "Container",
      description: "Centered container with max-width constraint",
      category: "layout",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      props: [
        {
          name: "maxWidth",
          type: '"xs" | "sm" | "md" | "lg" | "xl" | "full"',
          required: false,
          description: "Maximum width of the container",
          defaultValue: "lg",
          allowedValues: ["xs", "sm", "md", "lg", "xl", "full"],
        },
        {
          name: "center",
          type: "boolean",
          required: false,
          description: "Whether to center the container horizontally",
          defaultValue: true,
        },
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Container content",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Centered page container",
          spec: {
            component: "Container",
            props: { maxWidth: "md", center: true },
            children: [{ component: "Stack", children: "Page content here" }],
          },
        },
      ],
    },

    Divider: {
      name: "Divider",
      description: "Visual separator between content sections",
      category: "layout",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      props: [
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          required: false,
          description: "Direction of the divider",
          defaultValue: "horizontal",
          allowedValues: ["horizontal", "vertical"],
        },
        {
          name: "spacing",
          type: '"sm" | "md" | "lg"',
          required: false,
          description: "Margin around the divider",
          defaultValue: "md",
          allowedValues: ["sm", "md", "lg"],
        },
      ],
      examples: [
        {
          title: "Horizontal divider",
          spec: { component: "Divider", props: { orientation: "horizontal", spacing: "md" } },
        },
      ],
    },

    // ─── Action ───────────────────────────────────────────────
    Button: {
      name: "Button",
      description: "Interactive button for triggering actions",
      category: "action",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      props: [
        {
          name: "variant",
          type: '"primary" | "secondary" | "outline" | "ghost" | "danger"',
          required: false,
          description: "Visual style variant",
          defaultValue: "primary",
          allowedValues: ["primary", "secondary", "outline", "ghost", "danger"],
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          required: false,
          description: "Button size",
          defaultValue: "md",
          allowedValues: ["sm", "md", "lg"],
        },
        {
          name: "disabled",
          type: "boolean",
          required: false,
          description: "Whether the button is disabled",
          defaultValue: false,
        },
        {
          name: "loading",
          type: "boolean",
          required: false,
          description: "Whether to show a loading spinner",
          defaultValue: false,
        },
        {
          name: "onPress",
          type: "() => void",
          required: false,
          description: "Callback fired when the button is pressed. $action",
        },
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Button label content",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Primary button",
          spec: {
            component: "Button",
            props: { variant: "primary", size: "md" },
            children: "Submit",
          },
        },
      ],
    },

    Toggle: {
      name: "Toggle",
      description: "Toggleable button with pressed/unpressed state",
      category: "action",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      props: [
        {
          name: "checked",
          type: "boolean",
          required: false,
          description: "Controlled checked state",
        },
        {
          name: "defaultChecked",
          type: "boolean",
          required: false,
          description: "Initial checked state (uncontrolled)",
          defaultValue: false,
        },
        {
          name: "onChange",
          type: "(checked: boolean) => void",
          required: false,
          description: "Callback fired when toggle state changes. $action",
        },
        {
          name: "disabled",
          type: "boolean",
          required: false,
          description: "Whether the toggle is disabled",
          defaultValue: false,
        },
        {
          name: "label",
          type: "string",
          required: false,
          description: "Accessible label for the toggle",
        },
        {
          name: "children",
          type: "ReactNode",
          required: false,
          description: "Toggle content",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Basic toggle",
          spec: {
            component: "Toggle",
            props: { defaultChecked: false, label: "Bold" },
            children: "B",
          },
        },
      ],
    },

    Switch: {
      name: "Switch",
      description: "On/off switch control",
      category: "action",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      props: [
        {
          name: "checked",
          type: "boolean",
          required: false,
          description: "Controlled checked state",
        },
        {
          name: "defaultChecked",
          type: "boolean",
          required: false,
          description: "Initial checked state (uncontrolled)",
          defaultValue: false,
        },
        {
          name: "onChange",
          type: "(checked: boolean) => void",
          required: false,
          description: "Callback fired when switch state changes. $action",
        },
        {
          name: "disabled",
          type: "boolean",
          required: false,
          description: "Whether the switch is disabled",
          defaultValue: false,
        },
        {
          name: "label",
          type: "string",
          required: false,
          description: "Accessible label for the switch",
        },
      ],
      examples: [
        {
          title: "Switch with label",
          spec: {
            component: "Switch",
            props: { defaultChecked: true, label: "Enable notifications" },
          },
        },
      ],
    },

    // ─── Input ────────────────────────────────────────────────
    Input: {
      name: "Input",
      description: "Single-line text input field",
      category: "input",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      props: [
        { name: "label", type: "string", required: false, description: "Field label" },
        { name: "value", type: "string", required: false, description: "Controlled value" },
        {
          name: "defaultValue",
          type: "string",
          required: false,
          description: "Initial value (uncontrolled)",
        },
        {
          name: "onChange",
          type: "(value: string) => void",
          required: false,
          description: "Callback fired when value changes. $action",
        },
        {
          name: "placeholder",
          type: "string",
          required: false,
          description: "Placeholder text",
        },
        {
          name: "helperText",
          type: "string",
          required: false,
          description: "Hint text below the input",
        },
        {
          name: "errorMessage",
          type: "string",
          required: false,
          description: "Error message to display",
        },
        {
          name: "disabled",
          type: "boolean",
          required: false,
          description: "Whether the input is disabled",
          defaultValue: false,
        },
        {
          name: "readOnly",
          type: "boolean",
          required: false,
          description: "Whether the input is read-only",
          defaultValue: false,
        },
        {
          name: "required",
          type: "boolean",
          required: false,
          description: "Whether the input is required",
          defaultValue: false,
        },
        {
          name: "variant",
          type: '"default" | "filled"',
          required: false,
          description: "Visual variant",
          defaultValue: "default",
          allowedValues: ["default", "filled"],
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          required: false,
          description: "Input size",
          defaultValue: "md",
          allowedValues: ["sm", "md", "lg"],
        },
        {
          name: "type",
          type: '"text" | "email" | "password" | "number" | "tel" | "url"',
          required: false,
          description: "HTML input type",
          defaultValue: "text",
          allowedValues: ["text", "email", "password", "number", "tel", "url"],
        },
      ],
      examples: [
        {
          title: "Email input with validation",
          spec: {
            component: "Input",
            props: {
              label: "Email",
              type: "email",
              placeholder: "you@example.com",
              required: true,
            },
          },
        },
      ],
    },

    Textarea: {
      name: "Textarea",
      description: "Multi-line text input area",
      category: "input",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      props: [
        { name: "label", type: "string", required: false, description: "Field label" },
        { name: "value", type: "string", required: false, description: "Controlled value" },
        {
          name: "defaultValue",
          type: "string",
          required: false,
          description: "Initial value (uncontrolled)",
        },
        {
          name: "onChange",
          type: "(value: string) => void",
          required: false,
          description: "Callback fired when value changes. $action",
        },
        {
          name: "placeholder",
          type: "string",
          required: false,
          description: "Placeholder text",
        },
        {
          name: "helperText",
          type: "string",
          required: false,
          description: "Hint text below the textarea",
        },
        {
          name: "errorMessage",
          type: "string",
          required: false,
          description: "Error message to display",
        },
        {
          name: "disabled",
          type: "boolean",
          required: false,
          description: "Whether the textarea is disabled",
          defaultValue: false,
        },
        {
          name: "readOnly",
          type: "boolean",
          required: false,
          description: "Whether the textarea is read-only",
          defaultValue: false,
        },
        {
          name: "required",
          type: "boolean",
          required: false,
          description: "Whether the textarea is required",
          defaultValue: false,
        },
        {
          name: "variant",
          type: '"default" | "filled"',
          required: false,
          description: "Visual variant",
          defaultValue: "default",
          allowedValues: ["default", "filled"],
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          required: false,
          description: "Textarea size",
          defaultValue: "md",
          allowedValues: ["sm", "md", "lg"],
        },
        {
          name: "rows",
          type: "number",
          required: false,
          description: "Number of visible text rows",
          defaultValue: 3,
        },
      ],
      examples: [
        {
          title: "Comment textarea",
          spec: {
            component: "Textarea",
            props: { label: "Comment", placeholder: "Write a comment...", rows: 4 },
          },
        },
      ],
    },

    Checkbox: {
      name: "Checkbox",
      description: "Checkbox input for boolean selections",
      category: "input",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      props: [
        {
          name: "checked",
          type: "boolean",
          required: false,
          description: "Controlled checked state",
        },
        {
          name: "defaultChecked",
          type: "boolean",
          required: false,
          description: "Initial checked state (uncontrolled)",
          defaultValue: false,
        },
        {
          name: "onChange",
          type: "(checked: boolean) => void",
          required: false,
          description: "Callback fired when checked state changes. $action",
        },
        {
          name: "disabled",
          type: "boolean",
          required: false,
          description: "Whether the checkbox is disabled",
          defaultValue: false,
        },
        {
          name: "indeterminate",
          type: "boolean",
          required: false,
          description: "Whether the checkbox shows an indeterminate state",
          defaultValue: false,
        },
        {
          name: "children",
          type: "ReactNode",
          required: false,
          description: "Label text for the checkbox",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Terms checkbox",
          spec: {
            component: "Checkbox",
            props: { defaultChecked: false },
            children: "I agree to the terms",
          },
        },
      ],
    },

    RadioGroup: {
      name: "RadioGroup",
      description: "Group of mutually exclusive radio options",
      category: "input",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      props: [
        { name: "label", type: "string", required: false, description: "Group label" },
        {
          name: "value",
          type: "string",
          required: false,
          description: "Controlled selected value",
        },
        {
          name: "onChange",
          type: "(value: string) => void",
          required: false,
          description: "Callback fired when selection changes. $action",
        },
        {
          name: "disabled",
          type: "boolean",
          required: false,
          description: "Whether all radios are disabled",
          defaultValue: false,
        },
      ],
      compoundChildren: [
        {
          name: "RadioItem",
          required: true,
          multiple: true,
          description: "Individual radio option within the group",
        },
      ],
      examples: [
        {
          title: "Size selection",
          spec: {
            component: "RadioGroup",
            props: { label: "Size", value: "md" },
            children: [
              { component: "RadioItem", props: { value: "sm" }, children: "Small" },
              { component: "RadioItem", props: { value: "md" }, children: "Medium" },
              { component: "RadioItem", props: { value: "lg" }, children: "Large" },
            ],
          },
        },
      ],
    },

    RadioItem: {
      name: "RadioItem",
      description: "Individual radio option within a RadioGroup",
      category: "input",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "RadioGroup",
      props: [
        {
          name: "value",
          type: "string",
          required: true,
          description: "Value of this radio option",
        },
        {
          name: "disabled",
          type: "boolean",
          required: false,
          description: "Whether this option is disabled",
          defaultValue: false,
        },
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Label for the radio option",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Radio item",
          spec: { component: "RadioItem", props: { value: "option1" }, children: "Option 1" },
        },
      ],
    },

    Select: {
      name: "Select",
      description: "Dropdown selection component",
      category: "input",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      props: [
        { name: "label", type: "string", required: false, description: "Select label" },
        {
          name: "value",
          type: "string",
          required: false,
          description: "Controlled selected value",
        },
        {
          name: "onChange",
          type: "(value: string) => void",
          required: false,
          description: "Callback fired when selection changes. $action",
        },
        {
          name: "disabled",
          type: "boolean",
          required: false,
          description: "Whether the select is disabled",
          defaultValue: false,
        },
      ],
      compoundChildren: [
        {
          name: "SelectTrigger",
          required: false,
          multiple: false,
          description: "Trigger element that opens the dropdown",
        },
        {
          name: "SelectContent",
          required: false,
          multiple: false,
          description: "Dropdown content container",
        },
      ],
      examples: [
        {
          title: "Country select",
          spec: {
            component: "Select",
            props: { label: "Country" },
            children: [
              { component: "SelectTrigger", props: { placeholder: "Choose a country" } },
              {
                component: "SelectContent",
                children: [
                  { component: "SelectOption", props: { value: "us" }, children: "United States" },
                  { component: "SelectOption", props: { value: "uk" }, children: "United Kingdom" },
                ],
              },
            ],
          },
        },
      ],
    },

    SelectTrigger: {
      name: "SelectTrigger",
      description: "Trigger element that opens the Select dropdown",
      category: "input",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      parentComponent: "Select",
      props: [
        {
          name: "placeholder",
          type: "string",
          required: false,
          description: "Placeholder text when no value is selected",
        },
      ],
      examples: [
        {
          title: "Select trigger",
          spec: {
            component: "SelectTrigger",
            props: { placeholder: "Select an option" },
          },
        },
      ],
    },

    SelectContent: {
      name: "SelectContent",
      description: "Dropdown content container for Select options",
      category: "input",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      parentComponent: "Select",
      compoundChildren: [
        {
          name: "SelectOption",
          required: false,
          multiple: true,
          description: "Individual selectable option",
        },
      ],
      props: [],
      examples: [
        {
          title: "Select content with options",
          spec: {
            component: "SelectContent",
            children: [
              { component: "SelectOption", props: { value: "a" }, children: "Option A" },
            ],
          },
        },
      ],
    },

    SelectOption: {
      name: "SelectOption",
      description: "Individual option within a Select dropdown",
      category: "input",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "SelectContent",
      props: [
        {
          name: "value",
          type: "string",
          required: true,
          description: "Value of this option",
        },
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Display label for the option",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Select option",
          spec: { component: "SelectOption", props: { value: "foo" }, children: "Foo" },
        },
      ],
    },

    DatePicker: {
      name: "DatePicker",
      description: "Date selection input with calendar dropdown",
      category: "input",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      props: [
        { name: "label", type: "string", required: false, description: "Field label" },
        {
          name: "placeholder",
          type: "string",
          required: false,
          description: "Placeholder text",
        },
        {
          name: "value",
          type: "Date | string",
          required: false,
          description: "Controlled date value",
        },
        {
          name: "onChange",
          type: "(date: Date) => void",
          required: false,
          description: "Callback fired when date changes. $action",
        },
        {
          name: "minDate",
          type: "Date | string",
          required: false,
          description: "Minimum selectable date",
        },
        {
          name: "maxDate",
          type: "Date | string",
          required: false,
          description: "Maximum selectable date",
        },
        {
          name: "format",
          type: "string",
          required: false,
          description: "Date display format string",
          defaultValue: "MM/dd/yyyy",
        },
        {
          name: "disabled",
          type: "boolean",
          required: false,
          description: "Whether the date picker is disabled",
          defaultValue: false,
        },
        {
          name: "errorMessage",
          type: "string",
          required: false,
          description: "Error message to display",
        },
      ],
      examples: [
        {
          title: "Birth date picker",
          spec: {
            component: "DatePicker",
            props: { label: "Date of Birth", placeholder: "Select date" },
          },
        },
      ],
    },

    Calendar: {
      name: "Calendar",
      description: "Standalone calendar for date selection",
      category: "input",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      props: [
        {
          name: "value",
          type: "Date | string",
          required: false,
          description: "Controlled selected date",
        },
        {
          name: "onChange",
          type: "(date: Date) => void",
          required: false,
          description: "Callback fired when date is selected. $action",
        },
        {
          name: "minDate",
          type: "Date | string",
          required: false,
          description: "Minimum selectable date",
        },
        {
          name: "maxDate",
          type: "Date | string",
          required: false,
          description: "Maximum selectable date",
        },
      ],
      examples: [
        {
          title: "Basic calendar",
          spec: { component: "Calendar" },
        },
      ],
    },

    // ─── Display ──────────────────────────────────────────────
    Tabs: {
      name: "Tabs",
      description: "Tabbed content switcher with tab list and panels",
      category: "display",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      props: [
        {
          name: "defaultSelectedKey",
          type: "string",
          required: false,
          description: "Initially selected tab key",
        },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          required: false,
          description: "Tab bar orientation",
          defaultValue: "horizontal",
          allowedValues: ["horizontal", "vertical"],
        },
        {
          name: "activationMode",
          type: '"automatic" | "manual"',
          required: false,
          description: "Whether tabs activate on focus or on click",
          defaultValue: "automatic",
          allowedValues: ["automatic", "manual"],
        },
      ],
      compoundChildren: [
        {
          name: "TabList",
          required: false,
          multiple: false,
          description: "Container for tab triggers",
        },
        {
          name: "TabPanel",
          required: false,
          multiple: true,
          description: "Content panel associated with a tab",
        },
      ],
      examples: [
        {
          title: "Basic tabs",
          spec: {
            component: "Tabs",
            props: { defaultSelectedKey: "tab1" },
            children: [
              {
                component: "TabList",
                children: [
                  { component: "Tab", props: { value: "tab1" }, children: "Tab 1" },
                  { component: "Tab", props: { value: "tab2" }, children: "Tab 2" },
                ],
              },
              { component: "TabPanel", props: { value: "tab1" }, children: "Content 1" },
              { component: "TabPanel", props: { value: "tab2" }, children: "Content 2" },
            ],
          },
        },
      ],
    },

    TabList: {
      name: "TabList",
      description: "Container for Tab triggers within Tabs",
      category: "display",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      parentComponent: "Tabs",
      compoundChildren: [
        { name: "Tab", required: false, multiple: true, description: "Individual tab trigger" },
      ],
      props: [],
      examples: [
        {
          title: "Tab list",
          spec: {
            component: "TabList",
            children: [{ component: "Tab", props: { value: "t1" }, children: "First" }],
          },
        },
      ],
    },

    Tab: {
      name: "Tab",
      description: "Individual tab trigger within a TabList",
      category: "display",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "TabList",
      props: [
        {
          name: "value",
          type: "string",
          required: true,
          description: "Unique key matching a TabPanel",
        },
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Tab label",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Tab trigger",
          spec: { component: "Tab", props: { value: "info" }, children: "Info" },
        },
      ],
    },

    TabPanel: {
      name: "TabPanel",
      description: "Content panel associated with a Tab",
      category: "display",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "Tabs",
      props: [
        {
          name: "value",
          type: "string",
          required: true,
          description: "Key matching the associated Tab",
        },
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Panel content",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Tab panel",
          spec: { component: "TabPanel", props: { value: "info" }, children: "Panel content" },
        },
      ],
    },

    Accordion: {
      name: "Accordion",
      description: "Collapsible content sections",
      category: "display",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      props: [
        {
          name: "allowMultiple",
          type: "boolean",
          required: false,
          description: "Whether multiple sections can be open at once",
          defaultValue: false,
        },
        {
          name: "defaultValue",
          type: "string | string[]",
          required: false,
          description: "Initially open section(s)",
        },
      ],
      compoundChildren: [
        {
          name: "AccordionItem",
          required: false,
          multiple: true,
          description: "Individual collapsible section",
        },
      ],
      examples: [
        {
          title: "FAQ accordion",
          spec: {
            component: "Accordion",
            props: { allowMultiple: false },
            children: [
              {
                component: "AccordionItem",
                props: { value: "q1" },
                children: [
                  { component: "AccordionTrigger", children: "What is Entropix?" },
                  {
                    component: "AccordionPanel",
                    children: "A cross-platform design system.",
                  },
                ],
              },
            ],
          },
        },
      ],
    },

    AccordionItem: {
      name: "AccordionItem",
      description: "Individual collapsible section within an Accordion",
      category: "display",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      parentComponent: "Accordion",
      props: [
        {
          name: "value",
          type: "string",
          required: true,
          description: "Unique key for this section",
        },
      ],
      compoundChildren: [
        {
          name: "AccordionTrigger",
          required: false,
          multiple: false,
          description: "Clickable header that toggles the section",
        },
        {
          name: "AccordionPanel",
          required: false,
          multiple: false,
          description: "Collapsible content area",
        },
      ],
      examples: [
        {
          title: "Accordion item",
          spec: {
            component: "AccordionItem",
            props: { value: "section1" },
            children: [
              { component: "AccordionTrigger", children: "Section 1" },
              { component: "AccordionPanel", children: "Content" },
            ],
          },
        },
      ],
    },

    AccordionTrigger: {
      name: "AccordionTrigger",
      description: "Clickable header that toggles an AccordionItem",
      category: "display",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "AccordionItem",
      props: [
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Trigger label content",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Accordion trigger",
          spec: { component: "AccordionTrigger", children: "Click to expand" },
        },
      ],
    },

    AccordionPanel: {
      name: "AccordionPanel",
      description: "Collapsible content area within an AccordionItem",
      category: "display",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "AccordionItem",
      props: [
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Panel content",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Accordion panel",
          spec: { component: "AccordionPanel", children: "Hidden content here" },
        },
      ],
    },

    // ─── Overlay ──────────────────────────────────────────────
    Dialog: {
      name: "Dialog",
      description: "Modal dialog with trigger, overlay, and content",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      props: [
        {
          name: "isOpen",
          type: "boolean",
          required: false,
          description: "Controlled open state",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          required: false,
          description: "Initial open state (uncontrolled)",
          defaultValue: false,
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          required: false,
          description: "Callback fired when open state changes. $action",
        },
        {
          name: "modal",
          type: "boolean",
          required: false,
          description: "Whether the dialog is modal (traps focus)",
          defaultValue: true,
        },
        {
          name: "closeOnOverlayPress",
          type: "boolean",
          required: false,
          description: "Whether clicking the overlay closes the dialog",
          defaultValue: true,
        },
        {
          name: "closeOnEscape",
          type: "boolean",
          required: false,
          description: "Whether pressing Escape closes the dialog",
          defaultValue: true,
        },
      ],
      compoundChildren: [
        {
          name: "DialogTrigger",
          required: false,
          multiple: false,
          description: "Element that opens the dialog",
        },
        {
          name: "DialogOverlay",
          required: false,
          multiple: false,
          description: "Backdrop overlay behind the dialog",
        },
        {
          name: "DialogContent",
          required: false,
          multiple: false,
          description: "Main dialog content container",
        },
      ],
      examples: [
        {
          title: "Confirmation dialog",
          spec: {
            component: "Dialog",
            children: [
              {
                component: "DialogTrigger",
                children: { component: "Button", children: "Delete" },
              },
              {
                component: "DialogOverlay",
                children: {
                  component: "DialogContent",
                  children: [
                    { component: "DialogTitle", children: "Confirm Delete" },
                    { component: "DialogDescription", children: "This action cannot be undone." },
                    {
                      component: "DialogClose",
                      children: { component: "Button", children: "Cancel" },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },

    DialogTrigger: {
      name: "DialogTrigger",
      description: "Element that opens the Dialog",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "Dialog",
      props: [
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Trigger element",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Dialog trigger",
          spec: {
            component: "DialogTrigger",
            children: { component: "Button", children: "Open" },
          },
        },
      ],
    },

    DialogOverlay: {
      name: "DialogOverlay",
      description: "Backdrop overlay behind the Dialog",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      parentComponent: "Dialog",
      compoundChildren: [
        {
          name: "DialogContent",
          required: false,
          multiple: false,
          description: "Main dialog content container",
        },
      ],
      props: [],
      examples: [
        {
          title: "Dialog overlay",
          spec: {
            component: "DialogOverlay",
            children: { component: "DialogContent", children: "Content" },
          },
        },
      ],
    },

    DialogContent: {
      name: "DialogContent",
      description: "Main content container for Dialog",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      parentComponent: "Dialog",
      compoundChildren: [
        {
          name: "DialogTitle",
          required: false,
          multiple: false,
          description: "Dialog heading",
        },
        {
          name: "DialogDescription",
          required: false,
          multiple: false,
          description: "Dialog body text",
        },
        {
          name: "DialogClose",
          required: false,
          multiple: false,
          description: "Element that closes the dialog",
        },
      ],
      props: [],
      examples: [
        {
          title: "Dialog content",
          spec: {
            component: "DialogContent",
            children: [
              { component: "DialogTitle", children: "Title" },
              { component: "DialogDescription", children: "Description" },
            ],
          },
        },
      ],
    },

    DialogTitle: {
      name: "DialogTitle",
      description: "Heading for a Dialog",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "DialogContent",
      props: [
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Title text",
          isChildren: true,
        },
      ],
      examples: [
        { title: "Dialog title", spec: { component: "DialogTitle", children: "My Dialog" } },
      ],
    },

    DialogDescription: {
      name: "DialogDescription",
      description: "Body description text for a Dialog",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "DialogContent",
      props: [
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Description text",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Dialog description",
          spec: { component: "DialogDescription", children: "Are you sure?" },
        },
      ],
    },

    DialogClose: {
      name: "DialogClose",
      description: "Element that closes the Dialog when activated",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "DialogContent",
      props: [
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Close trigger element",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Dialog close button",
          spec: {
            component: "DialogClose",
            children: { component: "Button", props: { variant: "ghost" }, children: "Close" },
          },
        },
      ],
    },

    Menu: {
      name: "Menu",
      description: "Dropdown menu with trigger and menu items",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      props: [],
      compoundChildren: [
        {
          name: "MenuTrigger",
          required: false,
          multiple: false,
          description: "Element that opens the menu",
        },
        {
          name: "MenuContent",
          required: false,
          multiple: false,
          description: "Menu dropdown container",
        },
      ],
      examples: [
        {
          title: "Action menu",
          spec: {
            component: "Menu",
            children: [
              {
                component: "MenuTrigger",
                children: { component: "Button", children: "Actions" },
              },
              {
                component: "MenuContent",
                children: [
                  { component: "MenuItem", children: "Edit" },
                  { component: "MenuItem", children: "Delete" },
                ],
              },
            ],
          },
        },
      ],
    },

    MenuTrigger: {
      name: "MenuTrigger",
      description: "Element that opens the Menu",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "Menu",
      props: [
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Trigger element",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Menu trigger",
          spec: {
            component: "MenuTrigger",
            children: { component: "Button", children: "Menu" },
          },
        },
      ],
    },

    MenuContent: {
      name: "MenuContent",
      description: "Dropdown container for Menu items",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      parentComponent: "Menu",
      compoundChildren: [
        {
          name: "MenuItem",
          required: false,
          multiple: true,
          description: "Individual menu action item",
        },
      ],
      props: [],
      examples: [
        {
          title: "Menu content",
          spec: {
            component: "MenuContent",
            children: [{ component: "MenuItem", children: "Item" }],
          },
        },
      ],
    },

    MenuItem: {
      name: "MenuItem",
      description: "Individual action item within a Menu",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "MenuContent",
      props: [
        {
          name: "onSelect",
          type: "() => void",
          required: false,
          description: "Callback fired when this item is selected. $action",
        },
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Menu item label",
          isChildren: true,
        },
      ],
      examples: [
        { title: "Menu item", spec: { component: "MenuItem", children: "Edit" } },
      ],
    },

    Popover: {
      name: "Popover",
      description: "Floating content popover anchored to a trigger",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      props: [
        {
          name: "triggerMode",
          type: '"click" | "hover"',
          required: false,
          description: "How the popover is triggered",
          defaultValue: "click",
          allowedValues: ["click", "hover"],
        },
        {
          name: "placement",
          type: '"top" | "bottom" | "left" | "right"',
          required: false,
          description: "Preferred placement of the popover",
          defaultValue: "bottom",
          allowedValues: ["top", "bottom", "left", "right"],
        },
      ],
      compoundChildren: [
        {
          name: "PopoverTrigger",
          required: false,
          multiple: false,
          description: "Element that triggers the popover",
        },
        {
          name: "PopoverContent",
          required: false,
          multiple: false,
          description: "Popover body content",
        },
      ],
      examples: [
        {
          title: "Info popover",
          spec: {
            component: "Popover",
            props: { triggerMode: "click", placement: "bottom" },
            children: [
              {
                component: "PopoverTrigger",
                children: { component: "Button", props: { variant: "ghost" }, children: "Info" },
              },
              { component: "PopoverContent", children: "Additional information here." },
            ],
          },
        },
      ],
    },

    PopoverTrigger: {
      name: "PopoverTrigger",
      description: "Element that triggers a Popover",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "Popover",
      props: [
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Trigger element",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Popover trigger",
          spec: {
            component: "PopoverTrigger",
            children: { component: "Button", children: "Click me" },
          },
        },
      ],
    },

    PopoverContent: {
      name: "PopoverContent",
      description: "Body content of a Popover",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "Popover",
      props: [
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Popover content",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Popover content",
          spec: { component: "PopoverContent", children: "Some popover content" },
        },
      ],
    },

    Tooltip: {
      name: "Tooltip",
      description: "Hover tooltip that displays a text label",
      category: "overlay",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      props: [
        {
          name: "content",
          type: "string",
          required: true,
          description: "Tooltip text to display",
        },
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Trigger element that shows the tooltip on hover",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Button with tooltip",
          spec: {
            component: "Tooltip",
            props: { content: "Save your changes" },
            children: { component: "Button", children: "Save" },
          },
        },
      ],
    },

    // ─── Feedback ─────────────────────────────────────────────
    ToastProvider: {
      name: "ToastProvider",
      description: "Provider that manages toast notifications for the app",
      category: "feedback",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      props: [
        {
          name: "duration",
          type: "number",
          required: false,
          description: "Default duration in ms before toasts auto-dismiss",
          defaultValue: 5000,
        },
        {
          name: "maxToasts",
          type: "number",
          required: false,
          description: "Maximum number of visible toasts",
          defaultValue: 5,
        },
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Application content to wrap",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Toast provider wrapping app",
          spec: {
            component: "ToastProvider",
            props: { duration: 3000 },
            children: { component: "Stack", children: "App content" },
          },
        },
      ],
    },

    // ─── Navigation ───────────────────────────────────────────
    Breadcrumb: {
      name: "Breadcrumb",
      description: "Breadcrumb navigation trail",
      category: "navigation",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      props: [
        {
          name: "separator",
          type: "string",
          required: false,
          description: "Custom separator character between items",
          defaultValue: "/",
        },
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "BreadcrumbItem children",
          isChildren: true,
        },
      ],
      compoundChildren: [
        {
          name: "BreadcrumbItem",
          required: false,
          multiple: true,
          description: "Individual breadcrumb link",
        },
      ],
      examples: [
        {
          title: "Page breadcrumb",
          spec: {
            component: "Breadcrumb",
            props: { separator: "/" },
            children: [
              { component: "BreadcrumbItem", props: { href: "/" }, children: "Home" },
              { component: "BreadcrumbItem", props: { href: "/docs" }, children: "Docs" },
              { component: "BreadcrumbItem", children: "Current Page" },
            ],
          },
        },
      ],
    },

    BreadcrumbItem: {
      name: "BreadcrumbItem",
      description: "Individual breadcrumb link within a Breadcrumb",
      category: "navigation",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: true,
      parentComponent: "Breadcrumb",
      props: [
        {
          name: "href",
          type: "string",
          required: false,
          description: "Navigation URL (web)",
        },
        {
          name: "onPress",
          type: "() => void",
          required: false,
          description: "Callback for navigation (native). $action",
        },
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "Breadcrumb label",
          isChildren: true,
        },
      ],
      examples: [
        {
          title: "Breadcrumb item",
          spec: { component: "BreadcrumbItem", props: { href: "/home" }, children: "Home" },
        },
      ],
    },

    Pagination: {
      name: "Pagination",
      description: "Page navigation for paginated content",
      category: "navigation",
      platform: "both",
      package: "@entropix/react",
      acceptsChildren: false,
      props: [
        {
          name: "totalItems",
          type: "number",
          required: true,
          description: "Total number of items across all pages",
        },
        {
          name: "pageSize",
          type: "number",
          required: true,
          description: "Number of items per page",
        },
        {
          name: "currentPage",
          type: "number",
          required: true,
          description: "Current active page (1-indexed)",
        },
        {
          name: "onPageChange",
          type: "(page: number) => void",
          required: true,
          description: "Callback fired when page changes. $action",
        },
        {
          name: "siblingCount",
          type: "number",
          required: false,
          description: "Number of sibling pages shown around the current page",
          defaultValue: 1,
        },
      ],
      examples: [
        {
          title: "Basic pagination",
          spec: {
            component: "Pagination",
            props: { totalItems: 100, pageSize: 10, currentPage: 1 },
          },
        },
      ],
    },

    // ─── Data ─────────────────────────────────────────────────
    DataTable: {
      name: "DataTable",
      description: "Data table with sorting, filtering, and selection",
      category: "data",
      platform: "both",
      package: "@entropix/data",
      acceptsChildren: false,
      props: [
        {
          name: "data",
          type: "Record<string, unknown>[]",
          required: true,
          description: "Array of row data objects",
          isData: true,
        },
        {
          name: "columns",
          type: "ColumnDef[]",
          required: true,
          description: "Column definitions array",
        },
        {
          name: "pageSize",
          type: "number",
          required: false,
          description: "Number of rows per page",
          defaultValue: 10,
        },
        {
          name: "onSort",
          type: "(column: string, direction: 'asc' | 'desc') => void",
          required: false,
          description: "Callback fired when a column sort changes. $action",
        },
        {
          name: "onFilter",
          type: "(filters: Record<string, unknown>) => void",
          required: false,
          description: "Callback fired when filters change. $action",
        },
        {
          name: "selectable",
          type: "boolean",
          required: false,
          description: "Whether rows are selectable",
          defaultValue: false,
        },
        {
          name: "getRowKey",
          type: "(row: Record<string, unknown>) => string",
          required: false,
          description: "Function to derive a unique key for each row",
        },
      ],
      examples: [
        {
          title: "User table",
          spec: {
            component: "DataTable",
            props: {
              data: [
                { id: 1, name: "Alice", email: "alice@example.com" },
                { id: 2, name: "Bob", email: "bob@example.com" },
              ],
              columns: [
                { key: "name", header: "Name" },
                { key: "email", header: "Email" },
              ],
              pageSize: 10,
            },
          },
        },
      ],
    },

    BarChart: {
      name: "BarChart",
      description: "Bar chart for comparing categorical data",
      category: "data",
      platform: "both",
      package: "@entropix/data",
      acceptsChildren: false,
      props: [
        {
          name: "data",
          type: "ChartData",
          required: true,
          description: "Chart data with labels and datasets",
          isData: true,
        },
        {
          name: "height",
          type: "number",
          required: false,
          description: "Chart height in pixels",
          defaultValue: 300,
        },
        {
          name: "colors",
          type: "string[]",
          required: false,
          description: "Custom color palette for bars",
        },
        {
          name: "stacked",
          type: "boolean",
          required: false,
          description: "Whether bars are stacked",
          defaultValue: false,
        },
        {
          name: "showGrid",
          type: "boolean",
          required: false,
          description: "Whether to show grid lines",
          defaultValue: true,
        },
        {
          name: "showTooltip",
          type: "boolean",
          required: false,
          description: "Whether to show tooltips on hover",
          defaultValue: true,
        },
        {
          name: "showLegend",
          type: "boolean",
          required: false,
          description: "Whether to show the legend",
          defaultValue: true,
        },
      ],
      examples: [
        {
          title: "Monthly sales bar chart",
          spec: {
            component: "BarChart",
            props: {
              data: {
                labels: ["Jan", "Feb", "Mar"],
                datasets: [{ label: "Sales", values: [100, 200, 150] }],
              },
              height: 300,
            },
          },
        },
      ],
    },

    LineChart: {
      name: "LineChart",
      description: "Line chart for trend data over time",
      category: "data",
      platform: "both",
      package: "@entropix/data",
      acceptsChildren: false,
      props: [
        {
          name: "data",
          type: "ChartData",
          required: true,
          description: "Chart data with labels and datasets",
          isData: true,
        },
        {
          name: "height",
          type: "number",
          required: false,
          description: "Chart height in pixels",
          defaultValue: 300,
        },
        {
          name: "colors",
          type: "string[]",
          required: false,
          description: "Custom color palette for lines",
        },
        {
          name: "curved",
          type: "boolean",
          required: false,
          description: "Whether lines are curved (spline) or straight",
          defaultValue: true,
        },
        {
          name: "showPoints",
          type: "boolean",
          required: false,
          description: "Whether to show data point markers",
          defaultValue: true,
        },
        {
          name: "showGrid",
          type: "boolean",
          required: false,
          description: "Whether to show grid lines",
          defaultValue: true,
        },
        {
          name: "showTooltip",
          type: "boolean",
          required: false,
          description: "Whether to show tooltips on hover",
          defaultValue: true,
        },
        {
          name: "showLegend",
          type: "boolean",
          required: false,
          description: "Whether to show the legend",
          defaultValue: true,
        },
      ],
      examples: [
        {
          title: "Revenue trend",
          spec: {
            component: "LineChart",
            props: {
              data: {
                labels: ["Q1", "Q2", "Q3", "Q4"],
                datasets: [{ label: "Revenue", values: [1000, 1500, 1200, 1800] }],
              },
              height: 300,
              curved: true,
            },
          },
        },
      ],
    },

    AreaChart: {
      name: "AreaChart",
      description: "Area chart for showing volume over time",
      category: "data",
      platform: "both",
      package: "@entropix/data",
      acceptsChildren: false,
      props: [
        {
          name: "data",
          type: "ChartData",
          required: true,
          description: "Chart data with labels and datasets",
          isData: true,
        },
        {
          name: "height",
          type: "number",
          required: false,
          description: "Chart height in pixels",
          defaultValue: 300,
        },
        {
          name: "colors",
          type: "string[]",
          required: false,
          description: "Custom color palette for areas",
        },
        {
          name: "curved",
          type: "boolean",
          required: false,
          description: "Whether area boundaries are curved",
          defaultValue: true,
        },
        {
          name: "showGrid",
          type: "boolean",
          required: false,
          description: "Whether to show grid lines",
          defaultValue: true,
        },
        {
          name: "showTooltip",
          type: "boolean",
          required: false,
          description: "Whether to show tooltips on hover",
          defaultValue: true,
        },
        {
          name: "showLegend",
          type: "boolean",
          required: false,
          description: "Whether to show the legend",
          defaultValue: true,
        },
      ],
      examples: [
        {
          title: "Traffic area chart",
          spec: {
            component: "AreaChart",
            props: {
              data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                datasets: [{ label: "Visitors", values: [500, 800, 600, 900, 750] }],
              },
              height: 300,
            },
          },
        },
      ],
    },

    PieChart: {
      name: "PieChart",
      description: "Pie or donut chart for proportional data",
      category: "data",
      platform: "both",
      package: "@entropix/data",
      acceptsChildren: false,
      props: [
        {
          name: "data",
          type: "ChartDataPoint[]",
          required: true,
          description: "Array of data points with label and value",
          isData: true,
        },
        {
          name: "height",
          type: "number",
          required: false,
          description: "Chart height in pixels",
          defaultValue: 300,
        },
        {
          name: "colors",
          type: "string[]",
          required: false,
          description: "Custom color palette for slices",
        },
        {
          name: "innerRadiusRatio",
          type: "number",
          required: false,
          description: "Inner radius ratio for donut chart (0 = pie, 0-1 = donut)",
          defaultValue: 0,
        },
        {
          name: "innerRadius",
          type: "number",
          required: false,
          description: "Inner radius in pixels (alternative to ratio)",
        },
        {
          name: "showTooltip",
          type: "boolean",
          required: false,
          description: "Whether to show tooltips on hover",
          defaultValue: true,
        },
        {
          name: "showLegend",
          type: "boolean",
          required: false,
          description: "Whether to show the legend",
          defaultValue: true,
        },
      ],
      examples: [
        {
          title: "Browser share pie chart",
          spec: {
            component: "PieChart",
            props: {
              data: [
                { label: "Chrome", value: 65 },
                { label: "Firefox", value: 20 },
                { label: "Safari", value: 15 },
              ],
              height: 300,
            },
          },
        },
      ],
    },
  },
};
