# @entropix/react-native -- Implementation Guide

This document teaches you how to think about and write code in the `@entropix/react-native` package. It covers how the RN adapter differs from the web adapter, the theme system, brand registration, and step-by-step patterns for adding new components.

---

## 1. How React Native Differs from Web

The React Native adapter shares the same core hooks as `@entropix/react`, but the rendering layer is fundamentally different:

| Web (`@entropix/react`)              | React Native (`@entropix/react-native`)     |
|--------------------------------------|---------------------------------------------|
| CSS files (`.css`)                   | `StyleSheet` + `useTheme()` tokens          |
| `<div>`, `<span>`, `<button>`       | `View`, `Text`, `Pressable`                 |
| `createPortal()` for overlays       | `<Modal>` component for overlays            |
| `useFocusTrap` / `useFocusRestore`  | RN handles focus natively                   |
| `mapAccessibilityToAria()`          | `mapAccessibilityToRN()`                    |
| `aria-*` attributes                 | `accessibilityRole`, `accessibilityState`   |
| CSS custom properties for theming   | JavaScript token objects from `useTheme()`  |
| BEM class names                     | Inline `style` arrays                       |

**The core hook call is identical.** Only the rendering differs.

---

## 2. Walkthrough: Building an RN Component (Button)

Here is the actual Button component, annotated:

```tsx
import React, { useCallback } from "react";
import { Pressable, Text, type ViewStyle } from "react-native";
import { useButton } from "@entropix/core";
import { mapAccessibilityToRN } from "../utils/map-accessibility-to-rn.js";
import { useTheme } from "../theme/theme-context.js";

export function Button({
  onPress, disabled, loading, variant = "primary",
  size = "md", style, textStyle, children, ...rest
}: ButtonProps) {
  // STEP 1: Get theme tokens.
  // tokens (t) = semantic tokens that change with theme/brand.
  // baseTokens (bt) = primitive values constant across themes.
  const { tokens: t, baseTokens: bt } = useTheme();

  // STEP 2: Call the core hook (identical to web).
  const { isDisabled, isLoading, getButtonProps } = useButton({
    disabled,
    loading,
    onPress,
    elementType: "div",  // RN always uses "div" since there is no <button>
  });

  // STEP 3: Map accessibility to RN props.
  // Instead of { "aria-disabled": true }, we get
  // { accessibilityState: { disabled: true }, accessibilityRole: "button" }
  const propGetterReturn = getButtonProps();
  const rnAccessibility = mapAccessibilityToRN(propGetterReturn.accessibility);

  // STEP 4: Wrap the action callback.
  const handlePress = useCallback(() => {
    propGetterReturn.onAction?.();
  }, [propGetterReturn.onAction]);

  // STEP 5: Compute styles from tokens (replaces CSS).
  const sizeStyles = getSizeStyle(size, bt);
  const variantStyles = getVariantStyle(variant, t);
  const isInactive = isDisabled || isLoading;

  // STEP 6: Render with Pressable + style arrays.
  return (
    <Pressable
      {...rnAccessibility}
      {...rest}
      disabled={isInactive}
      onPress={isInactive ? undefined : handlePress}
      style={[
        baseStyle,
        sizeStyles.container,
        variantStyles,
        isInactive && { opacity: 0.5 },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text style={{ color: labelColor, fontSize: sizeStyles.fontSize }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
```

**Key differences from the web version:**

1. No CSS import -- styles come from tokens via `useTheme()`
2. No `className` -- use `style` arrays instead
3. No `onKeyDown` -- RN does not have keyboard navigation in the same way
4. `Pressable` instead of `<button>` -- handles press states natively
5. String children must be wrapped in `<Text>` -- RN requirement

---

## 3. How mapAccessibilityToRN Works

The RN accessibility mapper is more complex than the web one because RN uses a different model:

**Web:** One attribute per concept (`aria-disabled`, `aria-expanded`, etc.)

**RN:** Aggregated objects (`accessibilityState: { disabled, expanded, selected, checked, busy }`)

Here is the mapping:

| Core prop      | RN equivalent                              |
|----------------|-------------------------------------------|
| `role`         | `accessibilityRole` (via role map)         |
| `label`        | `accessibilityLabel`                       |
| `describedBy`  | `accessibilityHint`                        |
| `labelledBy`   | `accessibilityLabelledBy` (RN 0.71+)      |
| `disabled`     | `accessibilityState.disabled`              |
| `expanded`     | `accessibilityState.expanded`              |
| `selected`     | `accessibilityState.selected`              |
| `checked`      | `accessibilityState.checked`               |
| `busy`         | `accessibilityState.busy`                  |
| `valueNow`     | `accessibilityValue.now`                   |
| `valueMin`     | `accessibilityValue.min`                   |
| `valueMax`     | `accessibilityValue.max`                   |
| `valueText`    | `accessibilityValue.text`                  |
| `live`         | `accessibilityLiveRegion`                  |
| `hidden`       | `accessibilityElementsHidden` (iOS) + `importantForAccessibility` (Android) |

**Silently dropped** (no RN equivalent): `modal`, `hasPopup`, `controls`, `owns`, `tabIndex`, `pressed`.

Role mapping examples: `button` -> `"button"`, `checkbox` -> `"checkbox"`, `dialog` -> `"none"` (Modal handles it), `slider` -> `"adjustable"`.

---

## 4. Theme System -- How to Use Tokens

Every component accesses design tokens via the `useTheme()` hook:

