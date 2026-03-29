# @entropix/react Architecture

## Purpose

`@entropix/react` provides the web React component layer of the Entropix design system. Every component imports a headless hook from `@entropix/core`, maps its platform-neutral accessibility output to ARIA attributes, applies keyboard handling, and renders styled HTML elements using CSS custom properties. Consumers get fully styled, accessible output with zero configuration:

```tsx
import { Button } from "@entropix/react/button";

<Button variant="primary" size="md" onPress={handleSave}>
  Save Changes
</Button>
```

No theme provider is required. CSS custom properties resolve against whatever design tokens are loaded on the page (via `@entropix/tokens`).

---

## Component Inventory

The package ships 18 component families plus 4 layout primitives, exposed through 19 tsup entry points.

### Single-File Components

| Component   | File             | Core Hook     |
|-------------|------------------|---------------|
| Button      | `button.tsx`     | `useButton`   |
| Toggle      | `toggle.tsx`     | `useToggle`   |
| Switch      | `switch.tsx`     | `useSwitch`   |
| Input       | `input.tsx`      | `useInput`    |
| Textarea    | `textarea.tsx`   | `useTextarea` |
| Checkbox    | `checkbox.tsx`   | `useCheckbox` |

### Compound Component Families

| Family      | Sub-Components                                                              | Core Hook     |
|-------------|-----------------------------------------------------------------------------|---------------|
| Dialog      | Dialog, DialogTrigger, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose (7) | `useDialog`   |
| Tabs        | Tabs, TabList, Tab, TabPanel (4)                                            | `useTabs`     |
| Accordion   | Accordion, AccordionItem, AccordionTrigger, AccordionPanel (4)              | `useAccordion`|
| Menu        | Menu, MenuTrigger, MenuContent, MenuItem (4)                                | `useMenu`     |
| Radio       | RadioGroup, RadioItem (2)                                                   | `useRadio`    |
| Select      | Select, SelectTrigger, SelectContent, SelectOption (4)                      | `useSelect`   |
| Toast       | ToastProvider, Toast (2)                                                    | `useToast`    |
| Popover     | Popover, PopoverTrigger, PopoverContent + Tooltip convenience wrapper (3+1) | `usePopover`  |
| DatePicker  | DatePicker, Calendar (2)                                                    | `useDatePicker` |
| Breadcrumb  | Breadcrumb, BreadcrumbItem (2)                                              | `useBreadcrumb` |
| Pagination  | Pagination (1)                                                              | `usePagination` |

### Layout Primitives

| Component | Purpose                                      |
|-----------|----------------------------------------------|
| Stack     | Vertical flex layout with gap                |
| Inline    | Horizontal flex layout with gap and wrapping |
| Container | Max-width centered wrapper                   |
| Divider   | Horizontal or vertical separator line        |

---

## Architecture: Hook-to-Component Mapping

Every component follows the same three-step pattern:

1. **Import the core hook.** The hook is pure logic -- no DOM, no React Native, no platform awareness. It returns state, a prop-getter function, and optional keyboard configuration.

2. **Map accessibility to ARIA.** The prop-getter returns an `AccessibilityProps` object with platform-neutral keys (`label`, `expanded`, `controls`, etc.). The component calls `mapAccessibilityToAria()` to convert these to DOM-ready attributes (`aria-label`, `aria-expanded`, `aria-controls`, etc.).

3. **Bind keyboard handling.** If the core hook returns a `keyboardConfig` (an intent-based key mapper), the component calls `useKeyboardHandler()` to produce a React `onKeyDown` handler. The intent system maps physical keys to semantic actions (`activate`, `dismiss`, `moveNext`, etc.), and the component supplies callbacks for each intent.

Concrete example with Button:

```
@entropix/core                    @entropix/react
+--------------+                  +------------------+
| useButton()  | -- returns -->   | getButtonProps() |
|              |                  |   .accessibility --> mapAccessibilityToAria() --> aria-* attrs
|              |                  |   .keyboardConfig -> useKeyboardHandler()    --> onKeyDown
|              |                  |   .onAction      --> onClick callback
+--------------+                  +------------------+
```

### mapAccessibilityToAria

Located at `src/utils/map-accessibility-to-aria.ts`. Maintains a static `ARIA_MAP` dictionary that maps every `AccessibilityProps` key to its DOM attribute name:

- `role` -> `role`
- `label` -> `aria-label`
- `disabled` -> `aria-disabled`
- `expanded` -> `aria-expanded`
- `tabIndex` -> `tabIndex` (not an aria attribute)
- ...and 20+ more

Undefined values are filtered out to keep rendered DOM clean.

### useKeyboardHandler

Located at `src/utils/use-keyboard-handler.ts`. Takes a `KeyboardHandlerConfig` (from core) and an `actionMap` (intent-to-callback mapping), returns a React `onKeyDown` handler or `undefined` if no keyboard config is present.

The core's `getIntent(key, modifiers)` translates raw key presses into semantic intents. The hook calls `event.preventDefault()` when an intent is matched, then invokes the mapped callback.

### cn (class name utility)

