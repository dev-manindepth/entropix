# Entropix Implementation Guide

This is the developer guide for working in the Entropix codebase. It teaches you how to think about the project, how to add features end-to-end, and how to debug common problems.

---

## 1. Mental Model -- How to Think About This Project

Entropix has three layers. Every feature flows top-down through them:

```
Core (headless logic)  -->  Platform (React / React Native)  -->  AI (generation / rendering)
```

- **Core** (`@entropix/core`) is the contract layer. It defines WHAT should happen -- state management, accessibility declarations, keyboard intent -- but never HOW it looks. If core does not support a behavior, no platform package can provide it.
- **Platform** (`@entropix/react`, `@entropix/react-native`) translates the contract into real DOM or native elements. It maps `accessibility.expanded` to `aria-expanded` on web, or `accessibilityState.expanded` on native.
- **AI** (`@entropix/ai`) knows about every component in the registry. It generates UISpec JSON that resolves to real components at render time.
- **Tokens** (`@entropix/tokens`) provides the visual DNA -- colors, spacing, typography -- consumed as CSS variables on web and JS objects on native.

Think of it like: core = brain, react/react-native = body, tokens = skin, ai = voice.

**The golden rule:** always start in core, then implement in the platform packages, then register with AI.

---

## 2. Setting Up Your Dev Environment

```bash
git clone https://github.com/dev-manindepth/entropix.git
cd entropix
pnpm install
pnpm build     # builds everything (tokens first, then core, then platform packages)
pnpm dev       # starts all dev servers in parallel
```

### How Turborepo resolves build order

Turborepo reads the dependency graph from each `package.json`. Since `@entropix/react` depends on `@entropix/core`, and `@entropix/core` depends on `@entropix/tokens`, builds run in this order:

```
tokens --> core --> react, react-native, ai --> apps (storybook, demo, studio, web)
```

You never need to manage this manually. Turborepo handles it.

### Running a single package

```bash
pnpm turbo run build --filter=@entropix/react
pnpm turbo run build --filter=@entropix/core
pnpm turbo run test --filter=@entropix/core
```

### Running tests across everything

```bash
pnpm turbo run test
```

### Starting Storybook

```bash
pnpm storybook
```

This starts the Storybook dev server from `apps/storybook/`.

---

## 3. End-to-End Walkthrough: Adding a New Component

This walks through adding a hypothetical "Avatar" component from scratch.

### Step 1: Plan the API

Before writing code, decide what the consumer will write:

```tsx
<Avatar src="/photo.jpg" name="John Doe" size="lg" />
<Avatar name="JD" size="sm" />  {/* initials fallback */}
```

Decide: What props? What sizes? What accessibility semantics? Avatar is an `img` role with a label derived from the name.

### Step 2: Core hook -- `packages/core/src/hooks/use-avatar.ts`

Core hooks always follow the same structure: Options interface, Return interface, key map (if interactive), hook function that returns prop getters.

```typescript
import { useMemo } from "react";
import type { PropGetterReturn } from "../types/prop-getters.js";

export interface UseAvatarOptions {
  /** The person's full name, used for aria-label and initials */
  name: string;
  /** Image source URL */
  src?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export interface UseAvatarReturn {
  /** Two-letter initials derived from name */
  initials: string;
  /** Whether an image src was provided */
  hasImage: boolean;
  /** Props for the avatar container element */
  getAvatarProps: () => PropGetterReturn;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function useAvatar(options: UseAvatarOptions): UseAvatarReturn {
  const { name, src, size = "md" } = options;

  const initials = useMemo(() => getInitials(name), [name]);

  const getAvatarProps = (): PropGetterReturn => ({
    accessibility: {
      role: "none",           // decorative by default
      label: name,            // screen reader announces the name
    },
  });

  return { initials, hasImage: !!src, getAvatarProps };
}
```

Note: Avatar is not interactive so there is no `keyboardConfig` or `onAction`. The hook is still valuable because it provides the accessibility contract and derived state (initials).

### Step 3: Export from core

Add to `packages/core/src/index.ts`:

```typescript
export { useAvatar } from "./hooks/use-avatar.js";
export type { UseAvatarOptions, UseAvatarReturn } from "./hooks/use-avatar.js";
```