```tsx
const { tokens: t, baseTokens: bt, mode, brand } = useTheme();
```

**`tokens` (aliased as `t`)** -- Semantic tokens that change with theme and brand. These represent _intent_:

```tsx
t.entropixButtonPrimaryBg       // The primary button background color
t.entropixColorTextPrimary      // Main text color
t.entropixColorBorderDefault    // Default border color
```

**`baseTokens` (aliased as `bt`)** -- Primitive tokens that stay constant across themes. These represent _measurements_:

```tsx
bt.entropixSpacing3             // 12 (pixels)
bt.entropixRadiusMd             // 6 (pixels)
bt.entropixFontSizeBase         // 16 (pixels)
bt.entropixButtonPaddingX       // 16 (pixels)
```

**Rule of thumb:** Use `t` for colors and visual identity. Use `bt` for spacing, radii, and font sizes.

---

## 5. Brand Registration

Brands let different apps share the same components with different visual identities.

**Step 1: Import brand token files.**

Brand tokens are generated from the `@entropix/tokens` package:

```tsx
import { tokens as oceanLight } from "@entropix/tokens/brands/ocean/native/light";
import { tokens as oceanDark } from "@entropix/tokens/brands/ocean/native/dark";
```

**Step 2: Register the brand before rendering.**

```tsx
import { registerBrand } from "@entropix/react-native";

registerBrand("ocean", {
  light: oceanLight,
  dark: oceanDark,
});
```

**Step 3: Use the brand in the provider.**

```tsx
<EntropixProvider brand="ocean" mode="dark">
  <App />
</EntropixProvider>
```

All Entropix components inside the provider will now use the "ocean" dark theme tokens.

If a brand is not registered, the provider falls back to the "default" brand (built-in light/dark tokens).

---

## 6. The EntropixProvider

The provider wraps your app root and supplies two contexts:

1. **ThemeContext** -- tokens, baseTokens, mode, brand
2. **LocaleContext** -- i18n strings for component labels

```tsx
<EntropixProvider
  brand="ocean"         // Which brand's tokens to use (default: "default")
  mode="dark"           // "light" or "dark" (default: "light")
  tokens={customTokens} // Override tokens directly (bypasses brand registry)
  locale={{ close: "Cerrar", open: "Abrir" }}  // i18n overrides
>
  <App />
</EntropixProvider>
```

Token resolution order:
1. If `tokens` prop is provided, use it directly
2. Otherwise, look up `brand` in the registry, then use `mode`
3. If brand not found, fall back to `default` brand

---

## 7. How to Add a New RN Component -- Checklist

- [ ] **Core hook**: Create `useYourComponent()` in `@entropix/core` (shared with web)
- [ ] **Component file(s)**: Create in `src/components/{name}/` or `src/components/{name}.tsx`
- [ ] **Use tokens for all visual values**: `useTheme()` for colors, spacing, radii
- [ ] **Map accessibility**: Use `mapAccessibilityToRN(propGetterReturn.accessibility)`
- [ ] **Use Pressable for interactive elements**: Not TouchableOpacity (deprecated pattern)
- [ ] **Wrap string children in Text**: RN requires this
- [ ] **Export**: Add component and type exports to `src/index.ts`
- [ ] **No keyboard handler needed**: RN handles keyboard navigation natively
- [ ] **Test with screen readers**: VoiceOver (iOS) and TalkBack (Android)

---

## 8. Compound Components in RN

The compound component pattern works the same as web -- React Context is platform-agnostic.

```tsx
// dialog.tsx (root)
export function Dialog({ children, ...opts }: DialogProps) {
  const dialog = useDialog(opts);
  return <DialogContext.Provider value={dialog}>{children}</DialogContext.Provider>;
}

// dialog-content.tsx (sub-component)
export function DialogContent({ children }: DialogContentProps) {
  const { isOpen, close } = useDialogContext();

  // In RN, use <Modal> instead of createPortal
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <View style={styles.content}>{children}</View>
      </View>
    </Modal>
  );
}
```

Key differences from web:
- Use `<Modal>` instead of `createPortal()` -- no SSR concerns
- No focus trap hook needed -- `<Modal>` handles focus containment
- `onRequestClose` handles Android back button

---

## 9. Style Pattern: Variant and Size Functions

Instead of CSS modifier classes, use helper functions that return `ViewStyle` objects:

```tsx
function getVariantStyle(variant: ButtonVariant, t: Record<string, unknown>): ViewStyle {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: t.entropixButtonPrimaryBg as string,
        borderWidth: 1,
        borderColor: t.entropixButtonPrimaryBorder as string,
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "transparent",
      };
    // ... other variants
  }
}
```

Then compose with style arrays:

```tsx
<Pressable style={[baseStyle, sizeStyles.container, variantStyles, style]}>
```

Style arrays are RN's equivalent of CSS cascade. Later items override earlier ones, and falsy values are ignored.

---

## 10. Common Patterns

**Disabled state opacity:**
```tsx
isInactive && { opacity: 0.5 }
```

**Platform-specific code (when needed):**
```tsx
import { Platform } from "react-native";

const shadowStyle = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  android: { elevation: 4 },
});
```

**Text must always be inside Text:**
```tsx
// WRONG - will crash
<View>Hello</View>

// CORRECT
<View><Text>Hello</Text></View>

// The Button component handles this automatically:
{typeof children === "string" ? <Text style={...}>{children}</Text> : children}
```