Located at `src/utils/cn.ts`. A minimal utility that joins class name arguments, filtering out falsy values. No external dependency (no clsx/classnames needed).

---

## Compound Component Pattern

Components with multiple sub-parts (Dialog, Tabs, Select, Menu, Accordion, Radio, Toast, Popover) use React Context to share state from the core hook.

The pattern:

1. **Root component** calls the core hook and places its return value into a React Context provider. The root renders no DOM of its own -- it is a pure state container.

2. **Context file** creates the context with `createContext<HookReturn | null>(null)` and exports a consumer hook (e.g., `useDialogContext()`) that throws if used outside the provider.

3. **Child components** call the consumer hook to access shared state, then render their respective DOM elements with proper ARIA mapping.

Example for Dialog:

```
<Dialog>                        -- calls useDialog(), provides DialogContext
  <DialogTrigger>               -- reads context, renders button with aria-expanded
  <DialogOverlay>               -- reads context, renders backdrop
  <DialogContent>               -- reads context, renders portal with focus trap
    <DialogTitle>               -- reads context, renders h2 with aria-labelledby id
    <DialogDescription>         -- reads context, renders p with aria-describedby id
    <DialogClose>               -- reads context, renders close button
  </DialogContent>
</Dialog>
```

Context files follow a consistent naming convention: `{component}-context.tsx` exports both the raw context object and the consumer hook (`use{Component}Context`).

---

## CSS Architecture

### File Organization

18 CSS files in `src/styles/`, one per component family, plus `index.css` that imports all of them. Each CSS file is imported as a side effect at the top of its component file (e.g., `import "../styles/button.css"`).

### BEM Naming Convention

All class names follow `.entropix-{component}__part--modifier`:

```css
.entropix-button                        /* block */
.entropix-button--primary               /* variant modifier */
.entropix-button--sm                    /* size modifier */
.entropix-dialog-content                /* block */
.entropix-datatable__th--sortable       /* element + modifier */
```

### CSS Custom Properties

Every visual value (colors, spacing, typography, radii, shadows, transitions) references a CSS custom property:

```css
.entropix-button {
  font-size: var(--entropix-button-font-size);
  border-radius: var(--entropix-button-border-radius);
  padding: var(--entropix-button-padding-y) var(--entropix-button-padding-x);
  transition: background var(--entropix-duration-fast) var(--entropix-easing-default);
}
```

These properties are defined by `@entropix/tokens` CSS files and resolve at runtime. Switching brands or themes swaps the token values, and all components update automatically.

### Data Attributes for State

Components use `data-state`, `data-variant`, and `data-size` attributes instead of toggling class names for dynamic state:

```tsx
data-state={isLoading ? "loading" : isDisabled ? "disabled" : undefined}
data-variant={variant}
data-size={size}
```

CSS targets these with attribute selectors: `[data-state="loading"]`, `[data-variant="primary"]`.

### Tree-Shaking

`package.json` declares `"sideEffects": ["**/*.css"]`, telling bundlers that CSS imports are side effects but all JS modules are safe to tree-shake.

---

## Focus Management

Two hooks in `src/focus/` handle focus trapping and restoration for overlay components.

### useFocusTrap

`useFocusTrap(containerRef, isActive)` -- traps Tab/Shift+Tab within a container element.

- Queries all focusable elements via a static `FOCUSABLE_SELECTOR` (anchors, buttons, inputs, selects, textareas, elements with tabindex).
- On activation, auto-focuses the first focusable element.
- Tab at the last element wraps to the first; Shift+Tab at the first wraps to the last.
- All DOM access is inside `useEffect` for SSR safety.

### useFocusRestore

`useFocusRestore(isActive)` -- saves the active element when `isActive` becomes true, restores focus when it becomes false.

- Uses a ref to store the previously focused element.
- Before restoring, verifies the element is still in the DOM and focusable.
- Guards against stale references from elements removed during the overlay's lifetime.

### Usage

Dialog, Menu, and Popover use both hooks. DialogContent demonstrates the full pattern:

```tsx
useFocusTrap(internalRef, isOpen && focusManagement.trapFocus);
useFocusRestore(isOpen && focusManagement.restoreFocus);
```

The `focusManagement` flags come from the core hook and can be configured per-component (e.g., non-modal dialogs may skip focus trapping).

---

## Portal Rendering

Dialog, Popover, Toast, and DatePicker render their overlay content into a portal using `createPortal(content, document.body)`. This ensures overlays escape parent stacking contexts and z-index constraints.

### SSR Safety

Portal rendering is gated behind a mount check to avoid `document` access during server-side rendering:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);

if (!mounted || !isOpen) return null;
return createPortal(content, document.body);
```

This pattern ensures the component renders `null` on the server and during the first client render pass, then portals content after hydration.

---

## i18n Integration

### LocaleProvider and useLocale

Located in `src/i18n/i18n-context.tsx`. Provides a `LocaleContext` with a default value of `defaultLocale` (English, from `@entropix/core`).

- `LocaleProvider` accepts a partial locale object and merges it onto the English defaults with `{ ...defaultLocale, ...overrides }`.
- `useLocale()` returns the resolved `EntropixLocale` object.
- Components call `useLocale()` for translatable strings (aria-labels, placeholders, empty state messages).
- Works without a provider -- components fall back to English.

```tsx
// Optional -- only needed for non-English apps
<LocaleProvider locale={{ select_placeholder: "Choisir..." }}>
  <App />