Add to `packages/core/tsup.config.ts` entry map:

```typescript
"hooks/use-avatar": "src/hooks/use-avatar.ts",
```

### Step 4: React component -- `packages/react/src/components/avatar.tsx`

The React component imports the core hook and maps its output to DOM attributes:

```tsx
import { forwardRef } from "react";
import { useAvatar } from "@entropix/core";
import { mapAccessibilityToAria } from "../utils/map-accessibility-to-aria.js";
import { cn } from "../utils/cn.js";
import "../styles/avatar.css";

export interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar({ name, src, size = "md", className }, ref) {
    const { initials, hasImage, getAvatarProps } = useAvatar({ name, src, size });
    const ariaProps = mapAccessibilityToAria(getAvatarProps().accessibility);

    return (
      <div
        ref={ref}
        className={cn("entropix-avatar", `entropix-avatar--${size}`, className)}
        {...ariaProps}
      >
        {hasImage ? (
          <img className="entropix-avatar__image" src={src} alt={name} />
        ) : (
          <span className="entropix-avatar__initials">{initials}</span>
        )}
      </div>
    );
  }
);
```

### Step 5: CSS -- `packages/react/src/styles/avatar.css`

Follow the BEM pattern: `.entropix-{component}__{part}--{modifier}`.

```css
.entropix-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--entropix-radius-full);
  background: var(--entropix-color-surface-secondary);
  color: var(--entropix-color-text-primary);
  font-weight: var(--entropix-font-weight-medium);
  overflow: hidden;
}

.entropix-avatar--sm { width: 32px; height: 32px; font-size: 12px; }
.entropix-avatar--md { width: 40px; height: 40px; font-size: 14px; }
.entropix-avatar--lg { width: 48px; height: 48px; font-size: 16px; }

.entropix-avatar__image { width: 100%; height: 100%; object-fit: cover; }
```

### Step 6: Export from react

Add to `packages/react/src/index.ts` and import the CSS in `packages/react/src/styles/index.css` via `@import "./avatar.css";`.

### Step 7: React Native component

Mirror the React component using `View`, `Text`, `Image` from React Native. Use native tokens from `@entropix/tokens/native` instead of CSS variables.

### Step 8: Storybook story

Create `apps/storybook/src/Avatar.stories.tsx` with variants showing image, initials fallback, and all sizes.

### Step 9: AI registry

Add Avatar to `packages/ai/src/registry/registry.ts`:

```typescript
Avatar: {
  name: "Avatar",
  description: "User avatar with image or initials fallback",
  category: "display",
  platform: "both",
  package: "@entropix/react",
  acceptsChildren: false,
  props: [
    { name: "name", type: "string", required: true, description: "Person's name" },
    { name: "src", type: "string", required: false, description: "Image URL" },
    { name: "size", type: '"sm" | "md" | "lg"', required: false, defaultValue: "md" },
  ],
},
```

### Step 10: Test

```bash
pnpm turbo run lint build test
```

### Step 11: Changeset

```bash
pnpm changeset
# Select @entropix/core, @entropix/react
# Describe: "Add Avatar component with image and initials fallback"
```

---

## 4. How to Add a New Design Token

Tokens live in `packages/tokens/src/` organized as:

```
src/primitives/   -- Raw values (colors.json, spacing.json, typography.json)
src/semantic/     -- Meaningful aliases (color.action.primary -> blue.500)
src/components/   -- Component-specific tokens (button.json)
src/themes/       -- Theme overrides (light.json, dark.json)
src/brands/       -- Brand-specific overrides (ocean/, sunset/)
```

To add a new spacing value `--entropix-spacing-14: 56px`:

1. Edit `packages/tokens/src/primitives/spacing.json`:
```json
"14": { "$value": "56px", "$type": "dimension" }
```

2. Rebuild: `pnpm turbo run build --filter=@entropix/tokens`

3. The build pipeline (Style Dictionary v4) processes the W3C DTCG JSON and outputs:
   - CSS: `dist/web/variables.css` with `--entropix-spacing-14: 56px`
   - JS: `dist/web/tokens.js` with `entropixSpacing14: "56px"`
   - Native JS: `dist/native/tokens.js` with `entropixSpacing14: 56` (number, px stripped)

