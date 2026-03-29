# Tokens Package Implementation Guide

`@entropix/tokens` compiles design tokens from W3C DTCG JSON into platform-specific outputs: CSS variables for web, JS objects for web/native, and themed variants for each brand. This guide teaches you how the build pipeline works, how to add tokens, and how the brand/theme system fits together.

---

## 1. Mental Model -- How Tokens Work

Tokens are the visual DNA of the design system. They flow through a hierarchy:

```
Primitives  -->  Semantic  -->  Component  -->  Theme  -->  Brand
(raw values)    (meaningful     (component-     (dark/light   (custom
                 aliases)        specific)       overrides)    overrides)
```

**Primitives** are raw values with no meaning attached:
```
spacing.4 = 16px
color.blue.500 = #3b82f6
font-size.sm = 14px
```

**Semantic tokens** give meaning to primitives:
```
color.action.primary.default = {color.blue.500}
space.component.padding-lg = {spacing.4}
```

**Component tokens** reference semantic tokens for specific component use:
```
button.primary.bg = {color.action.primary.default}
button.padding-x = {space.component.padding-lg}
```

**Themes** override semantic values:
```
[dark] color.action.primary.default = {color.blue.400}  (lighter for dark backgrounds)
```

**Brands** override any level:
```
[ocean] color.blue.500 = #0d9488   (teal instead of blue)
```

Think of it like CSS variables with inheritance. A component uses `var(--entropix-button-primary-bg)`, which resolves through the chain to the right color for the current brand and theme.

---

## 2. Source File Organization

```
packages/tokens/src/
  primitives/           -- Raw values
    colors.json         -- Full color palette (blue.50..blue.900, etc.)
    spacing.json        -- 4px-based scale (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24)
    typography.json     -- Font sizes, weights, line heights, font families
    radii.json          -- Border radius values
    shadows.json        -- Box shadow definitions
    breakpoints.json    -- Screen width breakpoints
    motion.json         -- Duration and easing values

  semantic/             -- Meaningful aliases
    colors.json         -- action, surface, text, border, feedback color groups
    spacing.json        -- component padding, gap, section spacing
    typography.json     -- heading, body, label text styles

  components/           -- Component-specific tokens
    button.json         -- Button padding, colors, typography per variant

  themes/               -- Theme overrides
    light.json          -- Light theme (usually the default, minimal overrides)
    dark.json           -- Dark theme (overrides semantic colors for dark backgrounds)

  brands/               -- Brand overrides (auto-discovered)
    ocean/
      primitives/       -- Override raw color palette
      semantic/         -- Override meaningful aliases
      themes/
        light.json      -- Brand-specific light theme adjustments
        dark.json       -- Brand-specific dark theme adjustments
    sunset/
      ...same structure...
```

---

## 3. How the Build Pipeline Works -- Step by Step

When you run `pnpm build` in the tokens package, it executes `tsx build.ts`. Here is what happens:

### Step 1: Custom transforms are registered

Three transforms handle platform-specific value conversions:

```
dimension/pixelToNumber    "16px" -> 16       (for React Native, which uses numbers)
shadow/reactNative         shadow object -> { shadowOffset, shadowRadius, ... }
duration/milliseconds      "200ms" -> 200     (for React Native Animated)
```

A custom format `javascript/esm-tokens` is also registered to output ES module exports.

### Step 2: Brand discovery

The build scans `src/brands/` for subdirectories. Each subdirectory name becomes a brand. If `src/brands/` contains `ocean/` and `sunset/`, the build produces outputs for three brands: `default`, `ocean`, `sunset`.

### Step 3: For each brand, three builds run

**Base build** -- Compiles primitives + semantic + component tokens:
- CSS: `dist/web/variables.css` (default) or `dist/brands/{name}/web/variables.css`
- JS: `dist/web/tokens.js` and `dist/native/tokens.js`

**Light theme build** -- Compiles base + `themes/light.json` + brand light overrides:
- CSS: `dist/themes/light.css` or `dist/brands/{name}/themes/light.css`
- Native JS: `dist/native/light.js` or `dist/brands/{name}/native/light.js`

**Dark theme build** -- Compiles base + `themes/dark.json` + brand dark overrides:
- CSS: `dist/themes/dark.css` or `dist/brands/{name}/themes/dark.css`
- Native JS: `dist/native/dark.js` or `dist/brands/{name}/native/dark.js`

### Step 4: Type declarations generated

Each JS output gets a `.d.ts` file with `export declare const tokens: Record<string, string | number | object>`.

### Total output

For 3 brands (default + ocean + sunset) with 2 themes each, the build produces:
- 3 base builds x 3 platforms (CSS + JS + Native) = 9 outputs
- 3 brands x 2 themes x 2 platforms (CSS + Native) = 12 outputs
- 3 brands x type declarations = DTS files

All of this happens in about 2 seconds.

---

## 4. How to Add a New Token

### Adding a primitive token

