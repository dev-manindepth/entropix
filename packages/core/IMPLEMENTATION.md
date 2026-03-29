# Core Package Implementation Guide

`@entropix/core` is the headless logic layer for the Entropix design system. This guide teaches you how the core works internally, how to read existing hooks, and how to write new ones.

---

## 1. Mental Model -- How Core Works

Core is a **contract layer**. It defines WHAT should happen, not HOW it looks. It never imports `react-dom`, never produces `aria-*` strings, never creates DOM elements.

Every hook returns **prop getters** -- functions like `getButtonProps()` that return a `PropGetterReturn` object:

```typescript
interface PropGetterReturn {
  accessibility: AccessibilityProps;        // platform-neutral declarations
  keyboardConfig?: KeyboardHandlerConfig;   // key-to-intent mapping
  onAction?: () => void;                    // generic interaction handler
}
```

The platform layer (@entropix/react or @entropix/react-native) reads this contract and translates it:

| Core output | Web translation | Native translation |
|---|---|---|
| `accessibility.role: "button"` | `role="button"` | `accessibilityRole="button"` |
| `accessibility.expanded: true` | `aria-expanded="true"` | `accessibilityState={{ expanded: true }}` |
| `accessibility.label: "Close"` | `aria-label="Close"` | `accessibilityLabel="Close"` |
| `keyboardConfig` | `onKeyDown` handler | `onKeyPress` handler |
| `onAction` | `onClick` | `onPress` |

This separation means core hooks can be tested without a DOM and shared across web and native platforms.

---

## 2. Walkthrough: How `useButton` Works (Simplest Hook)

`useButton` is the smallest hook and the best place to understand the pattern. Here is the full implementation annotated:

```typescript
// The key map is defined outside the hook -- it never changes.
// It maps keyboard keys to semantic "intents".
// "Enter" and " " (Space) both mean "activate" for buttons.
const BUTTON_KEY_MAP: InteractionKeyMap = {
  Enter: "activate",
  " ": "activate",
};

export function useButton(options: UseButtonOptions = {}): UseButtonReturn {
  const {
    disabled = false,
    loading = false,
    onPress,
    elementType = "button",     // determines if we need explicit role
  } = options;

  // Step 1: Derived state
  // A button is effectively disabled if either `disabled` or `loading` is true.
  const isDisabled = disabled || loading;

  // Step 2: Keyboard config
  // createKeyboardHandler wraps the key map in a config object with a
  // getIntent() resolver. Platform layers call getIntent(event.key) to
  // determine what action to take.
  const keyboardConfig = useMemo(
    () => createKeyboardHandler(BUTTON_KEY_MAP),
    [],
  );

  // Step 3: Prop getter
  // getButtonProps() builds the contract object. The platform layer
  // destructures this and maps it to DOM/native attributes.
  const getButtonProps = useCallback(
    (overrides?: { onAction?: () => void }): PropGetterReturn => {
      const action = overrides?.onAction ?? onPress;

      return {
        accessibility: {
          // Native <button> has implicit role; only set for non-button elements
          role: elementType === "button" ? undefined : "button",
          disabled: isDisabled || undefined,
          busy: loading || undefined,
          // Non-native buttons need tabIndex for keyboard focus
          tabIndex: isDisabled ? -1 : elementType === "button" ? undefined : 0,
        },
        // Disabled buttons get no keyboard handler (no accidental activation)
        keyboardConfig: isDisabled ? undefined : keyboardConfig,
        // Disabled buttons get no action handler
        onAction: isDisabled ? undefined : action,
      };
    },
    [isDisabled, loading, onPress, elementType, keyboardConfig],
  );

  return { isDisabled, isLoading: loading, getButtonProps };
}
```

**Key takeaways:**
- The key map is a static constant, memoized once.
- `PropGetterReturn` contains only neutral declarations -- no `aria-disabled`, no `onClick`.
- Disabled state zeroes out both `keyboardConfig` and `onAction`, preventing any interaction.
- The `overrides` parameter on prop getters lets consumers replace the default action.

---

## 3. Walkthrough: How `useDialog` Works (Complex Hook)

`useDialog` demonstrates four patterns you will see in all complex hooks:

### 3a. Controlled/uncontrolled state via `useControllableState`

```typescript
const [isOpen, setIsOpen] = useControllableState<boolean>({
  value: controlledIsOpen,      // if defined, the parent owns the state
  defaultValue: defaultOpen,    // initial value for uncontrolled mode
  onChange: onOpenChange,        // called whenever state changes
});
```

If the consumer passes `isOpen={true}`, the dialog is "controlled" -- internal state is ignored and only the consumer can change it by updating the prop. If the consumer passes nothing, the dialog manages its own open/closed state internally.

### 3b. ID linking via `useIds`

```typescript
const dialogIds = useIds("dialog", "title", "description", "content");
// Returns: { base: "entropix-dialog-1", title: "entropix-dialog-1-title", ... }
```

These IDs link elements together for screen readers. The content element gets `aria-labelledby={ids.title}` and `aria-describedby={ids.description}`.

### 3c. Focus management intent

