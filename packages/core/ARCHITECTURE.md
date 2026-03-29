# @entropix/core -- Architecture

## 1. Purpose

`@entropix/core` is the platform-agnostic headless layer of the Entropix design system. It provides React hooks that encapsulate interaction logic, state management, accessibility contracts, and keyboard handling without any DOM or React Native dependencies.

**Key constraints:**
- Zero `react-dom` imports -- no `useLayoutEffect`, no DOM refs, no event objects
- Zero `react-native` imports -- no `StyleSheet`, no `Pressable`, no platform APIs
- Only peer dependency: `react` (18 or 19)
- Every export must work identically in web and React Native environments

The package also includes chart math utilities (scales, ticks, geometry), date utilities (calendar grids, formatting), and an i18n type system -- all pure functions with no framework dependencies.

---

## 2. Architecture Decision: Prop-Getter Pattern

### What It Is

Every interactive hook returns "prop getter" functions (e.g., `getButtonProps()`, `getToggleProps()`, `getTabProps(index)`) that produce `PropGetterReturn` objects:

```ts
interface PropGetterReturn {
  accessibility: AccessibilityProps;   // platform-neutral a11y declarations
  keyboardConfig?: KeyboardHandlerConfig; // key-to-intent mapping
  onAction?: () => void;               // generic interaction handler
}
```

The platform layer is responsible for translating these into platform-specific attributes:
- **Web:** `accessibility.role` becomes `role`, `accessibility.checked` becomes `aria-checked`, `onAction` becomes `onClick`
- **React Native:** `accessibility.role` becomes `accessibilityRole`, `accessibility.checked` becomes `accessibilityState.checked`, `onAction` becomes `onPress`

### Why This Pattern

| Aspect | Decision |
|--------|----------|
| **Chosen** | Prop-getter pattern (like Downshift, React Table v8) |
| **Rationale** | The consumer controls the rendered element entirely. The hook provides behavior; the component provides rendering. This separation enables the same hook to drive different platforms. |
| **Tradeoff** | More verbose than compound components. Consumers must call `getXProps()` and spread the result. IDE autocomplete is less obvious than `<Tab.Panel>`. |
| **Alternative: Compound components** | Radix UI, Headless UI use this. Assumes a DOM -- `React.Children.map`, `cloneElement`, context providers for slot injection. Does not translate to React Native. |
| **Alternative: Render props** | Older pattern (pre-hooks). More flexible than compounds but verbose. Hooks replaced this. |
| **Industry comparison** | React Aria (Adobe) uses a similar hook-based approach but returns platform-specific ARIA props directly. Entropix returns platform-neutral declarations, adding one level of indirection for cross-platform support. |

### Composition Contract

The `PropGetterReturn` is the API boundary between core and platform layers. Core never produces `aria-*` attributes or `accessibilityRole` strings -- only neutral `AccessibilityProps`. This means:
- Adding a new platform (e.g., Flutter) requires only a new `mapAccessibilityToFlutter()` function
- Core hooks never need to change when platform APIs evolve

---

## 3. Hook Inventory

16 hooks organized by category:

### Interactive Component Hooks

| Hook | Description | Key State | Keyboard Support |
|------|-------------|-----------|------------------|
| `useButton` | Press interaction with loading/disabled states | `isPressed`, `isDisabled` | Enter, Space activate |
| `useToggle` | Binary on/off state for checkboxes, switches, toggle buttons | `isChecked`, `isDisabled` | Space toggles |
| `useDialog` | Modal/non-modal dialog with focus management intents | `isOpen` | Escape dismisses |
| `useTabs` | Tab list with active tab tracking | `activeIndex` | Arrow keys navigate tabs |
| `useAccordion` | Single or multi-expand collapsible sections | `expandedItems` | Enter/Space toggle, arrow nav |
| `useMenu` | Dropdown menu with item focus and typeahead | `isOpen`, `focusedIndex` | Arrow nav, typeahead, Escape closes |
| `useInput` | Text input with validation, error, and helper text | `value`, `isInvalid` | Standard text input keys |
| `useSelect` | Dropdown select with listbox semantics | `isOpen`, `selectedValue`, `focusedIndex` | Arrow nav, Enter selects, Escape closes |
| `useRadioGroup` | Radio button group with roving tabindex | `selectedValue` | Arrow keys move selection |
| `useTable` | Data table with sorting, filtering, pagination, selection | `sortState`, `page`, `selectedRows` | Space selects row |
| `useToast` | Toast notification queue with auto-dismiss | `toasts` (queue), `add`, `dismiss` | -- |
| `usePopover` | Positioned overlay with trigger modes (click/hover) | `isOpen`, `triggerMode` | Escape closes |
| `useDatePicker` | Date selection with calendar grid navigation | `selectedDate`, `calendarMonth` | Arrow nav in calendar grid |
| `usePagination` | Page navigation with configurable sibling/boundary pages | `currentPage`, `pages` | -- |

