# Entropix Design System — Architecture

## 1. Project Overview

Entropix is a cross-platform React Design System spanning 6 published npm packages that serve both web (React) and mobile (React Native). It follows a **headless-core + styled-adapter** architecture inspired by Adobe React Spectrum's layered approach — separating interaction logic from presentation so the same behavioral hooks drive components on both platforms.

**Published packages (all at v1.0.1):**

| Package | Purpose |
|---------|---------|
| `@entropix/core` | Headless hooks, accessibility primitives, chart math utilities |
| `@entropix/tokens` | W3C DTCG design tokens, multi-brand, light/dark themes |
| `@entropix/react` | Web components styled with CSS custom properties |
| `@entropix/react-native` | Mobile components with StyleSheet theming |
| `@entropix/data` | Web DataTable + Charts (Bar, Line, Area, Pie) |
| `@entropix/data-native` | Mobile DataTable + Charts using react-native-svg |

---

## 2. Architecture — The Three-Layer Model

```
┌──────────────────────────────────────────────────────┐
│  Layer 3: Styled Components                          │
│  @entropix/react          @entropix/react-native     │
│  (DOM + CSS)              (Native Views + StyleSheet) │
├──────────────────────────────────────────────────────┤
│  Layer 2: Design Tokens                              │
│  @entropix/tokens                                    │
│  CSS Variables (web)  ·  JS Objects (RN)  ·  Types   │
├──────────────────────────────────────────────────────┤
│  Layer 1: Headless Core                              │
│  @entropix/core                                      │
│  Hooks · Accessibility · Keyboard · State · Charts   │
└──────────────────────────────────────────────────────┘
```

### Layer 1: Headless Core (`@entropix/core`)

Platform-agnostic hooks that encapsulate all interaction logic:

`useButton`, `useToggle`, `useDialog`, `useTabs`, `useAccordion`, `useMenu`, `useInput`, `useSelect`, `useRadioGroup`, `useTable`

Each hook returns:
- **State** — current values (checked, expanded, selected, etc.)
- **Accessibility props** — WAI-ARIA roles, states, and properties
- **Keyboard handlers** — key-to-action mappings
- **Event callbacks** — action functions for the platform layer to wire up

The hooks use a **prop-getter pattern** (like Downshift / React Table). A consumer calls a function like `getToggleProps()` and receives a bag of props to spread onto their element:

```ts
// Inside @entropix/core — useToggle hook (simplified)
export function useToggle(options: UseToggleOptions = {}): UseToggleReturn {
  const [isChecked, setChecked] = useControllableState<boolean>({
    value: options.checked,
    defaultValue: options.defaultChecked ?? false,
    onChange: options.onChange,
  });

  const getToggleProps = (overrides?) => ({
    accessibility: {
      role: options.role ?? "checkbox",
      checked: isChecked,
      disabled: options.disabled || undefined,
      tabIndex: options.disabled ? -1 : 0,
    },
    keyboardConfig: options.disabled ? undefined : keyboardConfig,
    onAction: options.disabled ? undefined : (overrides?.onAction ?? toggle),
  });

  return { isChecked, isDisabled: options.disabled, toggle, setChecked, getToggleProps };
}
```

Zero DOM or React Native dependencies — pure React state and logic. Chart math utilities (scales, ticks, geometry, normalization) also live here.

#### Architectural Decision: Prop-Getter Pattern

| | |
|---|---|
| **Chosen** | Prop-getter pattern (like Downshift, React Table) |
| **Why** | Maximum flexibility — the consumer controls the DOM entirely. The hook returns `getToggleProps()` which gives you `role`, `aria-checked`, `onAction`, `keyboardConfig`. The platform layer decides how to apply them. |
| **Tradeoff** | Slightly more verbose than compound components, but enables platform adaptation: same hook produces different JSX on web vs React Native. |
| **Industry** | Adobe React Aria uses hooks. Radix uses compound components. Headless UI uses renderless components. We chose hooks because they work identically across web and RN — compound components assume a DOM. |

---

### Layer 2: Design Tokens (`@entropix/tokens`)

- **Source format:** W3C Design Token Community Group (DTCG) JSON
- **Build tool:** Style Dictionary
- **Outputs:** CSS custom properties (web), JS objects (RN), TypeScript type definitions
- **Multi-brand:** `ocean` (teal), `sunset` (orange) — brands override primitive and semantic tokens
- **Multi-theme:** light and dark per brand
- **Scale:** 235 CSS custom properties per brand-theme combination

Token structure:

```
tokens/src/
├── primitives/         # colors, spacing, typography, radii, shadows, motion
├── semantic/           # colors, spacing, typography (reference primitives)
├── themes/             # light.json, dark.json (map semantics to primitives)
├── components/         # component-level tokens (button.json, etc.)
└── brands/
    ├── ocean/          # overrides primitives + semantics + themes
    └── sunset/         # overrides primitives + semantics + themes
```

Example brand token (ocean light theme):

```json
{
  "color": {
    "action": {
      "primary": {
        "default": { "$value": "{color.teal.600}", "$type": "color" },
        "hover":   { "$value": "{color.teal.700}", "$type": "color" },
        "active":  { "$value": "{color.teal.800}", "$type": "color" }
      }
    }
  }
}
```

#### Architectural Decision: CSS Custom Properties

| | |
|---|---|
| **Chosen** | CSS custom properties (CSS variables) |
| **Why** | Zero runtime cost, works with any framework, SSR-friendly, cascade naturally handles theming via data attributes. |
| **Tradeoff** | No type-safe style props (like Chakra's `<Box bg="blue.500">`). Requires importing CSS files. |
| **Industry** | Shopify Polaris uses CSS variables. Ant Design uses CSS-in-JS (cssinjs). Chakra uses Emotion. We avoid runtime CSS-in-JS to keep bundle size minimal and enable SSR without hydration issues. |

---

### Layer 3: Styled Components (`@entropix/react`, `@entropix/react-native`)

The styled layer connects hooks to platform-specific rendering:

- **Web:** React components import headless hooks + CSS files with BEM classes
- **RN:** React Native components import hooks + inline StyleSheet using token values from `useTheme()`

Each component maps hook output to platform-specific JSX and accessibility attributes:
- Web uses `mapAccessibilityToAria()` to convert the generic accessibility bag to `aria-*` attributes
- RN uses `mapAccessibilityToRN()` to convert to `accessibilityRole`, `accessibilityState`, etc.

```tsx
// @entropix/react — Toggle component (simplified)
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle(props, ref) {
    const { isChecked, isDisabled, getToggleProps } = useToggle({
      checked: props.checked,
      defaultChecked: props.defaultChecked,
      onChange: props.onChange,
      disabled: props.disabled,
      role: "checkbox",
    });

    const propGetterReturn = getToggleProps();
    const ariaProps = mapAccessibilityToAria(propGetterReturn.accessibility);

    return (
      <button
        ref={ref}
        type="button"
        className={cn("entropix-toggle", props.className)}
        {...ariaProps}
        disabled={isDisabled || undefined}
        onClick={() => propGetterReturn.onAction?.()}
        data-state={isChecked ? "checked" : "unchecked"}
      >
        {props.children ?? props.label ?? (isChecked ? "On" : "Off")}
      </button>
    );
  },
);
```

#### Architectural Decision: Separate Packages per Platform

| | |
|---|---|
| **Chosen** | Separate `@entropix/react` and `@entropix/react-native` |
| **Why** | Web and RN have fundamentally different rendering models (DOM vs native views). A single package with platform switching adds complexity and increases bundle size for consumers targeting only one platform. |
| **Tradeoff** | Code duplication in component wrappers — roughly 30% shared logic lives in hooks, 70% is platform-specific JSX and styling. |
| **Industry** | Razorpay Blade uses a single package with platform detection. Adobe Spectrum has separate packages per component. We chose separate packages for cleaner tree shaking and simpler dependency trees. |

---

## 3. Multi-Brand Theming Architecture

### Web Strategy

Brand and theme switching is driven by CSS selector cascading with data attributes:

```html
<div data-brand="ocean" data-theme="dark">
  <!-- All components inside automatically pick up ocean/dark tokens -->
</div>
```

All brand CSS is pre-loaded. Switching is instant via DOM attribute change — no re-render needed, CSS variables cascade through the tree.

```css
/* Generated by Style Dictionary */
[data-brand="ocean"][data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-action-primary-default: #0d9488;
  /* ... 235 variables */
}

[data-brand="ocean"][data-theme="dark"] {
  --color-bg-primary: #0f172a;
  --color-action-primary-default: #2dd4bf;
  /* ... */
}
```

### React Native Strategy

A brand registry pattern with a context-based provider:

```ts
import { registerBrand, EntropixProvider } from "@entropix/react-native";
import { tokens as oceanLight } from "@entropix/tokens/brands/ocean/native/light";
import { tokens as oceanDark } from "@entropix/tokens/brands/ocean/native/dark";

// Register at app startup
registerBrand("ocean", { light: oceanLight, dark: oceanDark });

// Wrap the component tree
<EntropixProvider brand="ocean" mode="dark">
  <App />
</EntropixProvider>
```

Components access tokens via `useTheme()` — context-based, triggers re-render on brand or mode change.

#### Architectural Decision: Pre-Load All Brands

| | |
|---|---|
| **Chosen** | Pre-load all brand CSS (web), registry pattern (RN) |
| **Why** | Instant switching without network requests or FOUC. Brand CSS is small (~2-3KB per brand). |
| **Tradeoff** | Initial payload includes all brands. For 10+ brands, lazy loading would be more appropriate. |
| **Industry** | Shopify loads one theme at a time (single brand). Spectrum does not support multi-brand. Blade supports themes but not multi-brand. Our approach is closer to how large retail apps handle brand verticals. |

---

## 4. Data Components Architecture

### DataTable

- **Headless:** `useTable` hook in `@entropix/core` handles sorting, filtering, pagination, and selection state
- **Web:** Semantic HTML `<table>` with CSS
- **RN:** FlatList-based with horizontal ScrollView for wide tables
- **Features:** Multi-column sort, text/select filters, row selection with checkbox, pagination

### Charts (Bar, Line, Area, Pie)

- **Web:** Zero external dependencies — pure SVG rendering
- **RN:** `react-native-svg` (unavoidable — RN has no native SVG)
- **Shared math** in `@entropix/core`: linear/band scales, tick generation, arc geometry, line path computation
- **Brand-aware:** Web charts use CSS variables (`var(--chart-series-1)`), RN charts use a `useChartColors()` hook that reads primary brand color from tokens

#### Architectural Decision: Custom Chart Engine

| | |
|---|---|
| **Chosen** | Custom SVG rendering from scratch |
| **Why** | Full control, zero dependencies, brand-aware via token integration, SSR-safe. ~4KB bundle vs 50KB+ for Recharts. |
| **Tradeoff** | Fewer chart types, no animations yet, less battle-tested than D3. |
| **Industry** | Shopify Polaris Viz uses D3. Most design systems do not include charts at all. We chose custom for minimal bundle and tight token integration. |

---

## 5. Build and Optimization

### Multi-Entry Builds (tsup)

Each package produces per-component entry points alongside a barrel index:

```ts
// Per-component import — only Button code (932B gzipped)
import { Button } from "@entropix/react/button";

// Barrel import — still works (backward compatible)
import { Button } from "@entropix/react";
```

Shared utilities are automatically extracted to `chunk-*.js` files by the bundler.

### Tree Shaking

- `"sideEffects": false` on all non-CSS packages
- `"sideEffects": ["**/*.css"]` on packages with CSS imports
- Verified with esbuild-based test script (`scripts/verify-treeshake.mjs`)

### CSS Minification

lightningcss processes all CSS files during build:

| Package | Before | After | Savings |
|---------|--------|-------|---------|
| `@entropix/react` | 35KB | 28KB | 20.8% |
| `@entropix/data` | 17KB | 10KB | 41.9% |

### Bundle Sizes (minified + brotli)

| Package | Size |
|---------|------|
| `@entropix/core` | 5.69 KB |
| `@entropix/react` (full barrel) | 4.72 KB |
| `@entropix/react/button` (single) | 932 B |
| `@entropix/data` | 4.16 KB |

Sourcemaps are excluded from npm publish, saving ~940KB across all packages.

---

## 6. CI/CD Pipeline

- **GitHub Actions:** CI runs lint, build, and test across Node 18, 20, and 22
- **Changesets** for version management — creates a "Version Packages" PR automatically
- **Automated npm publishing** on PR merge to main
- **size-limit** enforced in CI to prevent bundle regressions

---

## 7. Testing

- **25 test files**, ~2,384 lines of test code
- **Vitest** for web packages, **Jest** for RN packages
- **@testing-library/react** and **@testing-library/react-native** for component tests
- Coverage areas: hook behavior, accessibility attributes, keyboard interactions, state management

---

## 8. Storybook

- **16 component stories** (all UI components)
- **Storybook 10** with Vite builder
- **@storybook/addon-a11y** for accessibility auditing
- **CSF3 format** with autodocs

---

## 9. Components Matrix

| Component | Web | RN | Headless Hook | Accessibility |
|-----------|:---:|:---:|---------------|---------------|
| Button | Y | Y | `useButton` | `role="button"`, `aria-disabled`, `aria-pressed` |
| Toggle | Y | Y | `useToggle` | `role="checkbox"`, `aria-checked` |
| Switch | Y | Y | `useToggle` | `role="switch"`, `aria-checked` |
| Dialog | Y | Y | `useDialog` | `role="dialog"`, `aria-modal`, focus trap |
| Tabs | Y | Y | `useTabs` | `role="tablist/tab/tabpanel"`, arrow key nav |
| Accordion | Y | Y | `useAccordion` | `aria-expanded`, `aria-controls` |
| Menu | Y | Y | `useMenu` | `role="menu/menuitem"`, typeahead |
| Input | Y | Y | `useInput` | `aria-invalid`, `aria-required`, `aria-describedby` |
| Textarea | Y | Y | `useInput` | Same as Input |
| Checkbox | Y | Y | `useToggle` | `role="checkbox"`, `aria-checked`, indeterminate |
| RadioGroup | Y | Y | `useRadioGroup` | `role="radiogroup/radio"`, arrow key nav |
| Select | Y | Y | `useSelect` | `role="listbox"`, `aria-expanded` |
| Stack | Y | Y | -- | Semantic layout |
| Inline | Y | Y | -- | Semantic layout |
| Container | Y | Y | -- | Max-width wrapper |
| Divider | Y | Y | -- | `role="separator"` |
| DataTable | Y | Y | `useTable` | Sort, filter, paginate, select |
| BarChart | Y | Y | -- | SVG with tooltips |
| LineChart | Y | Y | -- | SVG with data points |
| AreaChart | Y | Y | -- | SVG filled regions |
| PieChart | Y | Y | -- | SVG arcs with legend |

---

## 10. Gap Analysis vs Production Design Systems

Comparing Entropix against **Shopify Polaris**, **Razorpay Blade**, and **Adobe React Spectrum**.

### What Entropix Has That Others Don't

| Capability | Polaris | Blade | Spectrum | Entropix |
|------------|:-------:|:-----:|:--------:|:--------:|
| True cross-platform (web + RN) with shared headless core | -- | Partial | -- | Y |
| Built-in chart library | Separate (Polaris Viz) | -- | -- | Y |
| Multi-brand theming out of the box | -- | -- | -- | Y |
| Custom SVG chart engine (zero deps) | -- | -- | -- | Y |

### What Production Systems Have That Entropix Is Missing

#### Critical Gaps

| # | Gap | Notes |
|---|-----|-------|
| 1 | **Internationalization (i18n)** | Spectrum supports 30+ languages, RTL layout, date/number formatting. Entropix has none. |
| 2 | **Comprehensive accessibility testing** | Spectrum tests across VoiceOver, NVDA, JAWS. Entropix has basic ARIA attributes but no automated a11y testing in CI (axe-core integration). |
| 3 | **Visual regression testing** | Blade uses Chromatic for screenshot-based testing. Entropix has no visual regression tests. |
| 4 | **Focus management system** | Spectrum has FocusScope, FocusRing, focus-visible polyfill. Entropix relies on browser defaults. |
| 5 | **Animation system** | No transition/animation primitives. Production systems have enter/exit animations for Dialog, Menu, Accordion, Toast. |

#### Component Gaps

| # | Missing Component | Category |
|---|-------------------|----------|
| 6 | Toast / Notification | Feedback |
| 7 | Popover / Tooltip | Overlay |
| 8 | DatePicker / Calendar | Input |
| 9 | Breadcrumb | Navigation |
| 10 | Pagination (standalone) | Navigation |
| 11 | Avatar | Display |
| 12 | Badge / Tag | Status |
| 13 | Progress Bar / Spinner | Loading |
| 14 | Skeleton Loader | Loading |
| 15 | Navigation / Sidebar | App-level |
| 16 | Alert / Banner | Feedback |

#### Infrastructure Gaps

| # | Gap | Notes |
|---|-----|-------|
| 17 | **Figma integration** | Blade has a Figma plugin that syncs tokens. Spectrum has a Figma kit. Entropix has none. |
| 18 | **Documentation site** | Polaris has extensive docs with live examples and do's/don'ts. Entropix has Storybook but no dedicated doc site. |
| 19 | **Codemods** | Polaris provides codemods for major version migrations. |
| 20 | **ESLint plugin** | Custom lint rules enforcing component usage patterns. |
| 21 | **Design-to-dev workflow** | Figma-to-code token sync, coverage plugins. |
| 22 | **Server Components support** | Explicit `"use client"` boundaries, RSC-optimized patterns. |
| 23 | **Responsive props** | Spectrum/Chakra allow `<Button size={{ base: "sm", md: "lg" }}>`. Entropix has `useBreakpoint` but not responsive prop syntax. |

### Recommended Next Priorities

1. **Toast/Notification + Popover/Tooltip** — most commonly needed missing components
2. **Animation system** — enter/exit transitions for Dialog, Menu, Accordion
3. **axe-core integration in CI** — automated accessibility testing
4. **Documentation site** with live examples
5. **i18n foundation** — RTL support, locale-aware formatting
