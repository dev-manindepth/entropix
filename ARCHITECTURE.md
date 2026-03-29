# Entropix Design System -- Architecture

## 1. Project Overview

Entropix is an AI-native cross-platform design system spanning 7 packages and 7 apps in a pnpm monorepo. It serves both web (React) and mobile (React Native) from a shared headless core, following a **headless-core + styled-adapter** architecture inspired by Adobe React Spectrum's layered approach. The AI layer (`@entropix/ai`) adds a component registry, JSON-driven renderer, and generation pipeline on top of the design system primitives.

**Published packages:**

| Package | Version | Purpose |
|---------|---------|---------|
| `@entropix/core` | 2.0.0 | Headless hooks, accessibility primitives, chart math, date utilities, i18n |
| `@entropix/tokens` | 1.0.1 | W3C DTCG design tokens -- CSS variables, JS objects, multi-brand themes |
| `@entropix/react` | 2.0.0 | Web components styled with CSS custom properties |
| `@entropix/react-native` | 2.0.0 | Mobile components with StyleSheet theming |
| `@entropix/data` | 2.0.0 | Web DataTable + Charts (Bar, Line, Area, Pie) |
| `@entropix/data-native` | 2.0.0 | Mobile DataTable + Charts using react-native-svg |
| `@entropix/ai` | 0.0.0 | AI-native layer -- registry, renderer, generation pipeline |

**Internal packages (not published):**

| Package | Purpose |
|---------|---------|
| `@entropix/eslint-config` | Shared ESLint configuration |
| `@entropix/typescript-config` | Shared TypeScript configuration |
| `@entropix/ui` | Internal shared UI utilities |

---

## 2. Monorepo Structure

### Dependency Graph

```
@entropix/core <-- @entropix/react
@entropix/core <-- @entropix/react-native
@entropix/core <-- @entropix/data
@entropix/core <-- @entropix/data-native
@entropix/core <-- @entropix/ai

@entropix/tokens <-- @entropix/react-native
@entropix/tokens <-- @entropix/data-native
```

Web packages (`@entropix/react`, `@entropix/data`) consume tokens via CSS imports at the application level, so there is no hard npm dependency from those packages to `@entropix/tokens`. React Native packages import token JS objects directly, creating a real dependency.

### Directory Layout

```
Entropix/
  apps/
    studio/          # AI-native design studio (Next.js)
    demo/            # Web component showcase (Vite + React)
    demo-mobile/     # React Native component showcase (Expo)
    web/             # Marketing / landing page (Next.js)
    docs/            # Documentation site
    storybook/       # Storybook 10 with Vite builder
    mobile/          # React Native app shell (Expo)
  packages/
    core/            # Headless hooks and utilities
    tokens/          # Design tokens (Style Dictionary)
    react/           # Web components
    react-native/    # Mobile components
    data/            # Web data components (DataTable, Charts)
    data-native/     # Mobile data components
    ai/              # AI layer (registry, renderer, CLI)
    eslint-config/   # Shared lint rules
    typescript-config/ # Shared tsconfig
    ui/              # Internal UI utilities
  scripts/
    verify-treeshake.mjs  # esbuild-based tree-shaking verification
  .changeset/        # Changesets config for versioning
  .github/workflows/ # CI and Publish workflows
  .size-limit.json   # Bundle size budgets
  turbo.json         # Turborepo task definitions
  pnpm-workspace.yaml
```

---

## 3. Three-Layer Architecture

```
+------------------------------------------------------+
|  Layer 3: Styled Components                          |
|  @entropix/react          @entropix/react-native     |
|  @entropix/data           @entropix/data-native      |
|  (DOM + CSS)              (Native Views + StyleSheet) |
+------------------------------------------------------+
|  Layer 2: Design Tokens                              |
|  @entropix/tokens                                    |
|  CSS Variables (web)  .  JS Objects (RN)  .  Types   |
+------------------------------------------------------+
|  Layer 1: Headless Core                              |
|  @entropix/core                                      |
|  Hooks . Accessibility . Keyboard . State . Charts   |
+------------------------------------------------------+
|  AI Layer (orthogonal)                               |
|  @entropix/ai                                        |
|  Registry . Renderer . Generation Pipeline . CLI     |
+------------------------------------------------------+
```

**Layer 1 -- Headless Core:** Platform-agnostic React hooks encapsulating interaction logic, state management, accessibility contracts, and keyboard handling. Zero DOM or React Native dependencies. Chart math and date utilities also live here.

**Layer 2 -- Design Tokens:** W3C DTCG-format JSON tokens compiled by Style Dictionary into CSS custom properties (web) and JS objects (React Native). Supports multiple brands (default, ocean, sunset) and themes (light, dark).

**Layer 3 -- Styled Components:** Platform-specific components that wire hooks to rendering. Web components use CSS classes and `mapAccessibilityToAria()`. RN components use StyleSheet and `mapAccessibilityToRN()`.

