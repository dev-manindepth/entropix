# @entropix/tokens

W3C DTCG design tokens for the Entropix design system — CSS variables, JavaScript objects, and theme files.

[![npm](https://img.shields.io/npm/v/@entropix/tokens)](https://www.npmjs.com/package/@entropix/tokens)
[![license](https://img.shields.io/npm/l/@entropix/tokens)](https://github.com/dev-manindepth/entropix/blob/main/LICENSE)

## Installation

```bash
npm install @entropix/tokens
# or
pnpm add @entropix/tokens
# or
yarn add @entropix/tokens
```

## Usage

### CSS Variables (Web)

Import the CSS custom properties once in your app entry point:

```css
/* app/globals.css or equivalent */
@import "@entropix/tokens/css";
```

All variables are prefixed with `--entropix-`:

```css
.my-element {
  color: var(--entropix-color-action-primary-default);
  padding: var(--entropix-space-md);
  border-radius: var(--entropix-radius-md);
  font-family: var(--entropix-font-family-sans);
}
```

### Theming

Light and dark themes are available as CSS files scoped to `[data-theme]`:

```css
@import "@entropix/tokens/themes/light";
@import "@entropix/tokens/themes/dark";
```

Switch themes by setting the `data-theme` attribute:

```html
<html data-theme="light">
  <!-- or -->
<html data-theme="dark">
```

Semantic token variables automatically adapt when the theme changes.

### JavaScript Objects (Web)

```typescript
import { tokens } from "@entropix/tokens/web";

// Access token values programmatically
console.log(tokens.color.action.primary.default); // "#3B82F6"
console.log(tokens.space.md);                      // "16px"
```

### React Native

For React Native, use the native export which provides unitless numbers and platform-appropriate formats:

```typescript
import { tokens } from "@entropix/tokens/native";

// Values are unitless (numbers, not "16px")
console.log(tokens.space.md); // 16

// Theme-specific tokens
import { tokens as lightTokens } from "@entropix/tokens/native/light";
import { tokens as darkTokens } from "@entropix/tokens/native/dark";
```

## Token Categories

| Category | Examples | Description |
|----------|----------|-------------|
| **Colors** | `color.action.primary.*`, `color.bg.*`, `color.text.*` | Semantic color tokens with light/dark variants |
| **Spacing** | `space.xs` through `space.2xl`, `space.layout.*` | Consistent spacing scale |
| **Typography** | `font.family.*`, `font.size.*`, `font.weight.*` | Font families, sizes, weights, and line heights |
| **Radii** | `radius.sm` through `radius.full` | Border radius values |
| **Shadows** | `shadow.sm` through `shadow.xl` | Elevation shadows (CSS box-shadow / RN shadow format) |
| **Motion** | `duration.*`, `easing.*` | Animation durations and timing functions |
| **Breakpoints** | `breakpoint.sm` through `breakpoint.2xl` | Responsive breakpoint values |

## Token Layers

Tokens are organized in a layered architecture:

1. **Primitives** — Raw values (colors, sizes, font stacks)
2. **Semantic** — Purpose-driven references (`color.action.primary` references a primitive)
3. **Themes** — Override semantic tokens per theme (light/dark)
4. **Components** — Component-specific tokens (e.g., button padding)

## Exports Map

| Import Path | Format | Use Case |
|-------------|--------|----------|
| `@entropix/tokens/css` | CSS file | Web — custom properties on `:root` |
| `@entropix/tokens/web` | JS module | Web — programmatic access |
| `@entropix/tokens/native` | JS module | React Native — base tokens |
| `@entropix/tokens/themes/light` | CSS file | Web — light theme overrides |
| `@entropix/tokens/themes/dark` | CSS file | Web — dark theme overrides |
| `@entropix/tokens/native/light` | JS module | React Native — light theme tokens |
| `@entropix/tokens/native/dark` | JS module | React Native — dark theme tokens |

## Related Packages

- [`@entropix/react`](https://www.npmjs.com/package/@entropix/react) — React web components (uses CSS tokens)
- [`@entropix/react-native`](https://www.npmjs.com/package/@entropix/react-native) — React Native components (uses native tokens)
- [`@entropix/core`](https://www.npmjs.com/package/@entropix/core) — Headless hooks and utilities

## License

MIT