### Internal/Utility Hooks

| Hook | Description |
|------|-------------|
| `useControllableState` | Controlled/uncontrolled state pattern. Every interactive hook uses this internally to support both `value`/`onChange` (controlled) and `defaultValue` (uncontrolled) APIs. |
| `useId` / `useIds` | Deterministic ID generation for ARIA relationships (`aria-controls`, `aria-labelledby`). Wraps React's `useId` when available, falls back to counter. `useIds` generates multiple correlated IDs (e.g., tab + tabpanel pairs). |

---

## 4. Type System

### `AccessibilityProps` (platform-neutral a11y)

Defined in `src/types/accessibility.ts`. A flat object representing all accessibility declarations a component might need:

- **Identity:** `role` (AriaRole union of 30+ roles), `label`, `labelledBy`, `describedBy`
- **State:** `disabled`, `expanded`, `selected`, `checked` (boolean | "mixed"), `pressed`, `busy`, `modal`, `invalid`, `required`, `hidden`
- **Relationships:** `controls`, `owns`, `hasPopup`
- **Live regions:** `live` (off | polite | assertive)
- **Range widgets:** `valueNow`, `valueMin`, `valueMax`, `valueText`
- **Layout:** `orientation` (horizontal | vertical), `tabIndex`

The platform layer maps each field to the correct native attribute. For example, `checked: true` becomes `aria-checked="true"` on web and `accessibilityState={{ checked: true }}` on React Native.

### `InteractionKeyMap` and `KeyIntent`

Defined in `src/types/interactions.ts`. Abstracts keyboard interactions into named intents:

```ts
type KeyIntent =
  | "activate" | "toggle" | "dismiss" | "confirm"
  | "moveUp" | "moveDown" | "moveLeft" | "moveRight"
  | "moveStart" | "moveEnd"
  | "selectAll" | "selectRow" | "selectAllRows"
  | "focusNext" | "focusPrevious";

type InteractionKeyMap = Partial<Record<string, KeyIntent>>;
```

Hooks define key maps (e.g., `{ Enter: "activate", " ": "activate" }` for buttons). The platform layer converts these to actual `onKeyDown` handlers via `createKeyboardHandler`.

### `PropGetterReturn` (composition contract)

Defined in `src/types/prop-getters.ts`. The universal return type from all prop getter functions. Contains `accessibility`, optional `keyboardConfig`, and optional `onAction`.

### `PressEvent`

A platform-neutral event object constructed by the platform layer from `onClick`/`onPress`/`onKeyDown`. Contains the resolved `intent`, modifier key state, and a `preventDefault` function.

---

## 5. Utility Functions

### `createKeyboardHandler(keyMap: InteractionKeyMap)`

Takes an `InteractionKeyMap` and returns a `KeyboardHandlerConfig` with a `getIntent(key, modifiers)` method. Platform layers call `getIntent` inside their `onKeyDown` handler to resolve which intent (if any) was triggered.

**Why it exists:** Hooks define *what* keys map to *what* actions. Platform layers handle *how* to listen for keystrokes. This separation keeps core platform-agnostic.

### `mergeProps(...propSets)`

Deep-merges multiple prop objects, intelligently combining event handlers (calls all of them) and className strings (concatenates). Used when a hook's prop getter output needs to be combined with consumer-provided props.

### `callAllHandlers(...handlers)`

Returns a function that calls all provided handler functions in order. Used for combining `onChange`, `onFocus`, etc. when multiple behaviors need to respond to the same event.

---

## 6. Chart Utilities

Located in `src/utils/chart/` (468 lines total across 6 files). Provides everything needed to render charts without D3 or any charting library.

### Why Custom Instead of D3

| Aspect | D3 | Entropix Chart Utils |
|--------|----|--------------------|
| Bundle size | ~500KB (full), ~80KB (d3-scale + d3-shape) | ~4KB minified |
| DOM dependency | Yes (d3-selection manipulates DOM) | No (pure math, returns coordinates) |
| React compatibility | Requires careful integration (two rendering models) | Returns data, React renders |
| Brand awareness | Manual | Uses token color palette directly |

### Module Breakdown

