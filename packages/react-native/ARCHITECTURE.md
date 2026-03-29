# @entropix/react-native Architecture

## Purpose

`@entropix/react-native` provides the React Native component layer of the Entropix design system. It shares the same headless hooks from `@entropix/core` as the web package, but renders using React Native primitives (`View`, `Text`, `Pressable`, `ScrollView`, `Modal`) with `StyleSheet`-based styling driven by theme tokens.

```tsx
import { EntropixProvider, Button } from "@entropix/react-native";

<EntropixProvider brand="ocean" mode="dark">
  <Button variant="primary" size="md" onPress={handleSave}>
    Save Changes
  </Button>
</EntropixProvider>
```

Unlike the web package (which uses CSS custom properties that resolve at runtime), React Native requires explicit token values at render time. The `EntropixProvider` resolves the correct token set and makes it available to all components via context.

---

## How It Mirrors @entropix/react

Both packages follow the same fundamental architecture. The differences are strictly platform-level:

| Concern               | @entropix/react                         | @entropix/react-native                          |
|-----------------------|-----------------------------------------|--------------------------------------------------|
| Core hooks            | Same (`useButton`, `useDialog`, etc.)   | Same (`useButton`, `useDialog`, etc.)            |
| Accessibility mapping | `mapAccessibilityToAria()` -> aria-*    | `mapAccessibilityToRN()` -> accessibilityRole/State |
| Styling               | CSS custom properties, BEM classes      | StyleSheet, inline styles from tokens            |
| Overlays              | `createPortal(content, document.body)`  | `<Modal>` component                             |
| Focus management      | `useFocusTrap`, `useFocusRestore`       | RN handles natively (not needed)                 |
| Keyboard handling     | `useKeyboardHandler()` -> onKeyDown     | Not applicable (hardware keyboard rare)          |
| String children       | Native HTML text nodes                  | `wrapStringChildren()` -> `<Text>` wrapper       |

### Shared Patterns

- **Hook consumption:** Every component calls the core hook, destructures `getButtonProps()` / `getContentProps()` etc., and maps the returned `AccessibilityProps` through the platform adapter.
- **Compound components:** Dialog, Tabs, Select, Menu, Accordion, Radio, Toast, Popover, DatePicker, and Breadcrumb all use the same React Context pattern -- root provides state, children consume via `use{Component}Context()`.
- **Component inventory:** The same 18 component families plus 4 layout primitives exist in both packages, with identical APIs where feasible.

---

## Theme System

### EntropixProvider

Located at `src/theme/theme-context.tsx`. This is the root provider that wraps a React Native app. It provides both theme tokens and locale context to all descendant components.

```tsx
<EntropixProvider brand="ocean" mode="dark" locale={{ select_placeholder: "Choisir..." }}>
  <App />
</EntropixProvider>
```

Props:
- `mode` -- `"light"` or `"dark"` (default: `"light"`)
- `brand` -- Brand name string (default: `"default"`)
- `tokens` -- Direct token override (bypasses brand registry)
- `locale` -- Partial locale overrides merged onto English defaults

The provider resolves tokens through this priority chain:
1. If `tokens` prop is provided, use it directly.
2. Otherwise, look up `brand` in the brand registry, then select the `mode` variant.
3. If the brand is not registered, fall back to the `"default"` brand.

### useTheme Hook

```tsx
const { tokens, baseTokens, mode, brand } = useTheme();
```

Returns a `ThemeContextValue` with:
- `tokens` -- The resolved theme-aware tokens (colors change between light/dark and across brands)
- `baseTokens` -- Platform-primitive tokens that do not change with theme (spacing, radii, font sizes, etc.)
- `mode` -- Current `"light"` or `"dark"`
- `brand` -- Current brand name string

Components use `tokens` for color values and `baseTokens` for structural values:

```tsx
const { tokens: t, baseTokens: bt } = useTheme();

const style = {
  backgroundColor: t.entropixButtonPrimaryBg,          // theme-aware color
  borderRadius: bt.entropixButtonBorderRadius,          // structural constant
  paddingVertical: bt.entropixButtonPaddingY,            // structural constant
};
```

### Context Structure

`EntropixProvider` nests two contexts:
1. `ThemeContext` (outer) -- provides `{ mode, brand, tokens, baseTokens }`
2. `LocaleContext` (inner) -- provides the resolved `EntropixLocale` object

This means `useTheme()` and `useLocale()` both work anywhere under the provider.

---

## Brand Registry

The brand registry is a module-level `Record<string, BrandThemes>` where `BrandThemes = Record<ThemeMode, EntropixTheme>`.

### registerBrand

```tsx
import { registerBrand } from "@entropix/react-native";
import { tokens as oceanLight } from "@entropix/tokens/brands/ocean/native/light";
import { tokens as oceanDark } from "@entropix/tokens/brands/ocean/native/dark";

registerBrand("ocean", { light: oceanLight, dark: oceanDark });
```

Call `registerBrand()` before rendering `EntropixProvider`. The registry starts with a `"default"` entry containing the base light and dark token sets from `@entropix/tokens/native`.

Why a registry pattern instead of passing tokens via props:
- **App-level configuration:** Brands are registered once at startup, not threaded through every component tree.
- **Multi-brand apps:** An app can register multiple brands and switch between them by changing the `brand` prop on `EntropixProvider`.
- **Lazy loading:** Brand token files can be dynamically imported and registered on demand.
- **Direct override:** The `tokens` prop on `EntropixProvider` bypasses the registry entirely for cases where a registry is overkill.

---

## mapAccessibilityToRN

Located at `src/utils/map-accessibility-to-rn.ts`. The React Native counterpart of the web's `mapAccessibilityToAria()`.

Key differences from the web adapter:

| Core Prop    | Web Output            | RN Output                                      |
|--------------|-----------------------|-------------------------------------------------|
| `role`       | `role="button"`       | `accessibilityRole="button"` (via RN_ROLE_MAP)  |
| `label`      | `aria-label="..."`    | `accessibilityLabel="..."`                       |
| `describedBy`| `aria-describedby`    | `accessibilityHint` (closest RN equivalent)      |
| `disabled`   | `aria-disabled`       | `accessibilityState.disabled`                    |
| `expanded`   | `aria-expanded`       | `accessibilityState.expanded`                    |
| `selected`   | `aria-selected`       | `accessibilityState.selected`                    |
| `checked`    | `aria-checked`        | `accessibilityState.checked`                     |
| `busy`       | `aria-busy`           | `accessibilityState.busy`                        |
| `hidden`     | `aria-hidden`         | `accessibilityElementsHidden` (iOS) + `importantForAccessibility="no-hide-descendants"` (Android) |
| `valueNow`   | `aria-valuenow`       | `accessibilityValue.now`                         |
| `live`       | `aria-live`           | `accessibilityLiveRegion` ("off" -> "none")      |

Props silently dropped (no RN equivalent): `modal`, `hasPopup`, `controls`, `owns`, `tabIndex`, `pressed`, `required`, `invalid`.

The role mapper (`RN_ROLE_MAP`) translates ARIA roles to their closest React Native accessibility role. Notable mappings: `dialog` -> `"none"` (Modal handles semantics), `slider` -> `"adjustable"`, `alertdialog` -> `"alert"`.

---

## i18n

`src/i18n/i18n-context.tsx` exports `LocaleContext` and `useLocale()`.

Unlike the web package (which has its own standalone `LocaleProvider`), the React Native locale context is provided by `EntropixProvider` itself. The `LocaleContext` is nested inside the `ThemeContext` provider, so a single provider handles both theme and locale.