To add it to a brand variant, create the override in `src/brands/{name}/primitives/spacing.json` and rebuild. The build discovers brands automatically.

---

## 5. How to Add i18n Strings for a New Component

1. Add keys to `EntropixLocale` in `packages/core/src/i18n/types.ts`:
```typescript
// Use underscore namespacing: componentName_keyName
avatar_label: string;
avatar_imageAlt: (name: string) => string;
```

2. Add English defaults to `packages/core/src/i18n/default-locale.ts`:
```typescript
avatar_label: "User avatar",
avatar_imageAlt: (name: string) => `Photo of ${name}`,
```

3. Use `useLocale()` in the component to look up the strings.

4. For demos, update the Japanese sample locale with translated values.

---

## 6. How the CI/CD Pipeline Works

### On every push/PR to main

CI runs in `.github/workflows/ci.yml`:
- Installs pnpm + Node.js on matrix [18, 20, 22]
- Runs `pnpm turbo run build --filter='./packages/*'`
- Runs lint, type-check, and tests
- On PRs, also does a publish dry-run to verify package contents

### Publishing to npm

When you are ready to release:

1. Run `pnpm changeset` locally -- select changed packages, write a description
2. Commit the changeset file and push
3. The publish workflow (`.github/workflows/publish.yml`) detects changesets and creates a "Version Packages" PR
4. Merge that PR -- the workflow publishes all changed packages to npm automatically

---

## 7. How to Deploy Studio Changes

Studio (`apps/studio`) deploys automatically to Vercel on push to main.

- **Database migrations**: Add schema changes to `initDb()` in `lib/db/index.ts`. This runs automatically on the first request after deploy.
- **Environment variables**: Set in Vercel dashboard. Run `vercel env pull` to sync locally.
- **Build config**: Root Directory is `apps/studio`. The build command uses `cd ../..` to access workspace packages.

---

## 8. Common Patterns You Will See Everywhere

### Prop-getter pattern

Every core hook returns functions like `getButtonProps()`, `getTriggerProps()`, `getContentProps()`. These return a `PropGetterReturn` containing:

```typescript
{
  accessibility: { role, label, expanded, ... },   // platform-neutral ARIA
  keyboardConfig: { keyMap, getIntent() },          // keyboard intent resolver
  onAction: () => void,                             // click/press handler
}
```

Platform components call `mapAccessibilityToAria()` (web) or the native equivalent to translate these.

### Compound components

Dialog, Menu, Tabs, Select all use this pattern:
- Root component provides context via React context
- Child components consume via `useXContext()`
- Core provides one hook with multiple prop getters (e.g., `getTriggerProps`, `getContentProps`)

### Controlled and uncontrolled state

All stateful hooks use `useControllableState`:

```typescript
const [isOpen, setIsOpen] = useControllableState({
  value: controlledIsOpen,       // if defined, component is controlled
  defaultValue: defaultOpen,     // initial value for uncontrolled mode
  onChange: onOpenChange,         // notification callback
});
```

### BEM CSS naming

```
.entropix-{component}                    -- block
.entropix-{component}__{part}            -- element
.entropix-{component}--{modifier}        -- modifier
```

Example: `.entropix-button--primary`, `.entropix-avatar__initials`.

### SSR safety

Components that depend on client-only APIs use the mounted pattern:

```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
```

---

## 9. Debugging Tips

| Problem | Check |
|---------|-------|
| Component not rendering styles | Is the CSS imported? Check `sideEffects` in `package.json` -- CSS imports must be listed |
| Props not taking effect | Does the AI registry in `@entropix/ai` match the actual component props? |
| Build failing | Isolate: `pnpm turbo run build --filter=@entropix/{package}` |
| Token not showing up | Is it in the right source file? Primitives vs semantic vs component |
| Wrong color in dark mode | Check `src/themes/dark.json` for the theme override |
| Vercel deploy failing | Verify Root Directory is `apps/studio` and build command is correct |
| Keyboard interaction not working | Check `keyboardConfig` is not undefined (disabled state skips it) |
| Accessibility missing | Verify `mapAccessibilityToAria()` is called and spread onto the element |