Example: Adding `spacing-14: 56px` to the spacing scale.

Edit `src/primitives/spacing.json`:

```json
{
  "spacing": {
    "14": { "$value": "56px", "$type": "dimension" }
  }
}
```

Run `pnpm build`. The output is:
- CSS: `--entropix-spacing-14: 56px;`
- JS (web): `entropixSpacing14: "56px"`
- JS (native): `entropixSpacing14: 56` (number, px stripped by `dimension/pixelToNumber` transform)

### Adding a semantic token

Example: Adding a new semantic alias for large section spacing.

Edit `src/semantic/spacing.json`:

```json
{
  "space": {
    "section": {
      "padding-xl": {
        "$value": "{spacing.16}",
        "$type": "dimension"
      }
    }
  }
}
```

The `{spacing.16}` reference resolves to `64px` from primitives. In CSS output, it produces `--entropix-space-section-padding-xl: 64px;` (or with `outputReferences: true`, `--entropix-space-section-padding-xl: var(--entropix-spacing-16);`).

### Adding a component token

See Section 5 below for the full walkthrough.

---

## 5. How to Add a Component Token

Component tokens live in `src/components/`. They reference semantic tokens (which in turn reference primitives), creating a clean override chain.

Example: Adding card-specific tokens.

Create `src/components/card.json`:

```json
{
  "card": {
    "$description": "Card component tokens",

    "padding":       { "$value": "{space.component.padding-lg}", "$type": "dimension" },
    "border-radius": { "$value": "{radius.lg}",                  "$type": "dimension" },
    "border-color":  { "$value": "{color.border.default}",       "$type": "color" },

    "bg": {
      "default":     { "$value": "{color.surface.primary}",      "$type": "color" },
      "elevated":    { "$value": "{color.surface.secondary}",    "$type": "color" }
    },

    "shadow":        { "$value": "{shadow.sm}",                  "$type": "shadow" }
  }
}
```

Run `pnpm build`. This produces CSS variables like:

```css
--entropix-card-padding: var(--entropix-space-component-padding-lg);
--entropix-card-border-radius: var(--entropix-radius-lg);
--entropix-card-bg-default: var(--entropix-color-surface-primary);
```

Your React component CSS then uses these:

```css
.entropix-card {
  padding: var(--entropix-card-padding);
  border-radius: var(--entropix-card-border-radius);
  background: var(--entropix-card-bg-default);
  border: 1px solid var(--entropix-card-border-color);
  box-shadow: var(--entropix-card-shadow);
}
```

The existing `button.json` in the codebase is a good reference. It defines tokens for padding, typography, and per-variant colors (primary, secondary, danger).

---

## 6. Understanding Token References

References use curly brace syntax `{path.to.token}` and resolve through the full token tree:

```
{spacing.4}                         --> 16px (from primitives/spacing.json)
{color.blue.500}                    --> #3b82f6 (from primitives/colors.json)
{color.action.primary.default}      --> {color.blue.500} --> #3b82f6 (from semantic/colors.json)
{space.component.padding-lg}        --> {spacing.4} --> 16px (from semantic/spacing.json)
```

References are resolved at build time. In CSS output with `outputReferences: true`, they become `var()` references:

```css
--entropix-button-primary-bg: var(--entropix-color-action-primary-default);
```

This means changing `--entropix-color-action-primary-default` at runtime (e.g., via a theme or brand override) automatically updates the button background.

---

## 7. How to Add a New Brand

Brands override tokens at any level. The build system discovers them automatically from subdirectories in `src/brands/`.

### Step-by-step: Adding a "forest" brand

#### 1. Create the directory structure

```
src/brands/forest/
  primitives/
    colors.json
  semantic/
    colors.json
  themes/
    light.json
    dark.json
```

#### 2. Override primitive colors

`src/brands/forest/primitives/colors.json`:

```json
{
  "color": {
    "green": {
      "50":  { "$value": "#f0fdf4", "$type": "color" },
      "100": { "$value": "#dcfce7", "$type": "color" },
      "500": { "$value": "#22c55e", "$type": "color" },
      "600": { "$value": "#16a34a", "$type": "color" },
      "700": { "$value": "#15803d", "$type": "color" },
      "800": { "$value": "#166534", "$type": "color" },
      "900": { "$value": "#14532d", "$type": "color" }
    }
  }
}
```

#### 3. Override semantic mappings

`src/brands/forest/semantic/colors.json`:

```json
{
  "color": {
    "action": {
      "primary": {
        "default": { "$value": "{color.green.600}", "$type": "color" },
        "hover":   { "$value": "{color.green.700}", "$type": "color" },
        "active":  { "$value": "{color.green.800}", "$type": "color" }
      }
    }
  }
}
```

#### 4. Add theme overrides

`src/brands/forest/themes/dark.json`:

```json
{
  "color": {
    "action": {
      "primary": {
        "default": { "$value": "{color.green.500}", "$type": "color" }
      }
    }
  }
}
```