</LocaleProvider>
```

---

## Responsive Hooks

Located in `src/utils/use-breakpoint.ts`. Four exports:

| Export               | Purpose                                                    |
|----------------------|------------------------------------------------------------|
| `useBreakpoint()`    | Returns current breakpoint name: `"base"` through `"2xl"` |
| `useMediaQuery(q)`   | Subscribes to a CSS media query, returns boolean           |
| `useBreakpointValue(bp)` | Returns true if viewport is at or above the given breakpoint |
| `BREAKPOINTS`        | Constant: `{ sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 }` |

All hooks handle SSR by returning safe defaults (`"base"` / `false`) when `window` is undefined.

---

## Multi-Entry Build

tsup is configured with 19 entry points (18 component families + the barrel `index.ts`). This enables deep imports:

```ts
import { Button } from "@entropix/react/button";       // minimal bundle
import { Dialog, DialogContent } from "@entropix/react/dialog";
import { Stack, Container } from "@entropix/react/layout";
```

Each entry point is exposed in `package.json` `exports` with both ESM and CJS targets plus TypeScript declarations. The barrel `index.ts` re-exports everything for convenience.

Build output: ESM + CJS, with declaration files, source maps, and code splitting enabled. React, ReactDOM, and `@entropix/core` are externalized.

---

## CSS Minification

The tsup `onSuccess` hook runs `node ../../scripts/minify-css.js` after every build. This script uses Lightning CSS to minify all `.css` files in the `dist/` directory, producing optimized output with vendor prefixing and modern syntax lowering.

---

## Testing

- **Framework:** Vitest with `jsdom` environment
- **Libraries:** `@testing-library/react` for rendering and queries, `@testing-library/user-event` for simulating user interactions, `@testing-library/jest-dom` for DOM matchers
- **Test location:** `src/__tests__/`

---

## File Structure

```
packages/react/
  src/
    index.ts                        # barrel re-export
    components/
      button.tsx                    # single-file component
      toggle.tsx
      switch.tsx
      input.tsx
      textarea.tsx
      checkbox.tsx
      dialog/
        index.ts                    # re-exports all dialog pieces
        dialog.tsx                  # root (context provider)
        dialog-context.tsx          # createContext + useDialogContext
        dialog-trigger.tsx
        dialog-overlay.tsx
        dialog-content.tsx          # portal + focus trap
        dialog-title.tsx
        dialog-description.tsx
        dialog-close.tsx
      tabs/
        index.ts
        tabs.tsx
        tabs-context.tsx
        tab-list.tsx
        tab.tsx
        tab-panel.tsx
      accordion/
        index.ts
        accordion.tsx
        accordion-context.tsx
        accordion-item.tsx
        accordion-trigger.tsx
        accordion-panel.tsx
      menu/
        index.ts
        menu.tsx
        menu-context.tsx
        menu-trigger.tsx
        menu-content.tsx
        menu-item.tsx
      radio/
        index.ts
        radio-context.tsx
        radio-group.tsx
        radio-item.tsx
      select/
        index.ts
        select.tsx
        select-context.tsx
        select-trigger.tsx
        select-content.tsx
        select-option.tsx
      toast/
        index.ts
        toast-context.tsx
        toast-provider.tsx
        toast.tsx
      popover/
        index.ts
        popover.tsx
        popover-context.tsx
        popover-trigger.tsx
        popover-content.tsx
        tooltip.tsx                 # convenience wrapper
      date-picker/
        index.ts
        date-picker.tsx
        calendar.tsx
      breadcrumb/
        index.ts
        breadcrumb.tsx
        breadcrumb-item.tsx
      pagination/
        index.ts
        pagination.tsx
      layout/
        index.ts
        stack.tsx
        inline.tsx
        container.tsx
        divider.tsx
    focus/
      use-focus-trap.ts
      use-focus-restore.ts
    i18n/
      i18n-context.tsx              # LocaleProvider + useLocale
      index.ts
    utils/
      cn.ts                         # class name joiner
      map-accessibility-to-aria.ts  # AccessibilityProps -> aria-* attrs
      use-keyboard-handler.ts       # KeyboardHandlerConfig -> onKeyDown
      use-breakpoint.ts             # responsive hooks + BREAKPOINTS
    styles/
      index.css                     # imports all component CSS
      button.css
      toggle.css
      switch.css
      input.css
      textarea.css
      checkbox.css
      radio.css
      select.css
      dialog.css
      tabs.css
      accordion.css
      menu.css
      toast.css
      popover.css
      date-picker.css
      breadcrumb.css
      pagination.css
      layout.css
    __tests__/
      ...
  tsup.config.ts                    # 19 entry points, ESM+CJS, CSS minification
  package.json                      # sideEffects: ["**/*.css"], 19 exports entries
```