The `useLocale()` hook works identically to the web version -- it reads from `LocaleContext` and returns the full `EntropixLocale` object. Works without a provider (defaults to English via the context's default value).

---

## Platform Differences from Web

### No CSS -- StyleSheet Only

React Native has no CSS engine. All styling uses `StyleSheet.create()` or inline style objects. Token values are read from the theme context at render time and applied as numeric/string style properties:

```tsx
const style = {
  paddingHorizontal: bt.entropixButtonPaddingX as number,
  backgroundColor: t.entropixButtonPrimaryBg as string,
  borderRadius: bt.entropixButtonBorderRadius as number,
};
```

Variant and size styling are computed via helper functions (e.g., `getVariantStyle()`, `getSizeStyle()`) that switch on the variant/size prop and return style objects.

### No Portals -- Modal Component

React Native does not have `createPortal()`. Overlay components (Dialog, Menu, Select dropdown, DatePicker) use React Native's `<Modal>` component, which renders content above the app's view hierarchy natively.

### No Focus Management

React Native handles focus natively through the platform's accessibility system. There is no `useFocusTrap` or `useFocusRestore` -- those hooks exist only in `@entropix/react`.

### ScrollView-Based TabList

On web, TabList renders a horizontal `<div>` with `role="tablist"`. On React Native, it uses a horizontal `<ScrollView>` to allow tabs to scroll when they overflow the screen width.

### measureInWindow for Positioning

Popover and Tooltip use `measureInWindow()` from React Native's layout system to determine the trigger element's position and compute popover placement. The web package uses `getBoundingClientRect()` instead.

### String Children Wrapping

React Native requires all text to be inside `<Text>` components. The `wrapStringChildren()` utility (`src/utils/wrap-string-children.tsx`) automatically wraps bare string children in `<Text>` elements so components like Button can accept string children naturally:

```tsx
<Button onPress={fn}>Save</Button>  // "Save" gets wrapped in <Text>
```

---

## Responsive Hooks

Located in `src/utils/use-breakpoint.ts`. Three hooks plus constants:

| Export                  | Purpose                                                         |
|-------------------------|-----------------------------------------------------------------|
| `useBreakpoint()`       | Returns current breakpoint from `Dimensions.get("window")`     |
| `useBreakpointValue(bp)`| Returns true if screen width >= breakpoint threshold            |
| `useScreenDimensions()` | Returns `{ width, height }`, updating on orientation changes    |
| `BREAKPOINTS`           | Same constant as web: `{ sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 }` |

The hooks use `Dimensions.addEventListener("change", ...)` to respond to orientation changes, split-screen resizing, and other dimension updates. The web package uses `window.addEventListener("resize", ...)` and `window.matchMedia()` for the same purpose.

---

## Testing

- **Framework:** Jest with `react-test-renderer`
- **Library:** `@testing-library/react-native` for rendering and queries
- **Test location:** `src/__tests__/`

---

## File Structure

```
packages/react-native/
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
        index.ts
        dialog.tsx                  # root context provider
        dialog-context.tsx
        dialog-trigger.tsx
        dialog-overlay.tsx
        dialog-content.tsx          # uses <Modal>
        dialog-title.tsx
        dialog-description.tsx
        dialog-close.tsx
      tabs/
        index.ts
        tabs.tsx
        tabs-context.tsx
        tab-list.tsx                # horizontal ScrollView
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
        popover-content.tsx         # uses measureInWindow
        tooltip.tsx
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
    theme/
      index.ts                      # re-exports provider + useTheme
      theme-context.tsx             # EntropixProvider, useTheme, registerBrand
    i18n/
      i18n-context.tsx              # LocaleContext + useLocale
      index.ts
    utils/
      map-accessibility-to-rn.ts    # AccessibilityProps -> RN accessibility props
      types.ts                      # RNAccessibilityProps type definition
      use-breakpoint.ts             # useBreakpoint, useBreakpointValue, useScreenDimensions
      wrap-string-children.tsx      # wraps bare strings in <Text>
    __tests__/
      ...
  tsup.config.ts                    # 20 entry points (18 components + theme + index)
  package.json                      # sideEffects: false, 20 exports entries
```
