# @entropix/react

React web components for the Entropix design system — accessible, styled with CSS custom properties, and powered by design tokens.

[![npm](https://img.shields.io/npm/v/@entropix/react)](https://www.npmjs.com/package/@entropix/react)
[![license](https://img.shields.io/npm/l/@entropix/react)](https://github.com/dev-manindepth/entropix/blob/main/LICENSE)

## Installation

```bash
npm install @entropix/react @entropix/tokens
# or
pnpm add @entropix/react @entropix/tokens
# or
yarn add @entropix/react @entropix/tokens
```

## Quick Start

**1. Import token CSS once** in your app entry (e.g., `globals.css` or `layout.tsx`):

```css
@import "@entropix/tokens/css";
@import "@entropix/tokens/themes/light";
@import "@entropix/tokens/themes/dark";
@import "@entropix/react/styles";
```

Or import in JavaScript:

```typescript
import "@entropix/tokens/css";
import "@entropix/tokens/themes/light";
import "@entropix/tokens/themes/dark";
import "@entropix/react/styles";
```

**2. Use components:**

```tsx
import { Button, Toggle, Switch, Tabs, TabList, Tab, TabPanel } from "@entropix/react";

function App() {
  return (
    <div data-theme="light">
      <Button variant="primary" size="md" onPress={() => alert("Clicked!")}>
        Get Started
      </Button>

      <Toggle onChange={(checked) => console.log(checked)}>
        Enable notifications
      </Toggle>

      <Tabs defaultSelectedKey="tab1">
        <TabList>
          <Tab value="tab1">Overview</Tab>
          <Tab value="tab2">Details</Tab>
        </TabList>
        <TabPanel value="tab1">Overview content</TabPanel>
        <TabPanel value="tab2">Details content</TabPanel>
      </Tabs>
    </div>
  );
}
```

## Components

### Button

```tsx
<Button
  variant="primary"   // "primary" | "secondary" | "outline" | "ghost" | "danger"
  size="md"            // "sm" | "md" | "lg"
  disabled={false}
  loading={false}
  onPress={() => {}}
  as="a"               // Polymorphic — render as any element
>
  Click me
</Button>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | — | Visual variant (mapped via `data-variant` attribute) |
| `size` | `string` | — | Size variant (mapped via `data-size` attribute) |
| `disabled` | `boolean` | `false` | Disables the button |
| `loading` | `boolean` | `false` | Shows loading state |
| `onPress` | `() => void` | — | Click/press handler |
| `as` | `React.ElementType` | `"button"` | Render as a different element |

### Toggle

```tsx
<Toggle
  checked={isChecked}
  defaultChecked={false}
  onChange={(checked) => setChecked(checked)}
  disabled={false}
  label="Accessibility label"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | — | Controlled checked state |
| `defaultChecked` | `boolean` | `false` | Initial state (uncontrolled) |
| `onChange` | `(checked: boolean) => void` | — | Change handler |
| `disabled` | `boolean` | `false` | Disables the toggle |
| `label` | `string` | — | Accessible label |

### Switch

Same API as Toggle but renders with `role="switch"` and switch-specific styling.

```tsx
<Switch onChange={(on) => console.log(on)} />
```

### Dialog

Compound component for modal dialogs with focus trapping and portal rendering.

```tsx
<Dialog closeOnOverlayPress closeOnEscape modal role="dialog">
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogOverlay />
  <DialogContent>
    <DialogTitle>Confirm Action</DialogTitle>
    <DialogDescription>Are you sure you want to proceed?</DialogDescription>
    <DialogClose>Close</DialogClose>
  </DialogContent>
</Dialog>
```

| Prop (Dialog) | Type | Default | Description |
|---------------|------|---------|-------------|
| `isOpen` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial state (uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | — | Open state change handler |
| `closeOnOverlayPress` | `boolean` | `true` | Close when clicking overlay |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `modal` | `boolean` | `true` | Trap focus inside dialog |
| `role` | `"dialog" \| "alertdialog"` | `"dialog"` | ARIA role |

### Tabs

```tsx
<Tabs
  defaultSelectedKey="overview"
  orientation="horizontal"
  onSelectedKeyChange={(key) => console.log(key)}
>
  <TabList>
    <Tab value="overview">Overview</Tab>
    <Tab value="api">API</Tab>
    <Tab value="examples">Examples</Tab>
  </TabList>
  <TabPanel value="overview">Overview content</TabPanel>
  <TabPanel value="api">API reference</TabPanel>
  <TabPanel value="examples">Code examples</TabPanel>
</Tabs>
```

| Prop (Tabs) | Type | Default | Description |
|-------------|------|---------|-------------|
| `selectedKey` | `string` | — | Controlled selected tab |
| `defaultSelectedKey` | `string` | — | Initial selected tab |
| `onSelectedKeyChange` | `(key: string) => void` | — | Selection change handler |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Tab list direction |
| `disabled` | `boolean` | `false` | Disable all tabs |
| `disabledKeys` | `string[]` | `[]` | Disable specific tabs |

### Accordion

```tsx
<Accordion defaultExpandedKeys={["faq1"]} allowMultiple={false} collapsible>
  <AccordionItem value="faq1">
    <AccordionTrigger>What is Entropix?</AccordionTrigger>
    <AccordionPanel>A cross-platform React design system.</AccordionPanel>
  </AccordionItem>
  <AccordionItem value="faq2">
    <AccordionTrigger>How does theming work?</AccordionTrigger>
    <AccordionPanel>Via CSS custom properties and data-theme attributes.</AccordionPanel>
  </AccordionItem>
</Accordion>
```

| Prop (Accordion) | Type | Default | Description |
|------------------|------|---------|-------------|
| `expandedKeys` | `string[]` | — | Controlled expanded items |
| `defaultExpandedKeys` | `string[]` | `[]` | Initial expanded items |
| `onExpandedKeysChange` | `(keys: string[]) => void` | — | Expansion change handler |
| `allowMultiple` | `boolean` | `false` | Allow multiple open sections |
| `collapsible` | `boolean` | `true` | Allow closing all sections |

### Menu

```tsx
<Menu closeOnSelect loop>
  <MenuTrigger>Actions</MenuTrigger>
  <MenuContent>
    <MenuItem index={0} onSelect={() => console.log("Edit")}>Edit</MenuItem>
    <MenuItem index={1} onSelect={() => console.log("Delete")} disabled>Delete</MenuItem>
  </MenuContent>
</Menu>
```

| Prop (MenuItem) | Type | Default | Description |
|-----------------|------|---------|-------------|
| `index` | `number` | **required** | Item index for keyboard navigation |
| `onSelect` | `() => void` | — | Called when item is selected |
| `disabled` | `boolean` | `false` | Disables the item |

## Layout Primitives

### Stack

Vertical flex container with consistent spacing.

```tsx
<Stack gap="md" align="center" fullWidth>
  <Button>First</Button>
  <Button>Second</Button>
</Stack>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl"` | token default | Vertical spacing |
| `align` | `"start" \| "center" \| "end" \| "stretch"` | — | Cross-axis alignment |
| `fullWidth` | `boolean` | `false` | Stretch to full width |
| `as` | `React.ElementType` | `"div"` | Render as different element |

### Inline

Horizontal flex container.

```tsx
<Inline gap="sm" align="center" justify="between" wrap>
  <Button>Save</Button>
  <Button variant="outline">Cancel</Button>
</Inline>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `SpacingSize` | token default | Horizontal spacing |
| `align` | `"start" \| "center" \| "end" \| "stretch" \| "baseline"` | — | Cross-axis alignment |
| `justify` | `"start" \| "center" \| "end" \| "between" \| "around"` | — | Main-axis distribution |
| `wrap` | `boolean` | `false` | Allow wrapping |

### Container

Centered max-width container with responsive padding.

```tsx
<Container maxWidth="lg" center>
  <h1>Page content</h1>
</Container>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxWidth` | `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| "full"` | `"lg"` | Max width preset |
| `center` | `boolean` | `true` | Center horizontally |

### Divider

```tsx
<Divider orientation="horizontal" spacing="md" />
```

## Responsive Hooks

```typescript
import { useBreakpoint, useBreakpointValue, useMediaQuery, BREAKPOINTS } from "@entropix/react";

// Get current breakpoint name
const bp = useBreakpoint(); // "base" | "sm" | "md" | "lg" | "xl" | "2xl"

// Check if at or above a breakpoint
const isDesktop = useBreakpointValue("lg"); // true/false

// Custom media query
const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

// Breakpoint pixel values
console.log(BREAKPOINTS); // { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 }
```

## Theming

Entropix uses CSS custom properties for theming. Set the `data-theme` attribute on any ancestor element:

```html
<!-- Light theme (default) -->
<div data-theme="light">...</div>

<!-- Dark theme -->
<div data-theme="dark">...</div>
```

All component styles use semantic token variables that automatically adapt to the active theme.

## CSS Architecture

Components use side-effect CSS imports — when you import a component, its styles are automatically included in your bundle. The `"sideEffects": ["**/*.css"]` in `package.json` ensures bundlers don't tree-shake the CSS.

CSS classes follow BEM-style naming: `.entropix-button`, `.entropix-button--primary`, `.entropix-button--md`.

To import all styles manually:

```css
@import "@entropix/react/styles";
```

## Related Packages

- [`@entropix/tokens`](https://www.npmjs.com/package/@entropix/tokens) — Design tokens (required peer)
- [`@entropix/core`](https://www.npmjs.com/package/@entropix/core) — Headless hooks (bundled dependency)
- [`@entropix/react-native`](https://www.npmjs.com/package/@entropix/react-native) — React Native components

## License

MIT
