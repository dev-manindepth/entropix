# @entropix/react -- Implementation Guide

This document teaches you how to think about and write code in the `@entropix/react` package. It covers the mental model, component patterns, CSS conventions, and step-by-step checklists for adding new components.

---

## 1. Mental Model

This package is the **web adapter layer**. It takes platform-neutral hooks from `@entropix/core` and turns them into styled HTML with proper ARIA attributes and keyboard handling.

The core package thinks in abstract terms: "this is a button with role=button, it can be activated". The React package says: "render `<button className='entropix-button' aria-role='button'>` with click and keydown handlers."

**Every component follows the same five-step pattern:**

```
import hook from core -> call hook -> map accessibility to ARIA -> map keyboard -> render HTML with CSS classes
```

The key utilities that make this work:

- `mapAccessibilityToAria()` -- converts core's `AccessibilityProps` to DOM `aria-*` attributes
- `useKeyboardHandler()` -- converts core's `KeyboardHandlerConfig` to a React `onKeyDown` handler
- `cn()` -- joins class names, filtering out falsy values

---

## 2. Walkthrough: Building a Simple Component (Button)

Here is the actual Button component, annotated step by step:

```tsx
import { forwardRef, useCallback, useMemo } from "react";
import { useButton } from "@entropix/core";
import { mapAccessibilityToAria } from "../utils/map-accessibility-to-aria.js";
import { useKeyboardHandler } from "../utils/use-keyboard-handler.js";
import { cn } from "../utils/cn.js";
import "../styles/button.css";

export const Button = forwardRef<HTMLElement, ButtonProps>(function Button(
  { disabled, loading, onPress, as: Component = "button",
    variant, size, className, style, children, onClick,
    onKeyDown: externalOnKeyDown, ...rest },
  ref,
) {
  // STEP 1: Determine the element type for the core hook.
  // Core needs to know if this is a <button> (native behavior)
  // or a <div> (needs role="button" + tabIndex).
  const elementType = typeof Component === "string" ? Component : "div";

  // STEP 2: Call the core hook. This returns:
  //   - isDisabled / isLoading: derived state
  //   - getButtonProps(): a "prop getter" that returns accessibility,
  //     keyboard config, and an onAction callback
  const { isDisabled, isLoading, getButtonProps } = useButton({
    disabled,
    loading,
    onPress,
    elementType,
  });

  // STEP 3: Get the prop getter return value.
  // This object contains:
  //   { accessibility: AccessibilityProps,
  //     keyboardConfig: KeyboardHandlerConfig,
  //     onAction: () => void }
  const propGetterReturn = getButtonProps();

  // STEP 4: Map accessibility to ARIA attributes.
  // { role: "button", disabled: true } -> { role: "button", "aria-disabled": true }
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

  // STEP 5: Set up keyboard handler.
  // The core says "Enter and Space should trigger 'activate'".
  // We map 'activate' to the onAction callback.
  const actionMap = useMemo(
    () => ({ activate: propGetterReturn.onAction ?? (() => {}) }),
    [propGetterReturn.onAction],
  );
  const onKeyDown = useKeyboardHandler(propGetterReturn.keyboardConfig, actionMap);

  // STEP 6: Compose click and keydown handlers with any external handlers.
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      propGetterReturn.onAction?.();
      onClick?.(event);
    },
    [propGetterReturn.onAction, onClick],
  );

  // STEP 7: Render with CSS classes and data attributes.
  const dataState = isLoading ? "loading" : isDisabled ? "disabled" : undefined;

  return (
    <Component
      ref={ref}
      className={cn(
        "entropix-button",
        variant && `entropix-button--${variant}`,
        size && `entropix-button--${size}`,
        className,
      )}
      {...ariaProps}
      {...rest}
      onClick={propGetterReturn.onAction || onClick ? handleClick : undefined}
      onKeyDown={onKeyDown || externalOnKeyDown ? handleKeyDown : undefined}
      data-state={dataState}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </Component>
  );
});
```

**Key takeaways:**