#### 5. Build

```bash
pnpm build
```

The build discovers `forest/` automatically and outputs:
- `dist/brands/forest/web/variables.css`
- `dist/brands/forest/themes/light.css`
- `dist/brands/forest/themes/dark.css`
- `dist/brands/forest/native/tokens.js`
- `dist/brands/forest/native/light.js`
- `dist/brands/forest/native/dark.js`

#### 6. Consume

Import in your app:

```css
@import "@entropix/tokens/brands/forest/css";
@import "@entropix/tokens/brands/forest/themes/dark";
```

Or in HTML, apply `data-brand="forest"` to a container element. The generated CSS uses attribute selectors:

```css
[data-brand="forest"] {
  --entropix-color-action-primary-default: #16a34a;
}
```

---

## 8. How Brand and Theme CSS Selectors Work

The build generates different CSS selectors for each combination:

```css
/* Default brand, no theme */
:root {
  --entropix-color-action-primary-default: #3b82f6;
}

/* Default brand, dark theme */
[data-theme="dark"] {
  --entropix-color-action-primary-default: #60a5fa;
}

/* Ocean brand, base */
[data-brand="ocean"] {
  --entropix-color-action-primary-default: #0d9488;
}

/* Ocean brand, dark theme */
[data-brand="ocean"][data-theme="dark"] {
  --entropix-color-action-primary-default: #2dd4bf;
}
```

To switch brands at runtime, set `data-brand` on the root element:

```html
<html data-brand="ocean" data-theme="dark">
```

All components using `var(--entropix-color-action-primary-default)` automatically update.

---

## 9. W3C DTCG Token Format

All source files use the W3C Design Token Community Group format. Key rules:

- **$value**: The token's value (required)
- **$type**: The token type -- `color`, `dimension`, `fontWeight`, `shadow`, `duration`, `number` (required)
- **$description**: Optional human-readable description

```json
{
  "spacing": {
    "4": {
      "$value": "16px",
      "$type": "dimension",
      "$description": "Standard component padding"
    }
  }
}
```

Groups (like `"spacing"`) can be nested. The final token name is built from the full path: `spacing.4` becomes `--entropix-spacing-4` in CSS and `entropixSpacing4` in JS.

---

## 10. Custom Transforms

The build registers three custom transforms in `build.ts`:

### `dimension/pixelToNumber`
Strips `px` from dimension values for React Native (which uses plain numbers).
- Input: `"16px"` -> Output: `16`
- Applies to: tokens with `$type: "dimension"`

### `shadow/reactNative`
Converts W3C shadow objects to React Native's shadow format.
- Input: `{ offsetX: "0px", offsetY: "4px", blur: "8px", color: "#000" }`
- Output: `{ shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, shadowColor: "#000", shadowOpacity: 1, elevation: 4 }`

### `duration/milliseconds`
Strips `ms` from duration values for React Native Animated.
- Input: `"200ms"` -> Output: `200`
- Applies to: tokens with `$type: "duration"`

These transforms only run on native platform outputs. Web outputs keep the original string values.

---

## 11. Package Exports

The `package.json` exports map provides clean import paths:

```typescript
// Web CSS variables
import "@entropix/tokens/css";

// Web JS tokens
import { tokens } from "@entropix/tokens/web";

// Native JS tokens
import { tokens } from "@entropix/tokens/native";

// Theme CSS
import "@entropix/tokens/themes/light";
import "@entropix/tokens/themes/dark";

// Brand-specific
import "@entropix/tokens/brands/ocean/css";
import { tokens } from "@entropix/tokens/brands/ocean/web";
import "@entropix/tokens/brands/ocean/themes/dark";
```

---

## 12. Debugging Tokens

| Problem | Where to look |
|---------|---------------|
| Token not appearing in output | Is it in the right source file? Primitives for raw values, semantic for aliases, components for component-specific |
| Wrong value in dark mode | Check `src/themes/dark.json` for the override. If missing, the base value is used |
| Brand not building | Verify the directory exists at `src/brands/{name}/` and contains valid JSON |
| Reference not resolving | Check the path matches exactly. `{color.blue.500}` must exist in the resolved source files |
| CSS variable not updating with brand | Ensure the brand CSS is loaded after the base CSS. Check `data-brand` attribute is set on the element |
| Native value still has "px" | Verify the token has `"$type": "dimension"`. The `pixelToNumber` transform only runs on dimension types |
| Build fails silently | Run with `LOG_VERBOSITY=verbose` or change `verbosity` in `build.ts` to `"verbose"` for the failing brand |

### Quick verification

After building, you can inspect the output directly:

```bash
# Check a CSS variable exists
grep "spacing-14" dist/web/variables.css

# Check a brand override
grep "action-primary" dist/brands/ocean/web/variables.css

# Check native value is a number (no quotes around value)
grep "spacing14" dist/native/tokens.js
```
