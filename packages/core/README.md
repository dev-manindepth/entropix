# @entropix/core

Headless core hooks and utilities for the Entropix design system — platform-agnostic behavior, state, and accessibility.

[![npm](https://img.shields.io/npm/v/@entropix/core)](https://www.npmjs.com/package/@entropix/core)
[![license](https://img.shields.io/npm/l/@entropix/core)](https://github.com/dev-manindepth/entropix/blob/main/LICENSE)

## Installation

```bash
npm install @entropix/core
# or
pnpm add @entropix/core
# or
yarn add @entropix/core
```

> **Note:** Most consumers should use [`@entropix/react`](https://www.npmjs.com/package/@entropix/react) or [`@entropix/react-native`](https://www.npmjs.com/package/@entropix/react-native) instead, which wrap these hooks into ready-to-use components. Install `@entropix/core` directly only if you're building a custom adapter or need the raw hooks.

## Hooks

### useButton

Manages button behavior, disabled/loading states, and accessibility.

```typescript
import { useButton } from "@entropix/core";

function MyButton({ onPress, disabled, loading }) {
  const { isDisabled, isLoading, getButtonProps } = useButton({
    onPress,
    disabled,
    loading,
    elementType: "button", // "button" | "div" | "span" | "a"
  });

  const props = getButtonProps();
  return <button {...props}>Click me</button>;
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `loading` | `boolean` | `false` | Whether the button is in a loading state |
| `onPress` | `() => void` | — | Press handler |
| `elementType` | `string` | `"button"` | Underlying element type (adds `role`/`tabIndex` for non-button elements) |

### useToggle

Manages checked/unchecked state for checkboxes and switches.

```typescript
import { useToggle } from "@entropix/core";

function MyToggle() {
  const { isChecked, toggle, getToggleProps } = useToggle({
    defaultChecked: false,
    onChange: (checked) => console.log("Checked:", checked),
    role: "checkbox", // "checkbox" | "switch"
  });

  const props = getToggleProps();
  return <button {...props}>{isChecked ? "On" : "Off"}</button>;
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `checked` | `boolean` | — | Controlled checked state |
| `defaultChecked` | `boolean` | `false` | Initial checked state (uncontrolled) |
| `onChange` | `(checked: boolean) => void` | — | Called when checked state changes |
| `disabled` | `boolean` | `false` | Whether the toggle is disabled |
| `role` | `"checkbox" \| "switch"` | `"checkbox"` | ARIA role |

### useDialog

Manages dialog/modal open state, focus management, and accessibility.

```typescript
import { useDialog } from "@entropix/core";

function MyDialog() {
  const {
    isOpen,
    open,
    close,
    getTriggerProps,
    getContentProps,
    getCloseProps,
    getOverlayProps,
    ids,
  } = useDialog({
    closeOnOverlayPress: true,
    closeOnEscape: true,
    modal: true,
    role: "dialog", // "dialog" | "alertdialog"
  });

  return (
    <>
      <button {...getTriggerProps()}>Open</button>
      {isOpen && (
        <div {...getOverlayProps()}>
          <div {...getContentProps()} aria-labelledby={ids.title}>
            <h2 id={ids.title}>Title</h2>
            <button {...getCloseProps()}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `isOpen` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled) |
| `onOpenChange` | `(isOpen: boolean) => void` | — | Called when open state changes |
| `closeOnOverlayPress` | `boolean` | `true` | Close when overlay is pressed |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `modal` | `boolean` | `true` | Whether to trap focus |
| `role` | `"dialog" \| "alertdialog"` | `"dialog"` | ARIA role |

### useTabs

Manages tab selection, keyboard navigation, and ARIA roles.

```typescript
import { useTabs } from "@entropix/core";

function MyTabs() {
  const { selectedKey, select, getTabListProps, getTabProps, getTabPanelProps } =
    useTabs({
      defaultSelectedKey: "tab1",
      orientation: "horizontal",
    });

  return (
    <div>
      <div {...getTabListProps()}>
        <button {...getTabProps("tab1")}>Tab 1</button>
        <button {...getTabProps("tab2")}>Tab 2</button>
      </div>
      <div {...getTabPanelProps("tab1")}>Panel 1</div>
      <div {...getTabPanelProps("tab2")}>Panel 2</div>
    </div>
  );
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `selectedKey` | `string` | — | Controlled selected tab key |
| `defaultSelectedKey` | `string` | — | Initial selected tab (uncontrolled) |
| `onSelectedKeyChange` | `(key: string) => void` | — | Called when selection changes |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Tab list orientation |
| `activationMode` | `"automatic" \| "manual"` | `"automatic"` | When tabs activate on focus |
| `disabled` | `boolean` | `false` | Disable all tabs |
| `disabledKeys` | `string[]` | `[]` | Disable specific tabs by key |

### useAccordion

Manages expandable sections with single or multiple expand modes.

```typescript
import { useAccordion } from "@entropix/core";

function MyAccordion() {
  const { isExpanded, toggle, getItemTriggerProps, getItemPanelProps } =
    useAccordion({
      defaultExpandedKeys: ["item1"],
      allowMultiple: false,
      collapsible: true,
    });

  return (
    <div>
      <button {...getItemTriggerProps("item1")}>Section 1</button>
      {isExpanded("item1") && (
        <div {...getItemPanelProps("item1")}>Content 1</div>
      )}
    </div>
  );
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `expandedKeys` | `string[]` | — | Controlled expanded items |
| `defaultExpandedKeys` | `string[]` | `[]` | Initial expanded items (uncontrolled) |
| `onExpandedKeysChange` | `(keys: string[]) => void` | — | Called when expanded items change |
| `allowMultiple` | `boolean` | `false` | Allow multiple sections open |
| `collapsible` | `boolean` | `true` | Allow collapsing all sections |
| `disabled` | `boolean` | `false` | Disable all items |

### useMenu

Manages dropdown menu state, active item tracking, and keyboard navigation.

```typescript
import { useMenu } from "@entropix/core";

function MyMenu() {
  const { isOpen, toggle, getTriggerProps, getMenuProps, getItemProps } =
    useMenu({
      closeOnSelect: true,
      loop: true,
    });

  return (
    <div>
      <button {...getTriggerProps()}>Menu</button>
      {isOpen && (
        <div {...getMenuProps()}>
          <div {...getItemProps(0, { onSelect: () => console.log("Edit") })}>
            Edit
          </div>
          <div {...getItemProps(1, { onSelect: () => console.log("Delete") })}>
            Delete
          </div>
        </div>
      )}
    </div>
  );
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `isOpen` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled) |
| `onOpenChange` | `(isOpen: boolean) => void` | — | Called when open state changes |
| `closeOnSelect` | `boolean` | `true` | Close menu when an item is selected |
| `loop` | `boolean` | `true` | Loop keyboard navigation |

## Utilities

### mergeProps

Safely merges multiple prop objects, chaining event handlers:

```typescript
import { mergeProps } from "@entropix/core";

const merged = mergeProps(
  { onClick: handleClick1, className: "a" },
  { onClick: handleClick2, className: "b" }
);
// merged.onClick calls both handlers
```

### createKeyboardHandler

Creates a keyboard event handler map for navigation patterns:

```typescript
import { createKeyboardHandler } from "@entropix/core";

const keyMap = createKeyboardHandler({
  Enter: "activate",
  " ": "activate",
  Escape: "dismiss",
  ArrowDown: "moveDown",
  ArrowUp: "moveUp",
});
```

### useControllableState

Foundation hook for controlled/uncontrolled state management:

```typescript
import { useControllableState } from "@entropix/core";

const [value, setValue] = useControllableState({
  value: controlledValue,      // undefined = uncontrolled
  defaultValue: "initial",
  onChange: onValueChange,
});
```

## Type Exports

```typescript
import type {
  AccessibilityProps,  // Platform-neutral ARIA properties
  PropGetterReturn,    // Return type from prop getter functions
  InteractionKeyMap,   // Keyboard key → intent mapping
  KeyIntent,           // "activate" | "toggle" | "dismiss" | "moveUp" | ...
  AriaRole,            // ARIA role union type
} from "@entropix/core";
```

## Architecture

`@entropix/core` provides the **headless layer** of the Entropix design system. All behavior, state management, and accessibility logic lives here — platform adapters (`@entropix/react`, `@entropix/react-native`) consume these hooks and render platform-specific UI.

```
@entropix/core (hooks + logic)
  ├── @entropix/react (web components + CSS)
  └── @entropix/react-native (RN components + StyleSheet)
```

## Related Packages

- [`@entropix/react`](https://www.npmjs.com/package/@entropix/react) — React web components
- [`@entropix/react-native`](https://www.npmjs.com/package/@entropix/react-native) — React Native components
- [`@entropix/tokens`](https://www.npmjs.com/package/@entropix/tokens) — Design tokens

## License

MIT