| File | Lines | Purpose |
|------|-------|---------|
| `scales.ts` | 56 | `createLinearScale` (continuous) and `createBandScale` (categorical). Maps data domains to pixel ranges. |
| `ticks.ts` | 60 | `generateLinearTicks` and `niceBounds`. Produces human-friendly axis tick values (e.g., 0, 25, 50, 75, 100 instead of 0, 23.7, 47.4...). |
| `normalize.ts` | 74 | `normalizeChartData` and `getDataExtent`. Transforms user-provided data into a uniform `NormalizedSeries[]` format with computed min/max. |
| `geometry.ts` | 245 | `computeBarGeometry` (bar rectangles), `computeLinePoints` (x/y coordinates), `describeLinePath` / `describeAreaPath` (SVG path `d` strings), `computeArcGeometry` (pie/donut slices with start/end angles). |
| `colors.ts` | 22 | `DEFAULT_CHART_COLORS` (10-color palette) and `getSeriesColor` helper. |
| `index.ts` | 11 | Re-exports all chart utilities. |

### How Platform Layers Use It

1. Core computes geometry (e.g., `computeBarGeometry` returns `BarRect[]` with `x`, `y`, `width`, `height`, `color`)
2. Web layer renders `<rect>` SVG elements using those coordinates
3. RN layer renders `<Rect>` from `react-native-svg` using the same coordinates

The math is identical; only the rendering primitive differs.

---

## 7. Date Utilities

Located in `src/utils/date-utils.ts`. Pure Date API functions for the date picker component.

**Functions:**
- `getDaysInMonth(year, month)` -- number of days
- `getCalendarGrid(year, month, options?)` -- returns `CalendarDay[]` (42 cells: previous month padding + current month + next month padding) for a 6-row calendar display
- `formatDate(date, format)` / `parseDate(string, format)` -- basic formatting/parsing
- `isSameDay`, `isBefore`, `isAfter` -- comparison helpers
- `addMonths(date, n)` -- month arithmetic
- `MONTH_NAMES`, `DAY_NAMES` -- English string constants

**Why no date-fns or dayjs:** The date picker needs ~10 functions. Pulling in date-fns adds 5KB+ (tree-shaken) for functionality that takes ~100 lines to implement. The built-in `Date` API is sufficient for calendar grid generation and basic arithmetic.

---

## 8. i18n

### Type System

`EntropixLocale` (in `src/i18n/types.ts`) defines the shape of a locale object:

```ts
interface EntropixLocale {
  locale: string;           // BCP 47 tag, e.g. "en-US"
  direction: "ltr" | "rtl";

  // Flat keys with underscore namespacing:
  calendar_monthNames: string[];
  calendar_dayNames: string[];
  calendar_label: string;
  calendar_previousMonth: string;
  calendar_nextMonth: string;
  calendar_dayLabel: (date: Date) => string;

  datePicker_label: string;
  datePicker_placeholder: string;

  pagination_label: string;
  pagination_firstPage: string;
  // ... etc.

  toast_regionLabel: string;
  toast_dismiss: string;

  breadcrumb_label: string;
  select_placeholder: string;
}
```

### Why Flat Keys Over Nested Objects

| Approach | Example | Tradeoff |
|----------|---------|----------|
| **Flat keys (chosen)** | `calendar_monthNames` | Simple type checking, easy to grep, no deep access chains. Autocomplete shows all keys at once. |
| **Nested objects** | `locale.calendar.monthNames` | More organized for large key sets, but requires recursive Partial types for overrides and deep merge utilities. |
| **Template string keys** | `t("calendar.monthNames")` | Requires runtime lookup + key validation tooling. |

For a design system with ~20 translatable strings, flat keys are sufficient and the simplest to type-check.

### Default Locale

`defaultLocale` in `src/i18n/default-locale.ts` provides English (US) translations. Consumers can provide their own `EntropixLocale` object to hooks that accept locale-sensitive content (date picker, pagination, toast).

---

## 9. Multi-Entry Build

### tsup Configuration

`tsup.config.ts` defines 17 entry points:

```ts
entry: {
  index:                        "src/index.ts",          // barrel
  "hooks/use-button":           "src/hooks/use-button.ts",
  "hooks/use-toggle":           "src/hooks/use-toggle.ts",
  "hooks/use-dialog":           "src/hooks/use-dialog.ts",
  "hooks/use-tabs":             "src/hooks/use-tabs.ts",
  "hooks/use-accordion":        "src/hooks/use-accordion.ts",
  "hooks/use-menu":             "src/hooks/use-menu.ts",
  "hooks/use-input":            "src/hooks/use-input.ts",
  "hooks/use-select":           "src/hooks/use-select.ts",
  "hooks/use-radio-group":      "src/hooks/use-radio-group.ts",
  "hooks/use-table":            "src/hooks/use-table.ts",
  "hooks/use-toast":            "src/hooks/use-toast.ts",
  "hooks/use-popover":          "src/hooks/use-popover.ts",
  "hooks/use-date-picker":      "src/hooks/use-date-picker.ts",
  "hooks/use-pagination":       "src/hooks/use-pagination.ts",
  "date-utils":                 "src/utils/date-utils.ts",
  chart:                        "src/utils/chart/index.ts",
}
```