```typescript
const focusManagement: FocusManagementIntent = {
  trapFocus: modal,          // should focus be trapped inside?
  restoreFocus: true,        // should focus return to trigger on close?
  autoFocus: true,           // should first focusable element get focus on open?
};
```

Core does not implement focus trapping. It declares the intent. The React platform layer reads this and uses a focus-trap library or manual DOM management.

### 3d. Multiple prop getters

Dialog has four interactive surfaces, so it provides four prop getters:

```typescript
getTriggerProps()    // the button that opens the dialog
getContentProps()    // the dialog panel itself
getCloseProps()      // the close button inside the dialog
getOverlayProps()    // the backdrop/overlay behind the dialog
```

Each returns its own `PropGetterReturn` with the appropriate accessibility and behavior. The trigger gets `expanded` and `hasPopup`. The content gets `role="dialog"`, `modal`, `labelledBy`, `describedBy`. The overlay gets `hidden: true` (not announced to screen readers).

---

## 4. How to Write a New Hook -- Step by Step

### Step 1: Define the Options interface

Think about what the consumer needs to configure. Include controlled state pairs (`value`/`defaultValue`/`onChange`), behavior flags, and callbacks.

```typescript
export interface UseTooltipOptions {
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  delay?: number;
  disabled?: boolean;
}
```

### Step 2: Define the Return interface

What does the consumer get back? Always include prop getters for each interactive element. Include derived state that the platform layer needs.

```typescript
export interface UseTooltipReturn {
  isOpen: boolean;
  getTriggerProps: () => PropGetterReturn;
  getTooltipProps: () => PropGetterReturn;
}
```

### Step 3: Use `useControllableState` for toggleable state

If the component has an open/closed, checked/unchecked, or selected/unselected state, use `useControllableState`:

```typescript
const [isOpen, setIsOpen] = useControllableState({
  value: controlledIsOpen,
  defaultValue: false,
  onChange: onOpenChange,
});
```

### Step 4: Use `useIds` for ARIA linking

If the component has multiple elements that need to reference each other (a trigger and its content, an input and its label):

```typescript
const ids = useIds("tooltip", "content");
// ids.base = "entropix-tooltip-1"
// ids.content = "entropix-tooltip-1-content"
```

### Step 5: Build `PropGetterReturn` objects

For each interactive element, create a function that returns the accessibility contract:

```typescript
const getTriggerProps = (): PropGetterReturn => ({
  accessibility: {
    describedBy: isOpen ? ids.content : undefined,
  },
  onAction: disabled ? undefined : toggle,
});

const getTooltipProps = (): PropGetterReturn => ({
  accessibility: {
    role: "tooltip",
    hidden: !isOpen || undefined,
  },
});
```

### Step 6: Use `createKeyboardHandler` for keyboard interactions

Define a key map as a constant, then pass it to `createKeyboardHandler`:

```typescript
const TOOLTIP_KEY_MAP: InteractionKeyMap = {
  Escape: "dismiss",
};

const keyboardConfig = useMemo(
  () => createKeyboardHandler(TOOLTIP_KEY_MAP),
  [],
);
```

### Step 7: Export from index.ts and tsup.config.ts

Add to `packages/core/src/index.ts`:
```typescript
export { useTooltip } from "./hooks/use-tooltip.js";
export type { UseTooltipOptions, UseTooltipReturn } from "./hooks/use-tooltip.js";
```

Add to `tsup.config.ts` entry:
```typescript
"hooks/use-tooltip": "src/hooks/use-tooltip.ts",
```

---

## 5. The Type System -- Key Types Explained

### `AccessibilityProps`

Platform-neutral accessibility declarations. Contains properties like `role`, `label`, `expanded`, `checked`, `disabled`. These are NOT `aria-*` attributes -- they are neutral names that each platform translates.

The full interface has fields for roles, states, relationships, and live regions:

```
role        -- semantic role (button, dialog, tab, checkbox, ...)
label       -- human-readable label for screen readers
labelledBy  -- ID of element that labels this element
describedBy -- ID of element that describes this element
expanded    -- disclosure state (true/false)
checked     -- toggle state (true/false/"mixed")
disabled    -- interaction state
modal       -- traps focus and interaction
tabIndex    -- keyboard focus order
hidden      -- excluded from accessibility tree
```

### `PropGetterReturn`

The contract between core and platform. Contains three fields:
- `accessibility`: the `AccessibilityProps` above
- `keyboardConfig`: optional key-to-intent resolver
- `onAction`: optional click/press handler

### `KeyboardHandlerConfig`

Contains a `keyMap` (Record of key string to intent string) and a `getIntent()` function that resolves a key press to an intent name. The platform layer calls `getIntent(event.key)` and maps the returned intent to the appropriate action.

### `InteractionKeyMap`

A simple `Record<string, KeyIntent>` mapping physical keys to semantic intents:

```typescript
{ Enter: "activate", " ": "activate" }        // button
{ Escape: "dismiss" }                          // dialog
{ " ": "toggle", Enter: "toggle" }             // checkbox
{ ArrowDown: "next", ArrowUp: "previous" }     // menu
```