- The component itself does NOT decide what ARIA attributes to use -- core does.
- The component itself does NOT decide what keys trigger actions -- core does.
- The component is responsible for: CSS classes, data attributes, composing handlers, forwarding refs.

---

## 3. Walkthrough: Building a Compound Component (Dialog)

Compound components use React Context to share state from a root hook across multiple sub-components.

**Component tree:**

```
Dialog (root) -- creates context from useDialog()
  DialogTrigger -- reads context, renders button that opens dialog
  DialogOverlay -- backdrop, click-to-dismiss
  DialogContent -- portal + focus trap + focus restore
  DialogTitle -- linked via aria-labelledby
  DialogDescription -- linked via aria-describedby
  DialogClose -- button that closes dialog
```

**Step 1: Create the context file.**

```tsx
// dialog-context.tsx
import { createContext, useContext } from "react";
import type { UseDialogReturn } from "@entropix/core";

export const DialogContext = createContext<UseDialogReturn | null>(null);

export function useDialogContext(): UseDialogReturn {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(
      "Dialog compound components must be used within a <Dialog> provider.",
    );
  }
  return context;
}
```

**Step 2: The root component calls the core hook and provides context.**

```tsx
// dialog.tsx
export function Dialog({ children, isOpen, defaultOpen, onOpenChange, ...rest }: DialogProps) {
  const dialog = useDialog({ isOpen, defaultOpen, onOpenChange, ...rest });
  return (
    <DialogContext.Provider value={dialog}>{children}</DialogContext.Provider>
  );
}
```

The root renders NO DOM of its own. It is a pure state container.

**Step 3: Sub-components read context and render.**

```tsx
// dialog-trigger.tsx
export const DialogTrigger = forwardRef(function DialogTrigger({ children, ... }, ref) {
  const { getTriggerProps } = useDialogContext();
  const propGetterReturn = getTriggerProps();
  const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

  return (
    <button ref={ref} {...ariaProps} onClick={() => propGetterReturn.onAction?.()}>
      {children}
    </button>
  );
});
```

**Step 4: DialogContent uses focus management and portals.**

```tsx
// dialog-content.tsx (simplified)
export const DialogContent = forwardRef(function DialogContent({ children, ... }, ref) {
  const { isOpen, close, getContentProps, focusManagement } = useDialogContext();

  // SSR-safe portal gating
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Focus management
  useFocusTrap(internalRef, isOpen && focusManagement.trapFocus);
  useFocusRestore(isOpen && focusManagement.restoreFocus);

  // Keyboard: Escape -> dismiss
  const actionMap = useMemo(() => ({ dismiss: close }), [close]);
  const onKeyDown = useKeyboardHandler(propGetterReturn.keyboardConfig, actionMap);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div ref={ref} className="entropix-dialog-content" data-state="open" {...ariaProps}>
      {children}
    </div>,
    document.body
  );
});
```

---

## 4. How to Write CSS for a Component

**Naming convention: BEM with `entropix-` prefix.**

```
.entropix-{component}           -- block
.entropix-{component}__{part}   -- element (sub-part)
.entropix-{component}--{mod}    -- modifier (variant/size)
```

**Use CSS custom properties for all visual values:**

```css
.entropix-button {
  font-family: var(--entropix-font-family-sans);
  border-radius: var(--entropix-button-border-radius);
  padding: var(--entropix-button-padding-y) var(--entropix-button-padding-x);
}

.entropix-button--primary {
  background: var(--entropix-button-primary-bg);
  color: var(--entropix-button-primary-text);
}
```

**Use data attributes for state, not class toggles:**

```css
.entropix-button[data-state="disabled"],
.entropix-button[data-state="loading"] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.entropix-dialog-content[data-state="open"] {
  /* animate in */
}
```

**Always include focus-visible styles:**

```css
.entropix-button:focus-visible {
  outline: 2px solid var(--entropix-color-border-focus);
  outline-offset: 2px;
}
```

**Mobile touch targets:**