**AI Layer:** Sits orthogonally across all three layers. Provides a component registry for AI code generation, a JSON spec renderer (`EntropixRenderer`), and a CLI for scaffolding.

---

## 4. Tech Stack

| Concern | Tool | Why |
|---------|------|-----|
| Monorepo manager | pnpm 9.0 | Strict dependency resolution, disk-efficient via content-addressable store |
| Task orchestrator | Turborepo 2.8 | Dependency-aware parallel builds, remote caching |
| Package bundler | tsup (esbuild) | Fast ESM+CJS dual builds with declaration files, multi-entry support |
| Token compiler | Style Dictionary v4 | W3C DTCG support, custom transforms, multi-platform output |
| CSS minifier | lightningcss | Fastest CSS minification, 20-40% savings |
| Testing (web) | Vitest + @testing-library/react | Fast, ESM-native, compatible with Jest API |
| Testing (RN) | Jest + @testing-library/react-native | Standard RN testing stack |
| Linting | ESLint 9 (flat config) | Shared config via `@entropix/eslint-config` |
| Formatting | Prettier | Consistent code style across all packages |
| Versioning | Changesets | Linked versioning, automated release PRs |
| Bundle analysis | size-limit | Per-package size budgets enforced in CI |
| TypeScript | 5.9.2 | Shared via `@entropix/typescript-config` |
| Storybook | Storybook 10 + Vite | Component playground with a11y addon |

---

## 5. Build System

### Turborepo Task Graph

Defined in `turbo.json`:

| Task | `dependsOn` | Caching | Description |
|------|-------------|---------|-------------|
| `build` | `^build` (upstream deps first) | Outputs: `dist/**`, `.next/**` | Full build of all packages and apps |
| `lint` | `^lint` | Default | Lint with ESLint |
| `check-types` | `^check-types` | Default | TypeScript type checking |
| `test` | `^build` | Default | Tests depend on built packages |
| `dev` | None | Disabled (`cache: false`) | Dev mode, persistent |

When you run `turbo run build`, Turborepo resolves the dependency graph:
1. `@entropix/tokens` builds first (no upstream deps)
2. `@entropix/core` builds next
3. `@entropix/react`, `@entropix/react-native`, `@entropix/data`, `@entropix/data-native`, `@entropix/ai` build in parallel (all depend on core)
4. Apps build last (depend on packages)

### Key Build Commands

```bash
pnpm build               # Build everything (packages + apps)
pnpm build:packages       # Build only packages
pnpm tokens:build         # Build only @entropix/tokens
pnpm test:packages        # Test only packages
pnpm release              # Build packages + changeset publish
pnpm publish:dry          # Dry-run publish to verify package contents
```

---

## 6. CI/CD

Two GitHub Actions workflows in `.github/workflows/`:

### CI (`ci.yml`)

Triggered on push to main and pull requests.

**Job 1: Build & Test** -- runs across a Node 18/20/22 matrix:
- Install pnpm, checkout, `pnpm install --frozen-lockfile`
- `turbo run build --filter='./packages/*'`
- `turbo run lint --filter='./packages/*'`
- `turbo run check-types --filter='./packages/*'`
- `turbo run test --filter='./packages/*'`

**Job 2: Build Apps** -- runs after Build & Test passes (Node 22 only):
- Builds `web` and `demo` apps to verify integration

**Job 3: Publish Dry Run** -- runs on PRs only:
- Builds packages then runs `npm pack --dry-run` for tokens, core, react, react-native
- Validates package contents before merge

### Publish (`publish.yml`)

Triggered on push to main. Uses `changesets/action@v1`:
- Builds all packages, runs tests
- Either creates a "Version Packages" PR (if changesets exist) or publishes to npm (if versions were bumped)
- Environment: `GITHUB_TOKEN` for PR creation, `NPM_TOKEN` for npm publish

---

## 7. Package Versioning

Managed via **Changesets** with linked versioning:

```json
// .changeset/config.json
{
  "linked": [
    ["@entropix/core", "@entropix/react", "@entropix/react-native",
     "@entropix/tokens", "@entropix/data", "@entropix/data-native"]
  ],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@entropix/storybook"]
}
```

All 6 published packages are linked -- when any one bumps, they all bump to the same version. This prevents version drift between tightly-coupled packages. Storybook is excluded from versioning since it is not published.

**Workflow:**
1. Developer runs `pnpm changeset` and describes the change
2. CI detects changeset files and opens a "Version Packages" PR
3. On merge, `changesets/action` runs `pnpm release` to publish to npm

---

## 8. Bundle Size Strategy

### Size Budgets (`.size-limit.json`)