---

## 6. Chart Utilities -- How to Add a New Chart Type

Chart utilities in `src/utils/chart/` provide pure functions for computing visual geometry from data. They have no React dependency.

### Key modules

- **scales.ts**: `createLinearScale` maps continuous data ranges to pixel ranges. `createBandScale` maps discrete categories to equal-width bands.
- **geometry.ts**: `computeBarGeometry` returns rectangles. `computeLinePoints` returns point arrays. `computeArcGeometry` returns arc slices for pie charts.
- **paths.ts**: `describeLinePath` and `describeAreaPath` produce SVG path `d` strings from points.

### Adding a scatter chart

A scatter chart needs to plot (x, y) pairs as circles. Here is what you would add:

```typescript
// In geometry.ts
export interface ScatterPoint {
  cx: number;         // center x in pixels
  cy: number;         // center y in pixels
  r: number;          // radius in pixels
  dataIndex: number;
  seriesIndex: number;
}

export function computeScatterGeometry(
  data: NormalizedSeries[],
  xScale: LinearScale,
  yScale: LinearScale,
  pointRadius: number = 4,
): ScatterPoint[] {
  const points: ScatterPoint[] = [];
  data.forEach((series, seriesIndex) => {
    series.points.forEach((point, dataIndex) => {
      points.push({
        cx: xScale(point.x as number),
        cy: yScale(point.y),
        r: pointRadius,
        dataIndex,
        seriesIndex,
      });
    });
  });
  return points;
}
```

Then export from `src/utils/chart/index.ts` and `src/index.ts`.

---

## 7. Testing Hooks

### Basic test structure

Use `renderHook` from `@testing-library/react` to test hooks in isolation:

```typescript
import { renderHook, act } from "@testing-library/react";
import { useToggle } from "@entropix/core";

describe("useToggle", () => {
  it("starts unchecked by default", () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current.isChecked).toBe(false);
  });

  it("toggles on action", () => {
    const { result } = renderHook(() => useToggle());
    act(() => result.current.toggle());
    expect(result.current.isChecked).toBe(true);
  });

  it("respects defaultChecked", () => {
    const { result } = renderHook(() => useToggle({ defaultChecked: true }));
    expect(result.current.isChecked).toBe(true);
  });

  it("returns correct accessibility props", () => {
    const { result } = renderHook(() => useToggle({ role: "switch" }));
    const props = result.current.getToggleProps();
    expect(props.accessibility.role).toBe("switch");
    expect(props.accessibility.checked).toBe(false);
    expect(props.accessibility.tabIndex).toBe(0);
  });

  it("disables keyboard and action when disabled", () => {
    const { result } = renderHook(() => useToggle({ disabled: true }));
    const props = result.current.getToggleProps();
    expect(props.keyboardConfig).toBeUndefined();
    expect(props.onAction).toBeUndefined();
    expect(props.accessibility.tabIndex).toBe(-1);
  });

  it("calls onChange in controlled mode", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useToggle({ checked: false, onChange })
    );
    act(() => result.current.toggle());
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
```

### What to test

For every hook, verify:

1. **Default state** -- Initial values match documented defaults
2. **State transitions** -- Actions produce expected state changes
3. **Prop getter output** -- Accessibility props, keyboard config, and action handler are correct for each state
4. **Disabled behavior** -- Keyboard config and action handler are both undefined when disabled
5. **Controlled mode** -- onChange is called, internal state does not change when value prop is provided
6. **ID generation** -- For hooks using useIds, verify IDs are linked correctly (labelledBy, describedBy, controls)

---

## 8. Existing Hooks Reference

| Hook | Interactive Elements | Key Patterns |
|---|---|---|
| `useButton` | button | Simplest hook. Key map: Enter/Space -> activate |
| `useToggle` | toggle element | Controlled/uncontrolled. Roles: checkbox or switch |
| `useDialog` | trigger, content, close, overlay | Focus management intent. ID linking. Escape to dismiss |
| `useTabs` | tab list, individual tabs, panels | Arrow key navigation. Selected state. Orientation |
| `useAccordion` | multiple trigger/content pairs | Multi-expand vs single-expand. ID linking per item |
| `useMenu` | trigger, menu, menu items | Focus management. Arrow key navigation. Type-ahead |
| `useInput` | input element | Validation state. Required/invalid. Value management |
| `useSelect` | trigger, listbox, options | Controlled selection. Keyboard navigation. Popup state |
| `useRadioGroup` | group container, radio items | Single selection. Arrow key cycling. Group role |
| `useTable` | table, headers, rows, cells | Column sorting. Sort direction state |
| `useToast` | toast region, individual toasts | Auto-dismiss timer. Toast queue management |
| `usePopover` | trigger, popover content | Placement intent. Trigger modes (click/hover) |
| `useDatePicker` | input, calendar grid, day cells | Date math. Month navigation. Locale-aware |
| `usePagination` | page buttons, navigation controls | Page calculation. Ellipsis logic |

When writing a new hook, find the existing hook closest in complexity to what you need and use it as your template.