### Build Output

Each entry produces four files:
- `.js` (ESM)
- `.cjs` (CommonJS)
- `.d.ts` (ESM type declarations)
- `.d.cts` (CJS type declarations)

tsup settings: `splitting: true` (shared code extracted to chunks), `treeshake: true`, `sourcemap: true`, `external: ["react"]`.

### Consumer Import Patterns

```ts
// Barrel import -- all hooks, all utilities
import { useButton, useToggle } from "@entropix/core";

// Per-hook import -- minimal bundle, only useButton + shared utilities
import { useButton } from "@entropix/core/hooks/use-button";

// Chart utilities only -- no hooks loaded
import { createLinearScale, computeBarGeometry } from "@entropix/core/chart";

// Date utilities only
import { getCalendarGrid, formatDate } from "@entropix/core/date-utils";
```

Each subpath is mapped via `exports` in `package.json` to both ESM and CJS builds with proper type declarations.

---

## 10. Testing

### Test Infrastructure

- **Runner:** Vitest (configured via `vitest.config.ts` in the package)
- **DOM environment:** jsdom (for `@testing-library/react` hook rendering)
- **Assertion library:** `@testing-library/jest-dom` for DOM assertions

### Test Files

**Hook tests** (`src/__tests__/hooks/`):

| File | Tests |
|------|-------|
| `use-button.test.ts` | Press events, disabled state, loading state, accessibility props |
| `use-toggle.test.ts` | Checked/unchecked, controlled/uncontrolled, disabled, keyboard toggle |
| `use-dialog.test.ts` | Open/close, modal accessibility, focus management intents |
| `use-tabs.test.ts` | Active tab tracking, keyboard navigation, accessibility attributes |
| `use-accordion.test.ts` | Single/multi expand, toggle behavior, accessibility |
| `use-menu.test.ts` | Open/close, item focus, typeahead, keyboard navigation |
| `use-controllable-state.test.ts` | Controlled vs uncontrolled modes, onChange callbacks |
| `use-id.test.ts` | ID generation, uniqueness, useIds correlation |

**Utility tests** (`src/__tests__/utils/`):

| File | Tests |
|------|-------|
| `create-keyboard-handler.test.ts` | Key-to-intent resolution, modifier key handling |
| `merge-props.test.ts` | Deep merge, event handler combination, className concat |
| `call-all-handlers.test.ts` | Multiple handler invocation, undefined safety |

Total: 11 test files.

---

## 11. File Structure

```
packages/core/
  src/
    index.ts                          # Barrel export (all hooks, types, utils)
    hooks/
      use-accordion.ts
      use-button.ts
      use-controllable-state.ts       # Internal: controlled/uncontrolled pattern
      use-date-picker.ts
      use-dialog.ts
      use-id.ts                       # Internal: ID generation
      use-input.ts
      use-menu.ts
      use-pagination.ts
      use-popover.ts
      use-radio-group.ts
      use-select.ts
      use-table.ts
      use-tabs.ts
      use-toast.ts
      use-toggle.ts
    types/
      accessibility.ts                # AccessibilityProps, AriaRole, AriaLive
      chart.ts                        # ChartDataPoint, BarRect, LinePoint, ArcSlice, etc.
      interactions.ts                 # KeyIntent, InteractionKeyMap, PressEvent
      prop-getters.ts                 # PropGetterReturn, PropGetter<T>
      shared.ts                       # MaybeFunction, CallbackFn, ControllableStateOptions
    utils/
      call-all-handlers.ts
      create-keyboard-handler.ts
      date-utils.ts
      merge-props.ts
      chart/
        colors.ts                     # DEFAULT_CHART_COLORS, getSeriesColor
        geometry.ts                   # Bar, line, area, arc computation
        index.ts                      # Re-exports
        normalize.ts                  # Data normalization
        scales.ts                     # Linear and band scales
        ticks.ts                      # Tick generation, nice bounds
    i18n/
      index.ts                        # Re-exports
      types.ts                        # EntropixLocale interface
      default-locale.ts               # English (US) default translations
    __tests__/
      hooks/                          # 8 hook test files
      utils/                          # 3 utility test files
  tsup.config.ts                      # 17 entry points, ESM+CJS, dts, treeshake
  vitest.config.ts
  tsconfig.json
  eslint.config.mjs
  package.json
```