| Entry | Limit | Ignores |
|-------|-------|---------|
| `@entropix/core` (barrel) | 20 KB | react |
| `@entropix/react` (barrel) | 20 KB | react, react-dom, @entropix/core |
| `@entropix/react/button` (single) | 5 KB | react, react-dom, @entropix/core |
| `@entropix/data` (barrel) | 20 KB | react, react-dom, @entropix/core |

Run `pnpm size` to measure, `pnpm size:check` to enforce limits.

### Tree-Shaking Verification

`scripts/verify-treeshake.mjs` uses esbuild to bundle single-component imports and asserts that unrelated code is excluded:
- Importing only `Button` from `@entropix/react` must not include `useDialog`, `useMenu`, `useTabs`, or `useAccordion`
- Importing only `useButton` from `@entropix/core` must not include `computeArcGeometry`, `computeBarGeometry`, or `useTable`

All packages use `"sideEffects": false` (or `["**/*.css"]` for CSS-containing packages) to enable bundler tree-shaking.

---

## 9. Development Workflow

### Adding a New Component (e.g., "Slider")

1. **Core hook** -- Create `packages/core/src/hooks/use-slider.ts` with state, accessibility props, keyboard config
2. **Types** -- Add any new types to `packages/core/src/types/`
3. **Tests** -- Add `packages/core/src/__tests__/hooks/use-slider.test.ts`
4. **React component** -- Create `packages/react/src/slider/` with `Slider.tsx` + `slider.css`
5. **React Native component** -- Create `packages/react-native/src/slider/Slider.tsx`
6. **CSS** -- Style using `--entropix-*` custom properties from tokens
7. **Storybook story** -- Add `apps/storybook/stories/Slider.stories.tsx`
8. **Exports** -- Add to `index.ts` barrels and `tsup.config.ts` entry points in core and react
9. **Package exports** -- Add subpath export to `package.json` (e.g., `"./hooks/use-slider"`)
10. **Changeset** -- Run `pnpm changeset` to describe the addition

---

## 10. Apps

| App | Framework | Purpose |
|-----|-----------|---------|
| `studio` | Next.js | AI-native design studio -- visual spec builder, preview, code export |
| `demo` | Vite + React | Interactive component showcase for web components |
| `demo-mobile` | Expo | React Native component showcase |
| `web` | Next.js | Marketing site and landing page |
| `docs` | Vite | Documentation site |
| `storybook` | Storybook 10 + Vite | Component playground with a11y addon, CSF3 with autodocs |
| `mobile` | Expo | Full React Native app shell |

---

## 11. Design Principles

1. **Headless first** -- All interaction logic lives in platform-agnostic hooks. Components are thin wrappers.
2. **Platform-agnostic core** -- `@entropix/core` has zero DOM and zero React Native imports. It produces `PropGetterReturn` objects that platform adapters translate.
3. **CSS custom properties over CSS-in-JS** -- Zero runtime cost, SSR-friendly, brand switching via `data-*` attribute swap. No Emotion, styled-components, or Stitches.
4. **Prop-getter pattern** -- Hooks return functions like `getButtonProps()` that produce accessibility + keyboard + action bundles. Consumers spread these onto their elements.
5. **Accessibility-first** -- Every interactive component starts with WAI-ARIA roles, states, and keyboard interactions. The `AccessibilityProps` type is the contract between core and platform layers.
6. **Multi-entry builds** -- Every hook and component is importable individually (`@entropix/core/hooks/use-button`, `@entropix/react/button`) for minimal bundles.
7. **Zero external dependencies for charts** -- Custom scale, tick, and geometry functions (~468 lines) instead of D3 (~500KB).
8. **W3C DTCG tokens** -- Industry-standard token format with Style Dictionary compilation. Tokens are the source of truth for all visual properties.

---

## 12. Key File Paths

| What | Path |
|------|------|
| Turborepo config | `turbo.json` |
| pnpm workspace | `pnpm-workspace.yaml` |
| Root package.json (scripts, devDeps) | `package.json` |
| Changesets config | `.changeset/config.json` |
| Size budgets | `.size-limit.json` |
| Tree-shake verification | `scripts/verify-treeshake.mjs` |
| CI workflow | `.github/workflows/ci.yml` |
| Publish workflow | `.github/workflows/publish.yml` |
| Core hooks | `packages/core/src/hooks/` |
| Core types | `packages/core/src/types/` |
| Core utilities | `packages/core/src/utils/` |
| Chart math | `packages/core/src/utils/chart/` |
| i18n | `packages/core/src/i18n/` |
| Token sources | `packages/tokens/src/` |
| Token build script | `packages/tokens/build.ts` |
| Brand overrides | `packages/tokens/src/brands/{ocean,sunset}/` |
| Web components | `packages/react/src/` |
| RN components | `packages/react-native/src/` |
| AI layer | `packages/ai/src/` |
| Storybook stories | `apps/storybook/stories/` |
