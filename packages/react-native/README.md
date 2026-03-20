# @entropix/react-native

React Native components for the Entropix design system — iOS and Android with shared headless core and built-in theming.

[![npm](https://img.shields.io/npm/v/@entropix/react-native)](https://www.npmjs.com/package/@entropix/react-native)
[![license](https://img.shields.io/npm/l/@entropix/react-native)](https://github.com/dev-manindepth/entropix/blob/main/LICENSE)

## Installation

```bash
npm install @entropix/react-native @entropix/tokens
# or
pnpm add @entropix/react-native @entropix/tokens
# or
yarn add @entropix/react-native @entropix/tokens
```

**Peer dependencies:** `react` (^18 or ^19) and `react-native` (>=0.72).

## Quick Start

**1. Wrap your app with `EntropixProvider`:**

```tsx
import { EntropixProvider } from "@entropix/react-native";

export default function App() {
  return (
    <EntropixProvider mode="light">
      <HomeScreen />
    </EntropixProvider>
  );
}
```

**2. Use components:**

```tsx
import {
  Button,
  Toggle,
  Switch,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Stack,
  Container,
} from "@entropix/react-native";

function HomeScreen() {
  return (
    <Container maxWidth="md" center>
      <Stack gap="md">
        <Button variant="primary" size="md" onPress={() => alert("Pressed!")}>
          Get Started
        </Button>

        <Toggle onChange={(checked) => console.log(checked)} label="Notifications" />

        <Switch onChange={(on) => console.log(on)} label="Dark mode" />

        <Tabs defaultSelectedKey="tab1">
          <TabList>
            <Tab value="tab1">Overview</Tab>
            <Tab value="tab2">Details</Tab>
          </TabList>
          <TabPanel value="tab1">Overview content</TabPanel>
          <TabPanel value="tab2">Details content</TabPanel>
        </Tabs>
      </Stack>
    </Container>
  );
}
```

## Theme Provider

### EntropixProvider

Wraps your app to provide theme tokens to all components.

```tsx
<EntropixProvider mode="light">  {/* "light" | "dark" */}
  {children}
</EntropixProvider>
```

### useTheme

Access the current theme inside any component:

```tsx
import { useTheme } from "@entropix/react-native";

function MyComponent() {
  const { mode, tokens, baseTokens } = useTheme();

  return (
    <View style={{ backgroundColor: tokens.color.bg.primary }}>
      <Text style={{ color: tokens.color.text.primary }}>
        Current theme: {mode}
      </Text>
    </View>
  );
}
```

| Return | Type | Description |
|--------|------|-------------|
| `mode` | `"light" \| "dark"` | Current theme mode |
| `tokens` | `EntropixTheme` | Theme-specific token values |
| `baseTokens` | `object` | Base (non-themed) token values |

## Components

### Button

```tsx
<Button
  variant="primary"   // "primary" | "secondary" | "outline" | "ghost" | "danger"
  size="md"            // "sm" | "md" | "lg"
  disabled={false}
  loading={false}
  onPress={() => {}}
  style={customViewStyle}
  textStyle={customTextStyle}
>
  Press me
</Button>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `ButtonVariant` | `"primary"` | Visual variant |
| `size` | `ButtonSize` | `"md"` | Size preset |
| `disabled` | `boolean` | `false` | Disables the button |
| `loading` | `boolean` | `false` | Shows loading state |
| `onPress` | `() => void` | — | Press handler |
| `style` | `StyleProp<ViewStyle>` | — | Container style overrides |
| `textStyle` | `TextStyle` | — | Label text style overrides |

### Toggle

```tsx
<Toggle
  checked={isChecked}
  defaultChecked={false}
  onChange={(checked) => setChecked(checked)}
  disabled={false}
  label="Enable feature"
  style={customStyle}
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

Same API as Toggle but renders with `role="switch"` and track/thumb visual styling.

```tsx
<Switch onChange={(on) => console.log(on)} label="Dark mode" />
```

### Dialog

Compound component using React Native `Modal`.

```tsx
<Dialog closeOnOverlayPress modal role="dialog">
  <DialogTrigger>
    <Text>Open Dialog</Text>
  </DialogTrigger>
  <DialogOverlay />
  <DialogContent>
    <DialogTitle>Confirm</DialogTitle>
    <DialogDescription>Are you sure?</DialogDescription>
    <DialogClose>
      <Text>Close</Text>
    </DialogClose>
  </DialogContent>
</Dialog>
```

| Prop (Dialog) | Type | Default | Description |
|---------------|------|---------|-------------|
| `isOpen` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial state |
| `onOpenChange` | `(open: boolean) => void` | — | State change handler |
| `closeOnOverlayPress` | `boolean` | `true` | Close on overlay tap |
| `modal` | `boolean` | `true` | Modal presentation |
| `role` | `"dialog" \| "alertdialog"` | `"dialog"` | Accessibility role |

### Tabs

```tsx
<Tabs defaultSelectedKey="tab1" orientation="horizontal">
  <TabList>
    <Tab value="tab1">Tab 1</Tab>
    <Tab value="tab2">Tab 2</Tab>
  </TabList>
  <TabPanel value="tab1">Content 1</TabPanel>
  <TabPanel value="tab2">Content 2</TabPanel>
</Tabs>
```

### Accordion

```tsx
<Accordion defaultExpandedKeys={["item1"]} allowMultiple={false} collapsible>
  <AccordionItem value="item1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionPanel>Content 1</AccordionPanel>
  </AccordionItem>
</Accordion>
```

### Menu

```tsx
<Menu closeOnSelect>
  <MenuTrigger>
    <Text>Actions</Text>
  </MenuTrigger>
  <MenuContent>
    <MenuItem index={0} onSelect={() => console.log("Edit")}>Edit</MenuItem>
    <MenuItem index={1} onSelect={() => console.log("Delete")}>Delete</MenuItem>
  </MenuContent>
</Menu>
```

## Layout Primitives

### Stack

Vertical flex container.

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

### Inline

Horizontal flex container.

```tsx
<Inline gap="sm" align="center" justify="between" wrap>
  <Button>Save</Button>
  <Button variant="outline">Cancel</Button>
</Inline>
```

### Container

Centered max-width container with responsive padding that adapts at tablet (768px) and desktop (1024px) breakpoints.

```tsx
<Container maxWidth="lg" center>
  <Text>Page content</Text>
</Container>
```

### Divider

```tsx
<Divider orientation="horizontal" spacing="md" />
```

## Responsive Hooks

```typescript
import {
  useBreakpoint,
  useBreakpointValue,
  useScreenDimensions,
  BREAKPOINTS,
} from "@entropix/react-native";

// Current breakpoint
const bp = useBreakpoint(); // "base" | "sm" | "md" | "lg" | "xl" | "2xl"

// Check breakpoint threshold
const isTablet = useBreakpointValue("md");

// Raw screen dimensions
const { width, height } = useScreenDimensions();

// Breakpoint values
console.log(BREAKPOINTS); // { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 }
```

## Styling

All components are pre-styled using design tokens from `@entropix/tokens/native`. Styles are applied via `StyleSheet.create()` and adapt to the current theme via `EntropixProvider`.

To customize styles, use the `style` prop (and `textStyle` for text-containing components):

```tsx
<Button
  variant="primary"
  style={{ marginTop: 20 }}
  textStyle={{ letterSpacing: 1 }}
>
  Custom styled
</Button>
```

For full control over colors, access tokens directly via `useTheme()`:

```tsx
const { tokens } = useTheme();

<View style={{ backgroundColor: tokens.color.bg.secondary, padding: tokens.space.md }}>
  <Text style={{ color: tokens.color.text.primary }}>Themed content</Text>
</View>
```

## Architecture

`@entropix/react-native` shares the same headless hooks as `@entropix/react`:

```
@entropix/core (shared hooks)
  ├── @entropix/react        (web: HTML + CSS)
  └── @entropix/react-native (mobile: RN Views + StyleSheet)
```

Same API surface, same accessibility behavior, different renderers.

## Related Packages

- [`@entropix/tokens`](https://www.npmjs.com/package/@entropix/tokens) — Design tokens (required peer)
- [`@entropix/core`](https://www.npmjs.com/package/@entropix/core) — Headless hooks (bundled dependency)
- [`@entropix/react`](https://www.npmjs.com/package/@entropix/react) — React web components

## License

MIT