```css
@media (max-width: 767px) {
  .entropix-button {
    min-height: 44px;  /* Apple HIG minimum */
  }
}
```

**Register your CSS in `src/styles/index.css`:**

```css
@import "./button.css";
@import "./your-new-component.css";
```

---

## 5. How to Add a New Component -- Checklist

Use this checklist every time you add a component.

- [ ] **Core hook**: Create `useYourComponent()` in `@entropix/core` that returns accessibility props, keyboard config, and action callbacks
- [ ] **Component file(s)**: Create in `src/components/{name}/` (or `src/components/{name}.tsx` for simple components)
- [ ] **CSS file**: Create `src/styles/{name}.css` using BEM + custom properties
- [ ] **CSS import**: Add `@import "./{name}.css"` to `src/styles/index.css`
- [ ] **Export**: Add component and type exports to `src/index.ts`
- [ ] **tsup entry**: Add entry to `tsup.config.ts` for tree-shaking:
  ```ts
  entry: {
    "your-component": "src/components/your-component/index.ts",
  }
  ```
- [ ] **i18n strings**: If the component has user-visible text (e.g., "Close"), add strings to `@entropix/core`'s locale system
- [ ] **Storybook story**: Write a story showing all variants and states

---

## 6. Focus Management

Two hooks handle focus for overlay components:

**`useFocusTrap(containerRef, isActive)`**

When `isActive` is true:
- Auto-focuses the first focusable element inside the container
- Tab at the last element wraps to the first
- Shift+Tab at the first element wraps to the last

Focusable elements are queried via: `a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`

**`useFocusRestore(isActive)`**

- When `isActive` becomes true: saves `document.activeElement`
- When `isActive` becomes false: restores focus to the saved element (if still in DOM)

**Used by:** Dialog, Menu, Popover -- any component that opens a floating layer.

Both hooks are SSR-safe: all DOM access is inside `useEffect`.

---

## 7. Portal Pattern (SSR-Safe)

All overlay components (Dialog, Menu, Popover, Select dropdown) render into a portal. To avoid SSR hydration mismatches, gate the portal behind a mount check:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

// During SSR, mounted is false, so the portal never renders server-side.
// After hydration, the effect fires and the portal renders client-side.
if (!mounted || !isOpen) return null;

return createPortal(
  <div className="entropix-dialog-content">{children}</div>,
  document.body
);
```

This pattern prevents the React warning about server/client markup mismatch when using `createPortal`.

---

## 8. The mapAccessibilityToAria Utility

This function is the bridge between core's platform-neutral accessibility model and the DOM. Here is the full mapping:

| Core prop     | DOM attribute        |
|---------------|---------------------|
| `role`        | `role`              |
| `label`       | `aria-label`        |
| `labelledBy`  | `aria-labelledby`   |
| `describedBy` | `aria-describedby`  |
| `disabled`    | `aria-disabled`     |
| `expanded`    | `aria-expanded`     |
| `selected`    | `aria-selected`     |
| `checked`     | `aria-checked`      |
| `pressed`     | `aria-pressed`      |
| `busy`        | `aria-busy`         |
| `modal`       | `aria-modal`        |
| `hasPopup`    | `aria-haspopup`     |
| `controls`    | `aria-controls`     |
| `orientation` | `aria-orientation`  |
| `tabIndex`    | `tabIndex`          |
| `hidden`      | `aria-hidden`       |

Undefined values are filtered out to keep the rendered DOM clean.

---

## 9. The useKeyboardHandler Utility

Converts core's `KeyboardHandlerConfig` into a React `onKeyDown` handler.

```
Core says:
  keyboardConfig.getIntent("Enter", { shift: false, meta: false, alt: false })
    -> "activate"

You provide:
  actionMap = { activate: () => propGetterReturn.onAction() }

Result:
  When user presses Enter, onAction() is called and event.preventDefault() fires.
```

Returns `undefined` when no `keyboardConfig` is provided (e.g., when the component is disabled), so you can safely pass it to `onKeyDown` without extra checks.
