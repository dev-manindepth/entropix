# Entropix Design System — Architecture Document

> A cross-platform, headless-first design system built with React, React Native, and W3C Design Tokens.

---

## Table of Contents

1. [High-Level Overview](#1-high-level-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Package-by-Package Deep Dive](#3-package-by-package-deep-dive)
   - [3.1 @entropix/tokens](#31-entropixtokens--design-tokens)
   - [3.2 @entropix/core](#32-entropixcore--headless-component-logic)
   - [3.3 @entropix/react](#33-entropixreact--web-components)
   - [3.4 @entropix/react-native](#34-entropixreact-native--mobile-components)
   - [3.5 Shared Config Packages](#35-shared-config-packages)
4. [Design Decisions & Rationale](#4-design-decisions--rationale)
5. [Cross-Platform Strategy](#5-cross-platform-strategy)
6. [Theming Architecture](#6-theming-architecture)
7. [Accessibility Architecture](#7-accessibility-architecture)
8. [Responsive Architecture](#8-responsive-architecture)
9. [Build Pipeline & Scripts](#9-build-pipeline--scripts)
10. [Apps & Validation](#10-apps--validation)
11. [Scalability Assessment](#11-scalability-assessment)
12. [Known Issues & Gaps](#12-known-issues--gaps)

---

## 1. High-Level Overview

Entropix is a **headless-first, cross-platform design system** that separates component logic from presentation. The architecture follows a layered approach:

```
┌─────────────────────────────────────────────────────────────┐
│                        Consumer Apps                         │
│   apps/web (Next.js)    apps/mobile (Expo)    apps/storybook│
├─────────────────────────┬───────────────────────────────────┤
│  @entropix/react        │  @entropix/react-native           │
│  (Web Components +      │  (RN Components +                 │
│   CSS Side-Effects)      │   Theme Provider)                 │
├─────────────────────────┴───────────────────────────────────┤
│                     @entropix/core                           │
│          (Headless Hooks · Accessibility · Keyboard)         │
├─────────────────────────────────────────────────────────────┤
│                    @entropix/tokens                          │
│     (W3C DTCG · Primitives · Semantic · Themes · Components)│
└─────────────────────────────────────────────────────────────┘
```

**Core principle:** Write component behavior once in `@entropix/core`, then adapt it for each platform in `@entropix/react` (web) and `@entropix/react-native` (mobile). Design tokens compile from a single source to platform-specific outputs (CSS variables, JS modules).

---

## 2. Monorepo Structure

```
entropix/
├── apps/
│   ├── web/              → Next.js playground (port 3000)
│   ├── docs/             → Next.js documentation (port 3001)
│   ├── mobile/           → Expo React Native app
│   └── storybook/        → Storybook 10.x with Vite (port 6006)
├── packages/
│   ├── core/             → Headless hooks & utilities
│   ├── tokens/           → W3C DTCG design tokens + build pipeline
│   ├── react/            → Web (React DOM) components + CSS
│   ├── react-native/     → React Native components + theme provider
│   ├── eslint-config/    → Shared ESLint configurations
│   ├── typescript-config/ → Shared TypeScript configurations
│   └── ui/               → Generic unstyled components (docs-only)
├── turbo.json            → Turborepo pipeline config
├── pnpm-workspace.yaml   → Workspace definitions
└── package.json          → Root scripts & orchestration
```

**Tooling:**
- **Package manager:** pnpm 9.x with workspace protocol (`workspace:*`)
- **Build orchestrator:** Turborepo 2.8 with task caching
- **Bundler:** tsup (esbuild-based) for all library packages
- **Token compiler:** Style Dictionary v4
- **Test runners:** Vitest (core, react), Jest (react-native)
- **Type checking:** TypeScript 5.9 with strict mode

---

## 3. Package-by-Package Deep Dive

### 3.1 @entropix/tokens — Design Tokens

**Purpose:** Single source of truth for all design values (colors, spacing, typography, shadows, motion). Compiles to platform-specific outputs via Style Dictionary.

#### Token Architecture (Layered)

```
src/
├── primitives/          ← Raw, unscoped values
│   ├── colors.json         11 color scales (gray, blue, green, red, amber, purple) × 11 levels
│   ├── spacing.json        4px base unit: 0-24 scale (0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px)
│   ├── typography.json     Font families (sans, mono), sizes (xs-4xl), weights, line-heights
│   ├── radii.json          none → sm → md → lg → xl → 2xl → full
│   ├── shadows.json        Elevation scale (none → xl) as DTCG shadow objects
│   └── motion.json         Durations (fast: 100ms → slower: 500ms), cubic-bezier easings
│
├── semantic/            ← Purpose-driven references to primitives
│   ├── colors.json         bg.primary, text.primary, border.focus, action.primary, feedback.error...
│   ├── spacing.json        component.padding-sm, layout.section-gap, layout.page-margin...
│   └── typography.json     Composite presets: heading.xl/lg/md/sm, body.lg/md/sm, label, code
│
├── themes/              ← Override semantic tokens per theme
│   ├── light.json          Confirms light defaults (bg.primary → white, text.primary → gray-900)
│   └── dark.json           Remaps for dark mode (bg.primary → gray-950, text.primary → gray-50)
│
└── components/          ← Component-scoped tokens
    └── button.json         padding, gap, border-radius, variant colors (primary/secondary/danger)
```

**Why this layering?**
- **Primitives** are raw values that never change between themes.
- **Semantic** tokens give purpose to primitives (e.g., "primary background" instead of "white").
- **Themes** swap only the semantic mapping (light: bg=white, dark: bg=gray-950).
- **Component** tokens reference semantic tokens for component-specific concerns.

This means adding a new theme (e.g., "high-contrast") requires only a new theme JSON file — no component changes needed.

#### Build Pipeline (build.ts)

The build script registers 4 custom Style Dictionary transforms and 1 custom format:

| Transform | Purpose | Example |
|-----------|---------|---------|
| `dimension/pixelToNumber` | Strips "px" for React Native | `"16px"` → `16` |
| `shadow/reactNative` | Converts DTCG shadow → RN format | `{offsetX, blur}` → `{shadowOffset, shadowRadius, elevation}` |
| `duration/milliseconds` | Strips "ms" for RN animations | `"200ms"` → `200` |
| `javascript/esm-tokens` | ES module export format | `export const tokens = {...}` |

**Build stages:**
1. **Base tokens** → CSS variables (`:root`), Web JS (PascalCase), Native JS (camelCase, unitless)
2. **Theme builds** (light, dark) → Scoped CSS (`[data-theme="dark"]`), Native JS (resolved values)
3. **Type declarations** → `.d.ts` files for all JS outputs

#### Output Map

| Entry Point | File | Format | Use Case |
|-------------|------|--------|----------|
| `./css` | `dist/web/variables.css` | CSS custom properties | Web apps: `:root` variables |
| `./web` | `dist/web/tokens.js` | ES module | Web JS access to token values |
| `./themes/light` | `dist/themes/light.css` | Scoped CSS | `[data-theme="light"]` overrides |
| `./themes/dark` | `dist/themes/dark.css` | Scoped CSS | `[data-theme="dark"]` overrides |
| `./native` | `dist/native/tokens.js` | ES module | RN base tokens (unitless) |
| `./native/light` | `dist/native/light.js` | ES module | RN light theme tokens |
| `./native/dark` | `dist/native/dark.js` | ES module | RN dark theme tokens |

#### Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `build` | `tsx build.ts` | Compile all tokens to platform outputs |
| `clean` | `rm -rf dist` | Remove build artifacts |
| `check-types` | `tsc --noEmit` | Validate TypeScript |

---

### 3.2 @entropix/core — Headless Component Logic

**Purpose:** Platform-agnostic React hooks providing component behavior, accessibility contracts, and keyboard navigation — with zero DOM or styling concerns.

#### Type System

The core defines a **platform-neutral accessibility contract** that platform packages translate:

```typescript
// Platform-neutral (core exports this)
interface AccessibilityProps {
  role?: AriaRole;           // "button" | "dialog" | "tab" | "menu" | ...
  label?: string;            // Screen reader label
  disabled?: boolean;
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean | "mixed";
  modal?: boolean;
  hasPopup?: AriaHasPopup;
  controls?: string;         // ID of controlled element
  labelledBy?: string;       // ID of labelling element
  describedBy?: string;      // ID of describing element
  tabIndex?: number;
  // ... more
}

// What every prop getter returns
interface PropGetterReturn {
  accessibility: AccessibilityProps;
  keyboardConfig?: KeyboardHandlerConfig;
  onAction?: () => void;
}
```

Platform packages then translate these:
- **Web:** `accessibility.disabled` → `aria-disabled`, `accessibility.role` → `role`
- **RN:** `accessibility.disabled` → `accessibilityState.disabled`, `accessibility.role` → `accessibilityRole`

#### Keyboard Intent Abstraction

Instead of binding to specific keys, core defines semantic **intents**:

```typescript
type KeyIntent =
  | "activate"     // Button press, link follow
  | "toggle"       // Checkbox/switch toggle
  | "dismiss"      // Close dialog, cancel
  | "moveUp" | "moveDown" | "moveLeft" | "moveRight"
  | "moveStart" | "moveEnd"
  | "focusNext" | "focusPrevious";
```

Each hook declares which keys map to which intents:
- Button: `Space/Enter → activate`
- Dialog content: `Escape → dismiss`
- Tabs (horizontal): `ArrowLeft/Right → moveLeft/moveRight`, `Home/End → moveStart/moveEnd`
- Tabs (vertical): `ArrowUp/Down → moveUp/moveDown`

Platform packages implement the actual handler:
- Web: `useKeyboardHandler` maps intents to `onKeyDown` callbacks
- RN: Keyboard handling not needed (touch-first, screen readers handle navigation)

#### Hooks API

| Hook | Purpose | Key Options | Key Returns |
|------|---------|-------------|-------------|
| `useButton` | Interactive button | `disabled`, `loading`, `onPress`, `elementType` | `getButtonProps()`, `isDisabled`, `isLoading` |
| `useToggle` | Boolean toggle | `checked`, `defaultChecked`, `onChange`, `disabled`, `role` | `getToggleProps()`, `isChecked`, `toggle()` |
| `useDialog` | Modal dialog | `isOpen`, `defaultOpen`, `onOpenChange`, `closeOnEscape`, `closeOnOverlayPress`, `modal` | `getTriggerProps()`, `getContentProps()`, `getCloseProps()`, `getOverlayProps()`, `open()`, `close()`, `focusManagement`, `ids` |
| `useTabs` | Tab navigation | `selectedKey`, `defaultSelectedKey`, `onSelectedKeyChange`, `orientation`, `activationMode`, `disabledKeys` | `getTabListProps()`, `getTabProps(key)`, `getTabPanelProps(key)`, `select(key)` |
| `useAccordion` | Collapsible sections | `expandedKeys`, `defaultExpandedKeys`, `onExpandedKeysChange`, `allowMultiple`, `collapsible`, `disabled` | `getItemTriggerProps(key)`, `getItemPanelProps(key)`, `isExpanded(key)`, `toggle(key)` |
| `useMenu` | Dropdown menu | `isOpen`, `defaultOpen`, `onOpenChange`, `closeOnSelect`, `loop` | `getTriggerProps()`, `getMenuProps()`, `getItemProps(index, opts)`, `activeIndex`, `focusIntent` |

**Foundation hooks:**
- `useControllableState<T>` — Enables both controlled (`value` prop) and uncontrolled (`defaultValue`) patterns in one API
- `useId` / `useIds` — Generates stable ARIA-linked IDs (e.g., `dialog-:r1:-title`)

#### Utilities

| Utility | Purpose |
|---------|---------|
| `mergeProps()` | Composes prop objects: functions chain, accessibility merges, values override |
| `callAllHandlers()` | Creates a function that calls multiple handlers in sequence |
| `createKeyboardHandler()` | Creates keyboard config from intent map (pure, no DOM) |

#### Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `build` | `tsup` | Bundle to ESM + CJS with declarations |
| `dev` | `tsup --watch` | Watch mode for development |
| `test` | `vitest run` | Run 105 tests across 11 test files |
| `test:watch` | `vitest` | Interactive test watch mode |
| `lint` | `eslint . --max-warnings 0` | Zero-warning linting |
| `check-types` | `tsc --noEmit` | Type validation |

#### Test Coverage

| Module | Tests | Focus |
|--------|-------|-------|
| useButton | 9 | Role/tabIndex for different element types, disabled/loading states |
| useToggle | 12 | Controlled/uncontrolled, checkbox vs switch roles |
| useDialog | 16 | Open/close lifecycle, focus management intents, ID linking |
| useTabs | 12 | Selection, orientation-based keyboard maps, disabled keys |
| useAccordion | 14 | Single/multi expand, collapsible constraint |
| useMenu | 16 | Trigger/item/menu props, activeIndex, closeOnSelect |
| useControllableState | 6 | Both patterns, updater functions |
| useId | 6 | Stability, prefix handling |
| mergeProps | 6 | Function composition, undefined handling |
| callAllHandlers | 4 | Handler chaining |
| createKeyboardHandler | 4 | Intent resolution |

**Total: 105 tests**

---

### 3.3 @entropix/react — Web Components

**Purpose:** Styled React DOM components that consume `@entropix/core` hooks and apply CSS via side-effect imports. Consumers just `import { Button } from '@entropix/react'` and get a fully styled, accessible component.

#### How Components Work

Every component follows this pattern:

```
Component.tsx
├── import '../styles/component.css'        ← CSS side-effect (bundler includes it)
├── const hook = useXxx(options)            ← Core hook for behavior
├── const ariaProps = mapAccessibilityToAria(hook.accessibility)
├── const handleKeyDown = useKeyboardHandler(hook.keyboardConfig, actionMap)
├── className = cn("entropix-component", `--${variant}`, `--${size}`, className)
└── <element {...ariaProps} onKeyDown={handleKeyDown} className={className} data-state={...}>
```

#### CSS Architecture

CSS files use **CSS custom properties** (from `@entropix/tokens`) and **BEM-like class naming**:

```css
/* Base */
.entropix-button {
  display: inline-flex;
  padding: var(--entropix-button-padding-y) var(--entropix-button-padding-x);
  border-radius: var(--entropix-button-border-radius);
  transition: background 150ms, color 150ms;
}

/* Variant modifier */
.entropix-button--primary {
  background: var(--entropix-button-primary-bg);
  color: var(--entropix-button-primary-text);
}

/* Size modifier */
.entropix-button--sm {
  padding: var(--entropix-spacing-1) var(--entropix-spacing-3);
  font-size: var(--entropix-font-size-xs);
}

/* State via data attribute */
.entropix-button:disabled,
.entropix-button[data-state="disabled"] {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Why CSS side-effect imports?**
- Consumer's bundler (Next.js, Vite, webpack) follows the import graph
- When it processes `import { Button } from '@entropix/react'`, it finds `import '../styles/button.css'`
- CSS is automatically bundled — consumer never writes a CSS import
- `"sideEffects": ["**/*.css"]` in package.json prevents tree-shaking of CSS

**CSS files (7):**
- `button.css` — Variants (primary, secondary, outline, ghost, danger), sizes (sm, md, lg), disabled/loading states, focus ring
- `toggle.css` — Bordered pill, checked state fills blue, hover transitions
- `switch.css` — Track + `::after` pseudo-element thumb, translateX animation
- `tabs.css` — Tablist flex layout, active underline, vertical orientation support
- `accordion.css` — Bordered container, trigger full-width, hover bg, panel padding
- `dialog.css` — Fixed overlay, centered content card, title/description typography, close button positioning
- `menu.css` — Dropdown card with shadow, item hover/active/disabled states

#### Web-Specific Utilities

| Utility | Purpose |
|---------|---------|
| `mapAccessibilityToAria()` | Converts core `AccessibilityProps` to DOM `aria-*` attributes |
| `useKeyboardHandler()` | Converts core `KeyboardHandlerConfig` + action map to `onKeyDown` handler |
| `useFocusTrap(ref, isActive)` | Traps Tab/Shift+Tab within container, auto-focuses first element |
| `useFocusRestore(isActive)` | Saves active element on mount, restores on unmount |
| `cn(...classes)` | Simple class name joiner (filters falsy values) |

#### Component Inventory

**Simple (3):** Button, Toggle, Switch
**Layout (4):** Stack, Inline, Container, Divider
**Compound (4 families, 18 sub-components):**
- Dialog: Dialog, DialogTrigger, DialogContent, DialogOverlay, DialogTitle, DialogDescription, DialogClose
- Tabs: Tabs, TabList, Tab, TabPanel
- Accordion: Accordion, AccordionItem, AccordionTrigger, AccordionPanel
- Menu: Menu, MenuTrigger, MenuContent, MenuItem

All components support `ref` forwarding, `className` override, and `style` prop.

#### Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `build` | `tsup` | Bundle JS + copy CSS to dist/styles/ |
| `dev` | `tsup --watch` | Watch mode |
| `test` | `vitest run` | Run component tests |
| `lint` | `eslint . --max-warnings 0` | Linting |
| `check-types` | `tsc --noEmit` | Type validation |

---

### 3.4 @entropix/react-native — Mobile Components

**Purpose:** Self-styled React Native components that consume `@entropix/core` hooks and apply styles internally via a theme context provider. Consumers wrap their app in `<EntropixProvider>` and import styled components directly.

#### Theme Provider Pattern

Unlike web (CSS variables + side-effect imports), React Native requires a JavaScript-based theming system:

```tsx
// Consumer usage — clean, no token imports needed
import { EntropixProvider, Button, Switch } from '@entropix/react-native';

export default function App() {
  return (
    <EntropixProvider mode="dark">
      <Button variant="primary" onPress={handlePress}>Save</Button>
      <Switch checked={isOn} onChange={setIsOn} label="Notifications" />
    </EntropixProvider>
  );
}
```

**How it works internally:**

```
EntropixProvider (mode="light"|"dark")
  │
  ├── Imports: @entropix/tokens/native (base), /native/light, /native/dark
  ├── Creates: ThemeContextValue = { mode, tokens, baseTokens }
  ├── Memoizes value (only recalculates when mode changes)
  └── Provides via React Context
      │
      └── Every component calls useTheme()
          ├── Gets { tokens, baseTokens } for current theme
          ├── Uses tokens for semantic colors (t.entropixColorBgPrimary)
          ├── Uses baseTokens for fixed values (bt.entropixSpacing4, bt.entropixRadiusLg)
          └── Applies via StyleSheet arrays: style={[defaultStyles, userStyle]}
```

**Why separate base tokens and theme tokens?**
- **baseTokens** contain values that don't change between themes (spacing, radii, font sizes, shadows)
- **tokens** (light/dark) contain semantic color values that swap per theme
- Components use `bt.entropixSpacing4` for spacing (same in both themes) and `t.entropixColorBgPrimary` for colors (different per theme)

#### Accessibility Adapter

`mapAccessibilityToRN()` translates core accessibility props to React Native:

| Core Property | RN Property | Notes |
|---------------|-------------|-------|
| `role: "button"` | `accessibilityRole: "button"` | Direct mapping for most roles |
| `role: "slider"` | `accessibilityRole: "adjustable"` | RN uses different name |
| `role: "dialog"` | `accessibilityRole: "none"` | Modal component handles semantics |
| `disabled: true` | `accessibilityState: { disabled: true }` | Aggregated state object |
| `expanded: true` | `accessibilityState: { expanded: true }` | |
| `label: "Close"` | `accessibilityLabel: "Close"` | |
| `describedBy: "id"` | `accessibilityHint: "id"` | Closest RN equivalent |
| `hidden: true` | `accessibilityElementsHidden: true` + `importantForAccessibility: "no-hide-descendants"` | Dual platform (iOS + Android) |

#### Component Self-Styling Examples

**Button** — Variant/size system with token-driven styles:
```tsx
// Internally:
const variantStyles = getVariantStyle(variant, t);
// "primary" → { backgroundColor: t.entropixButtonPrimaryBg, borderWidth: 1, borderColor: t.entropixButtonPrimaryBorder }
// "danger"  → { backgroundColor: t.entropixButtonDangerBg, ... }

const sizeStyles = getSizeStyle(size, bt);
// "sm" → { paddingVertical: bt.entropixSpacing1, paddingHorizontal: bt.entropixSpacing3, borderRadius: bt.entropixRadiusSm }
// "lg" → { paddingVertical: bt.entropixSpacing3, paddingHorizontal: bt.entropixSpacing6, borderRadius: bt.entropixRadiusLg }
```

**Switch** — Animated thumb with token colors:
```tsx
// Track: 44×24px, gray when off, blue when on
// Thumb: 20px white circle with Animated.timing slide (150ms)
backgroundColor: checked ? t.entropixColorActionPrimaryDefault : t.entropixColorGray300
```

**DialogContent** — Modal card with overlay:
```tsx
// Outer View: flex center + semi-transparent black overlay
// Inner View: white card, rounded corners, padding, shadow
<Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
  <View style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
    <View style={{ backgroundColor: t.entropixColorBgPrimary, borderRadius: bt.entropixRadiusLg, padding: bt.entropixSpacing6, ... }}>
      {children}
    </View>
  </View>
</Modal>
```

#### Component Inventory

Mirrors `@entropix/react` exactly:

**Simple (3):** Button (variant/size), Toggle (pill checkbox), Switch (animated track+thumb)
**Layout (4):** Stack (vertical flex), Inline (horizontal flex), Container (page wrapper), Divider (separator)
**Compound (4 families):** Dialog (7 parts), Tabs (4 parts), Accordion (4 parts), Menu (4 parts)
**Theme:** EntropixProvider, useTheme

#### Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `build` | `tsup` | Bundle to ESM + CJS with declarations |
| `dev` | `tsup --watch` | Watch mode |
| `test` | `jest` | Run 50 tests across 7 test files |
| `lint` | `eslint . --max-warnings 0` | Linting |
| `check-types` | `tsc --noEmit` | Type validation |

---

### 3.5 Shared Config Packages

#### @entropix/typescript-config

| Config File | Used By | Key Settings |
|-------------|---------|--------------|
| `base.json` | All packages | ES2022, strict, `moduleResolution: "NodeNext"`, declarations, isolated modules |
| `react-library.json` | core, react, react-native | Extends base + `jsx: "react-jsx"` |
| `nextjs.json` | apps/web, apps/docs | Extends base + Next.js plugin, `moduleResolution: "Bundler"`, `noEmit` |

#### @entropix/eslint-config

| Config | Used By | Rules |
|--------|---------|-------|
| `base.js` | All packages | ESLint recommended, TypeScript ESLint, Turbo plugin (env vars), Prettier |
| `next.js` | apps/web, apps/docs | Base + React recommended + Next.js rules + React Hooks |
| `react-internal.js` | packages/react, react-native | Base + React Hooks |

---

## 4. Design Decisions & Rationale

### 4.1 Headless-First Architecture

**Decision:** Separate component logic (core) from platform rendering (react, react-native).

**Why:**
- Write behavior once, render anywhere — no duplicated state management or accessibility logic
- Each platform gets optimal rendering (DOM elements + CSS vs RN Pressable + StyleSheet)
- Core is testable with pure unit tests (renderHook), no DOM required
- Adding a new platform (e.g., Electron, Solid.js) only requires a new adapter layer

### 4.2 Prop Getter Pattern (not render props, not HOCs)

**Decision:** Hooks return `getXxxProps()` functions that produce `PropGetterReturn` objects.

**Why:**
- Composable: consumers can merge with their own props via `mergeProps()`
- Type-safe: each prop getter has a specific return type
- Platform-neutral: returns `AccessibilityProps` (abstract), not `aria-*` (DOM-specific)
- Flexible: supports overrides (`getButtonProps({ onAction: customFn })`)

### 4.3 Keyboard Intent Abstraction

**Decision:** Core defines semantic intents (`"activate"`, `"moveDown"`, `"dismiss"`) instead of key codes.

**Why:**
- Web and mobile handle keyboard differently (physical keyboard vs screen reader)
- Future platforms may have different input methods (game controllers, voice)
- Makes testing simpler — test the intent, not the key
- Orientation-aware: tabs use ArrowLeft/Right (horizontal) or ArrowUp/Down (vertical) for the same intent

### 4.4 CSS Side-Effect Imports (Web)

**Decision:** Each web component file imports its CSS: `import '../styles/button.css'`

**Why:**
- Consumer never writes a CSS import — styles auto-bundle when component is imported
- Tree-shakeable: only imported components' CSS is included
- No CSS-in-JS runtime cost
- Predictable: standard CSS with BEM naming, easy to inspect/override in DevTools
- `"sideEffects": ["**/*.css"]` in package.json tells bundlers not to tree-shake CSS

### 4.5 Theme Provider Pattern (React Native)

**Decision:** React Context provider (`EntropixProvider`) with `useTheme()` hook instead of CSS variables.

**Why:**
- React Native has no CSS cascade or custom properties
- Context provider is the standard RN pattern for dependency injection
- Memoized context value prevents unnecessary re-renders
- Consumer wraps once at app root, all components auto-theme
- Supports runtime theme switching (light ↔ dark) via `mode` prop

### 4.6 W3C DTCG Token Format

**Decision:** Use the W3C Design Token Community Group specification for all token definitions.

**Why:**
- Industry standard — interoperable with other design tools (Figma, Style Dictionary)
- Typed values (`$type: "color"`, `$type: "dimension"`) enable platform-specific transforms
- Reference syntax (`{color.gray.50}`) enables semantic token aliasing
- Supports composite tokens (typography, shadow) natively

### 4.7 Controlled + Uncontrolled State

**Decision:** Every stateful hook supports both patterns via `useControllableState`.

**Why:**
- Some consumers want full control (`checked={state}` + `onChange={setState}`)
- Others want fire-and-forget (`defaultChecked={true}`)
- Same component, same API — consumer chooses the pattern
- `onChange` callback fires in both modes (notification in controlled, state update in uncontrolled)

### 4.8 Compound Components (not monolithic)

**Decision:** Complex components (Dialog, Tabs, Accordion, Menu) are composed from multiple sub-components sharing state via React Context.

**Why:**
- Flexible layout: consumer controls DOM structure
- Composable: can add custom elements between sub-components
- Accessible: each sub-component declares its own ARIA attributes
- Type-safe: TypeScript enforces required children/props

---

## 5. Cross-Platform Strategy

### What's Shared (via @entropix/core)

| Concern | How It's Shared |
|---------|----------------|
| **State management** | All hooks (useButton, useToggle, etc.) work identically on both platforms |
| **Controlled/uncontrolled** | `useControllableState` is platform-neutral |
| **Accessibility contract** | `AccessibilityProps` type defines what accessibility info is needed |
| **Keyboard intents** | `KeyIntent` type defines semantic actions |
| **ID generation** | `useId/useIds` generates stable IDs for ARIA linking |

### What's Platform-Specific

| Concern | Web (@entropix/react) | Mobile (@entropix/react-native) |
|---------|----------------------|-------------------------------|
| **Rendering** | `<button>`, `<div>`, `<dialog>` | `<Pressable>`, `<View>`, `<Modal>` |
| **Styling** | CSS files with `var(--entropix-*)` | `useTheme()` + inline StyleSheet |
| **Accessibility mapping** | `mapAccessibilityToAria()` → `aria-*` | `mapAccessibilityToRN()` → `accessibilityRole`, `accessibilityState` |
| **Keyboard handling** | `useKeyboardHandler()` → `onKeyDown` | Not needed (touch-first) |
| **Focus management** | `useFocusTrap()`, `useFocusRestore()` | RN Modal handles focus natively |
| **Theming** | CSS cascade: `[data-theme="dark"]` swaps variables | Context: `EntropixProvider mode="dark"` swaps token object |
| **Portals** | `createPortal(content, document.body)` | `<Modal>` component (native modal) |

### API Parity

Both platform packages export the same component names and props:

```tsx
// Web
import { Button, Dialog, DialogTrigger, DialogContent } from '@entropix/react';

// Mobile
import { Button, Dialog, DialogTrigger, DialogContent } from '@entropix/react-native';
```

The API surface is intentionally identical so consumers can share knowledge and patterns across platforms.

---

## 6. Theming Architecture

### Web (CSS Variables)

```
Consumer imports:
  @entropix/tokens/css          → :root { --entropix-color-bg-primary: #ffffff; ... }
  @entropix/tokens/themes/light → [data-theme="light"] { --entropix-color-bg-primary: #ffffff; }
  @entropix/tokens/themes/dark  → [data-theme="dark"]  { --entropix-color-bg-primary: #030712; }

Component CSS uses:
  background: var(--entropix-color-bg-primary);    ← Resolves based on nearest [data-theme] ancestor

Theme switch:
  document.documentElement.setAttribute('data-theme', 'dark');  ← All components update instantly
```

### React Native (Context Provider)

```
EntropixProvider mode="dark"
  │
  ├── Resolves: tokens = darkTokens (entropixColorBgPrimary: "#030712")
  ├── Provides via context
  │
  └── Button calls useTheme()
      └── backgroundColor: t.entropixColorBgPrimary  →  "#030712"
```

### Adding a New Theme

1. Create `src/themes/high-contrast.json` with semantic overrides
2. Build script auto-generates `dist/themes/high-contrast.css` and `dist/native/high-contrast.js`
3. Add exports to `package.json`
4. Web: import the CSS, add `data-theme="high-contrast"` to DOM
5. RN: update `EntropixProvider` to support the new mode

---

## 7. Accessibility Architecture

### Three-Layer Approach

```
Layer 1: Core Hooks
  → Declare accessibility requirements via AccessibilityProps
  → role, expanded, selected, checked, labelledBy, controls, tabIndex, etc.
  → Platform-neutral: no aria-* or accessibilityRole references

Layer 2: Platform Adapters
  → Web: mapAccessibilityToAria()  →  { "aria-expanded": true, role: "dialog", ... }
  → RN:  mapAccessibilityToRN()   →  { accessibilityRole: "none", accessibilityState: { expanded: true }, ... }

Layer 3: Components
  → Spread adapted props onto DOM/RN elements
  → Add keyboard handlers (web) or touch handlers (RN)
  → Manage focus (web: useFocusTrap, RN: Modal native focus)
```

### What's Covered

| Pattern | ARIA Support | Keyboard | Focus Management |
|---------|-------------|----------|------------------|
| Button | role, disabled, busy | Enter/Space → activate | tabIndex management |
| Toggle | role (checkbox), checked | Enter/Space → toggle | tabIndex management |
| Switch | role (switch), checked | Enter/Space → toggle | tabIndex management |
| Dialog | role (dialog), modal, labelledby, describedby | Escape → dismiss | Focus trap + restore |
| Tabs | role (tablist/tab/tabpanel), selected, controls | Arrow keys, Home/End | roving tabIndex |
| Accordion | role (button/region), expanded, controls, labelledby | Arrow keys, Home/End, Enter/Space | — |
| Menu | role (menu/menuitem), expanded, hasPopup, controls | Arrow keys, Enter/Space, Escape | Auto-focus first item |

---

## 8. Responsive Architecture

### Breakpoint Tokens

Defined in `packages/tokens/src/primitives/breakpoints.json`:

| Token | Value | Description |
|-------|-------|-------------|
| `breakpoint.sm` | 640px | Landscape phones |
| `breakpoint.md` | 768px | Tablets |
| `breakpoint.lg` | 1024px | Laptops |
| `breakpoint.xl` | 1280px | Desktops |
| `breakpoint.2xl` | 1536px | Wide screens |

### Responsive Page Margins

Container padding scales with viewport:

| Breakpoint | Token | Value | Usage |
|-----------|-------|-------|-------|
| Mobile (<768px) | `space.layout.page-margin` | 24px | Tighter margins on small screens |
| Tablet (≥768px) | `space.layout.page-margin-md` | 32px | More breathing room |
| Desktop (≥1024px) | `space.layout.page-margin-lg` | 40px | Generous margins on wide screens |

### Web: CSS `@media` Queries

Every component CSS file includes responsive rules:

| Component | Mobile Behavior (<768px) |
|-----------|-------------------------|
| **Button** | `min-height: 44px` for touch-friendly targets; SM buttons get larger padding |
| **Dialog** | Bottom-sheet: anchored to bottom, full-width, rounded top corners only |
| **Tabs** | Horizontal scroll with hidden scrollbar; tabs don't wrap, they scroll |
| **Accordion** | `min-height: 48px` triggers; larger font size for readability |
| **Menu** | `min-height: 44px` items; larger padding and font size |
| **Container** | Adaptive horizontal padding via responsive margin tokens |

### Web: Responsive Hooks

```tsx
import { useBreakpoint, useMediaQuery, useBreakpointValue } from "@entropix/react";

// Current breakpoint name
const bp = useBreakpoint(); // "base" | "sm" | "md" | "lg" | "xl" | "2xl"

// Subscribe to a media query
const isMobile = useMediaQuery("(max-width: 767px)");
const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

// Check if viewport is at or above a breakpoint
const isDesktop = useBreakpointValue("lg"); // true when ≥1024px
```

### React Native: Responsive Hooks

```tsx
import { useBreakpoint, useBreakpointValue, useScreenDimensions } from "@entropix/react-native";

// Current breakpoint (uses Dimensions API + orientation listener)
const bp = useBreakpoint(); // "base" | "sm" | "md" | "lg" | "xl" | "2xl"

// Check if screen is tablet or larger
const isTablet = useBreakpointValue("md"); // true when ≥768px

// Raw screen dimensions (updates on rotation)
const { width, height } = useScreenDimensions();
```

The RN `Container` component automatically uses `useBreakpoint()` internally to scale its horizontal padding at tablet and desktop breakpoints — no consumer code changes needed.

---

## 9. Build Pipeline & Scripts

### Root Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `turbo run dev` | Start all dev servers in parallel |
| `build` | `turbo run build` | Build all packages (cached) |
| `lint` | `turbo run lint` | Lint all packages |
| `check-types` | `turbo run check-types` | Type check all packages |
| `test` | `turbo run test` | Run all test suites |
| `tokens:build` | `pnpm --filter @entropix/tokens build` | Rebuild tokens only |
| `storybook` | `turbo run dev --filter=storybook` | Start Storybook |
| `format` | `prettier --write "**/*.{ts,tsx,md}"` | Format code |

### Turborepo Task Dependencies

```
build:
  tokens (no deps) ──┐
  core (no deps) ────┤
                     ├── react (depends on core) ──────┐
                     └── react-native (depends on      ├── apps/* (depend on packages)
                          core + tokens) ──────────────┘

test:
  Depends on ^build (packages must build before testing)
```

### Build Flow (turbo run build)

1. `@entropix/tokens` → `tsx build.ts` → CSS + JS + .d.ts
2. `@entropix/core` → `tsup` → ESM + CJS + .d.ts
3. `@entropix/react` → `tsup` → ESM + CJS + .d.ts + CSS copy
4. `@entropix/react-native` → `tsup` → ESM + CJS + .d.ts
5. Apps build with their framework tooling (Next.js, Expo)

---

## 10. Apps & Validation

### apps/web — Next.js Playground (port 3000)

Interactive playground showcasing all web components with theme toggle. Imports `@entropix/react` components and `@entropix/tokens/css` + theme CSS. Demonstrates that consumers get styled components with a single import.

### apps/mobile — Expo App (port 8082 via Expo web)

Mobile validation app using `@entropix/react-native`. Wraps in `<EntropixProvider>` and imports all components directly — no manual token/style imports. Validates the self-styling architecture works as intended.

### apps/storybook — Storybook (port 6006)

Component documentation with interactive controls. 7 story files covering all components with variant/size/state permutations. Custom theme decorator enables light/dark toggle via Storybook toolbar.

### apps/docs — Documentation Site (port 3001)

Template documentation site. Currently contains generic turborepo content.

---

## 11. Scalability Assessment

### What's Production-Ready

| Area | Status | Details |
|------|--------|---------|
| **Token architecture** | Ready | Layered primitives → semantic → themes is industry standard, supports unlimited themes |
| **Core hooks** | Ready | Comprehensive accessibility, keyboard, state management. 105 tests. |
| **Component API** | Ready | Controlled/uncontrolled, compound composition, prop overrides — standard patterns |
| **Web styling** | Ready | CSS variables + BEM naming is debuggable, overridable, performant |
| **RN self-styling** | Ready | Theme provider pattern with memoized context |
| **Build pipeline** | Ready | Turborepo caching, tsup bundling, Style Dictionary compilation — all production tooling |
| **Type safety** | Ready | Strict TypeScript, exported types for all component props |
| **Test coverage** | Good | 155 total tests (105 core + 50 RN). Web component tests need expansion. |

### What Needs Work Before Production

| Issue | Severity | Details |
|-------|----------|---------|
| **No animation system** | Medium | Accordion expand/collapse and dialog open/close have no transitions (web). RN Switch has animation, but it's isolated. Need a consistent animation strategy. |
| **No SSR testing** | Medium | Web components use `createPortal` and `document.body` in Dialog — needs SSR guards. Current `mounted` state check may be insufficient for streaming SSR. |
| **Missing web focus management in some components** | Medium | Tabs and Accordion declare keyboard intents in core but the web adapter doesn't implement arrow key focus movement (roving tabindex). Menu has `activeIndex` but web doesn't implement the actual DOM focus calls. |
| **No positioning engine for Menu/popover** | High | Menu content renders inline (no floating/popover positioning). Production menus need a positioning library (Floating UI) to anchor relative to trigger and handle viewport edges. |
| **Nested Pressable issue (web playground)** | Low | Web playground nests `<Button>` inside `<DialogTrigger>`, causing `<button>` inside `<button>` hydration warnings. This is a playground code issue, not a library issue — but the library could support an `asChild` pattern to avoid it. |
| **No `asChild` pattern** | Medium | Libraries like Radix use `asChild` to render trigger as the child element instead of wrapping it. This prevents nesting issues (button-in-button). Worth adding for compound triggers. |
| **Limited component set** | Medium | Missing common components: Input, Select, Tooltip, Popover, Toast, Checkbox (standalone), RadioGroup, Slider, Progress. Layout primitives (Stack, Inline, Container, Divider) are available. |
| **~~No responsive tokens~~** | ✅ Done | Breakpoint tokens (sm/md/lg/xl/2xl), responsive page margins, `@media` queries in all component CSS, `useBreakpoint`/`useMediaQuery` hooks for web and RN. Dialog renders as bottom-sheet on mobile, centered modal on desktop. |
| **Token types are loose** | Low | `.d.ts` files declare `Record<string, string \| number \| object>`. Generating specific token name types would enable autocomplete and catch typos. |
| **No visual regression testing** | Low | No screenshot-based testing for components. Storybook's visual testing addon or Playwright could be added. |

### Recommended Next Steps (Priority Order)

1. **Add floating positioning** for Menu (and future Popover/Tooltip) — use Floating UI
2. **Implement roving tabindex** in web Tabs and Accordion keyboard navigation
3. **Add `asChild` pattern** to compound triggers (DialogTrigger, MenuTrigger)
4. **Expand component library** — Input, Select, Tooltip, Toast, RadioGroup
5. **Add animation system** — CSS transitions for web, Animated/Reanimated for RN
6. **Generate typed token names** — emit `type TokenName = "entropixColorBgPrimary" | ...`
7. **Add web component tests** — match RN test coverage
8. **SSR validation** — test with Next.js streaming and React Server Components

---

## 12. Known Issues & Gaps

### Architecture Issues

1. **Menu positioning is missing.** `MenuContent` renders inline in the DOM flow. In production, menus need absolute/fixed positioning relative to their trigger with collision detection. This requires integrating a positioning library like Floating UI.

2. **Web keyboard navigation is incomplete.** Core hooks declare keyboard intents for Tabs (arrow key focus movement) and Menu (arrow key item navigation), but the web adapter only handles basic actions. The `useKeyboardHandler` utility maps intents to callbacks, but the actual DOM focus movement (calling `.focus()` on the next tab/item) is not implemented.

3. **No `asChild` composition pattern.** Compound triggers (DialogTrigger, MenuTrigger) render their own element and wrap children. This causes nested interactive element issues when children are also interactive (e.g., `<DialogTrigger><Button>Open</Button></DialogTrigger>` produces `<button><button>`). The `asChild` pattern (cloning child with merged props) solves this.

4. **Dialog overlay is duplicated in RN.** The self-styled `DialogContent` now includes a semi-transparent backdrop as part of its Modal wrapper. The separate `DialogOverlay` component still exists but is redundant in most cases. This could cause confusion.

### Token Issues

5. **Loose TypeScript types.** Token exports are typed as `Record<string, string | number | object>`. Accessing `t.entropixColorBgPrimary` has no autocomplete or typo protection. Generating a specific type from the token names would fix this.

6. **`.d.ts` files in dist/ are fragile.** They're generated by the build script but live in `dist/` which is gitignored. If someone clones the repo and runs `pnpm --filter @entropix/react-native build` before `pnpm --filter @entropix/tokens build`, the `.d.ts` files won't exist and the build will fail. Turborepo's `^build` dependency mostly prevents this, but it's a footgun.

7. **Web JS token names use PascalCase while CSS uses kebab-case and RN uses camelCase.** This is correct per platform convention, but the inconsistency means switching between platforms requires mental translation. The naming is consistent within each platform.

### Component Issues

8. **No animation on expand/collapse (web).** Accordion panels and dialog overlays appear/disappear instantly. CSS transitions on `max-height` or using the `<details>` element with animation would improve UX.

9. **Switch animation only exists in RN.** The web Switch uses CSS `transform: translateX()` with transition, which works. The RN Switch uses `Animated.timing`. These are separate implementations — animation logic isn't shared.

10. **`wrapStringChildren` is a band-aid.** React Native requires text in `<Text>` components. The utility auto-wraps strings, but if a consumer passes a `<View>` where `<Text>` is expected, they'll get a runtime error. TypeScript doesn't prevent this.

---

*Document generated from codebase analysis on 2026-03-20.*
