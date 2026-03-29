# @entropix/data and @entropix/data-native Architecture

## Purpose

`@entropix/data` (web) and `@entropix/data-native` (React Native) provide data-heavy components: **DataTable** and **Charts** (Bar, Line, Area, Pie). These components consume the same headless hooks and utilities from `@entropix/core` as the base component packages, but are distributed separately to keep the core component bundle lean.

```tsx
// Web
import { DataTable } from "@entropix/data/data-table";
import { BarChart } from "@entropix/data/bar-chart";

// React Native
import { DataTable } from "@entropix/data-native/data-table";
import { BarChart } from "@entropix/data-native/bar-chart";
```

---

## Why a Separate Package

Data visualization and complex table logic carry substantial code weight: scale computation, geometry algorithms, SVG path generation, sorting/filtering/pagination state machines. Bundling this with Button, Input, and Dialog would penalize apps that only need basic UI components.

This is an established pattern in the design system ecosystem:
- Shopify separates Polaris (components) from polaris-viz (charts)
- MUI separates `@mui/material` from `@mui/x-data-grid` and `@mui/x-charts`
- Adobe separates Spectrum components from `@adobe/react-spectrum-charts`

By splitting into `@entropix/data` and `@entropix/data-native`, consumers pay only for what they use. An app with just forms and dialogs never downloads charting code.

---

## DataTable Architecture

### Core Hook: useTable

Both the web and native DataTable components consume `useTable` from `@entropix/core`. The hook manages:
- **Sorting** -- Multi-column sort state (`SortState[]`), with `toggleSort(columnKey)` cycling through asc/desc/none.
- **Filtering** -- Per-column text filters via `columnFilters` map and `setColumnFilter(key, value)`.
- **Pagination** -- Page index, page size, computed `pageCount`, navigation methods (`nextPage`, `previousPage`, `firstPage`, `lastPage`), and boundary flags (`canNextPage`, `canPreviousPage`).
- **Row Selection** -- `selectedKeys` Set, `toggleRowSelection(key)`, `toggleAllSelection()`, `isAllSelected`, `isIndeterminate`. Supports `"none"`, `"single"`, and `"multi"` selection modes.
- **Prop Getters** -- `getTableProps()`, `getHeaderRowProps()`, `getHeaderCellProps(key)`, `getBodyProps()`, `getRowProps(key, index)`, `getCellProps(colKey, rowKey)`. Each returns `{ accessibility: AccessibilityProps, onAction? }`.

### Web DataTable (@entropix/data)

Located at `src/components/data-table/data-table.tsx`. Renders semantic HTML table elements:

```html
<div class="entropix-datatable">
  <table class="entropix-datatable__table">
    <thead>
      <tr class="entropix-datatable__filter-row">...</tr>   <!-- conditional -->
      <tr class="entropix-datatable__tr--header">...</tr>
    </thead>
    <tbody>
      <tr class="entropix-datatable__tr">...</tr>
    </tbody>
  </table>
  <nav class="entropix-datatable__pagination">...</nav>      <!-- conditional -->
</div>
```

Key features:
- **Semantic HTML** -- Uses `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` for full screen reader support.
- **Compound context** -- `DataTableContext` exposes the hook's return value plus columns and `getRowKey` to child components via `DataTableProvider`.
- **Filter row** -- Conditionally rendered when any column has `filterable: true`. Each filterable column gets an `<input>` in the filter row.
- **Sort indicators** -- Clickable `<th>` elements with `data-sort="asc|desc|none"` and keyboard support (Enter/Space to toggle). Sort direction indicators render as unicode triangles.
- **Selection checkboxes** -- "Select all" checkbox in header (multi-mode only) with indeterminate state support via `ref` callback. Per-row checkboxes in the first column.
- **Sticky header** -- Controlled via `stickyHeader` prop, applied as `data-sticky` attribute on `<thead>`.
- **Custom cell rendering** -- `renderCell` prop receives `(value, row, column)` for custom cell content.
- **Built-in pagination** -- Renders automatically when `pageCount > 1`, with first/prev/next/last buttons.
- **Inline ARIA mapping** -- Uses a local `mapA11yToAria()` function (not imported from `@entropix/react`) to avoid a runtime dependency on the base component package.

### Native DataTable (@entropix/data-native)

Located at `src/components/data-table/data-table.tsx`. Uses React Native primitives:
- **FlatList** for the row list -- enables native scroll performance, recycled views, and large dataset support.
- **ScrollView** (horizontal) wrapping the header for tables wider than the screen.
- **Pressable** for sortable headers and selectable rows.
- **TextInput** for column filters.
- **ActivityIndicator** for loading state.
- Imports `useTheme` from `@entropix/react-native` for token-driven styling.
- Uses `mapAccessibilityToRN()` from its own `utils/` (not imported from `@entropix/react-native`).

---

## Chart Architecture

### Pure SVG Rendering

All charts render as pure SVG -- no D3, no Canvas, no external charting library. The core package (`@entropix/core`) provides the math utilities:

| Utility               | Purpose                                            |
|-----------------------|-----------------------------------------------------|
| `normalizeChartData`  | Converts single/multi-series input to uniform format |
| `getDataExtent`       | Computes categories, yMin, yMax from series data     |
| `niceBounds`          | Rounds min/max to human-friendly tick values          |
| `createLinearScale`   | Maps a numeric domain to a pixel range               |
| `createBandScale`     | Maps categorical labels to evenly-spaced pixel bands |
| `computeBarGeometry`  | Returns `BarRect[]` with x, y, width, height, color  |
| `computeLinePoints`   | Returns point arrays for line/area paths             |
| `computePieSlices`    | Returns arc paths with start/end angles              |

The component packages only handle rendering (SVG elements on web, `react-native-svg` on native) and user interaction (tooltips, legend toggling).

### Chart Primitives

Both `@entropix/data` and `@entropix/data-native` share a set of chart primitive components in `src/components/chart-primitives/`:

| Primitive        | Web Implementation           | Native Implementation         |
|------------------|------------------------------|-------------------------------|
| ChartContainer   | `<div>` + ResizeObserver     | `<View>` + `onLayout`        |
| XAxis            | SVG `<g>` with `<text>`      | `react-native-svg` G + Text  |
| YAxis            | SVG `<g>` with `<line>/<text>` | `react-native-svg` G + Line + Text |
| ChartTooltip     | Absolutely positioned `<div>` | Absolutely positioned `<View>` |
| ChartLegend      | `<div>` with clickable spans  | `<View>` with Pressable items |

### ChartContainer (Web)

Located at `src/components/chart-primitives/chart-container.tsx`. Uses a render-function-as-children pattern:

```tsx
<ChartContainer height={300}>
  {(width, height) => (
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      {/* axes, bars, lines, etc. */}
    </g>
  )}
</ChartContainer>
```

Wraps content in a `<div>` with a `ResizeObserver` that tracks container width. Renders an `<svg>` only when width > 0 (prevents zero-width initial render). The render function receives the measured `(width, height)` so charts can compute scales responsively.

### Chart Components

Each chart (BarChart, LineChart, AreaChart, PieChart) follows the same structure:

1. Normalize input data via `normalizeChartData()`.
2. Filter out hidden series (toggled off via legend).
3. Compute data extent and nice bounds.
4. Create scales (linear for values, band for categories).
5. Compute geometry (bars, line points, arc paths).
6. Render inside `<ChartContainer>` with axes, grid, data elements, tooltip, and legend.

All charts support:
- **Tooltip** -- Hover-activated (web) or press-activated (native) data point info.
- **Legend** -- Interactive series toggling. Clicking a legend item hides/shows that series.
- **Custom colors** -- Override the default palette via the `colors` prop.
- **Axis configuration** -- `xAxis` and `yAxis` props control visibility, tick count, and formatters.

---

## Chart Data Format

Charts accept a `ChartData` type that supports both single-series and multi-series input:

### Single Series

```ts
const data = [
  { label: "Jan", value: 100 },
  { label: "Feb", value: 200 },
  { label: "Mar", value: 150 },
];
```

### Multi-Series

```ts
const data = [
  {
    name: "Revenue",
    data: [
      { label: "Q1", value: 400 },
      { label: "Q2", value: 500 },
    ],
  },
  {
    name: "Expenses",
    data: [
      { label: "Q1", value: 300 },
      { label: "Q2", value: 350 },
    ],
  },
];
```

Why this format over Chart.js-style `{ labels: [...], datasets: [...] }`:
- **Simpler.** Each series is self-contained with its own labels. No parallel-array coupling between labels and datasets.
- **Flexible.** Series can have different label sets (useful for sparse data).
- **Type-safe.** The `{label, value}` tuple is easier to type than index-correlated arrays.
- **Single-series convenience.** Passing a flat array of `{label, value}` objects is natural for simple charts -- no need to wrap in a `datasets` array.

`normalizeChartData()` handles the conversion, wrapping single-series input into the multi-series format with a default series name.

---

## Brand-Aware Colors

### Web (@entropix/data)

Charts use CSS custom properties for series colors. The `CSS_CHART_COLORS` array in `src/utils/chart-colors.ts` references `var(--chart-series-1)` through `var(--chart-series-8)`.

These CSS variables are defined in `chart.css` and map to design tokens:
- `--chart-series-1` maps to `--entropix-color-action-primary-default` (the brand's primary color)
- `--chart-series-2` through `--chart-series-8` map to a coordinated palette

When the active brand changes (e.g., from default to "ocean"), the underlying token values change, and chart colors update automatically via CSS cascade -- no re-render needed.

### Native (@entropix/data-native)

React Native cannot use CSS custom properties. Instead, the `useChartColors()` hook in `src/utils/use-chart-colors.ts` reads the brand's primary action color from the theme context:

```tsx
const { tokens } = useTheme();
const primaryColor = tokens.entropixColorActionPrimaryDefault;
return [primaryColor, ...DEFAULT_CHART_COLORS.slice(1)];
```

The first series color always matches the active brand's primary color. If custom colors are provided via the `colors` prop, they are used as-is, bypassing theme integration.

---

## @entropix/data-native

The native data package mirrors the web package but uses `react-native-svg` for chart rendering. This is the only external dependency beyond React Native itself.

### SVG Elements Used

| react-native-svg | Purpose                            |
|-------------------|------------------------------------|
| `Svg`             | Root SVG container                 |
| `G`               | Group element for transforms       |
| `Rect`            | Bar chart bars                     |
| `Path`            | Line, area, and pie arc paths      |
| `Circle`          | Data point markers on line charts  |
| `Line`            | Grid lines, axis ticks             |
| `Text`            | Axis labels, tick values           |

### Native DataTable

Uses `FlatList` instead of `<table>` for native scrolling behavior:
- Horizontal `ScrollView` for wide tables.
- `FlatList` for vertical scrolling with row recycling.
- `Pressable` for interactive headers and rows.
- `useTheme()` for token-driven colors, spacing, and typography.

### Dependencies

- `react-native-svg` -- Peer dependency (the only non-RN external dep).
- `@entropix/core` -- Headless hooks and chart math.
- `@entropix/tokens` -- Token values (via `@entropix/react-native`'s theme).
- `@entropix/react-native` -- `useTheme()` for token access.

---

## CSS (Web Only)

`@entropix/data` ships 2 CSS files in `src/styles/`:

| File             | Covers                                                      |
|------------------|-------------------------------------------------------------|
| `data-table.css` | Table layout, header, body, rows, cells, sorting indicators, filter inputs, pagination, selection checkboxes, empty/loading states, sticky header |
| `chart.css`      | Chart container, SVG sizing, bar hover effects, series color custom properties (`--chart-series-1` through `--chart-series-8`), tooltip panel, legend items, grid line styles |

Both files follow the same BEM naming convention as `@entropix/react`: `.entropix-datatable__*`, `.entropix-chart__*`.

CSS custom properties reference design tokens for all visual values. `package.json` declares `"sideEffects": ["**/*.css"]` for correct tree-shaking.

CSS minification runs via the same `scripts/minify-css.js` Lightning CSS script used by `@entropix/react`.

---

## Multi-Entry Build

Both packages use tsup with 6 entry points each:

### @entropix/data

```ts
{
  index: "src/index.ts",
  "data-table": "src/components/data-table/index.ts",
  "bar-chart": "src/components/bar-chart/index.ts",
  "line-chart": "src/components/line-chart/index.ts",
  "area-chart": "src/components/area-chart/index.ts",
  "pie-chart": "src/components/pie-chart/index.ts",
}
```

Externals: `react`, `react-dom`, `@entropix/core`.

### @entropix/data-native

```ts
{
  index: "src/index.ts",
  "data-table": "src/components/data-table/data-table.tsx",
  "bar-chart": "src/components/bar-chart/index.ts",
  "line-chart": "src/components/line-chart/index.ts",
  "area-chart": "src/components/area-chart/index.ts",
  "pie-chart": "src/components/pie-chart/index.ts",
}
```

Externals: `react`, `react-native`, `@entropix/core`, `@entropix/tokens`, `@entropix/react-native`.

Both produce ESM + CJS output with declaration files, source maps, and code splitting enabled. Consumers can deep-import individual chart types:

```ts
import { BarChart } from "@entropix/data/bar-chart";     // only bar chart code
import { PieChart } from "@entropix/data/pie-chart";     // only pie chart code
```

---

## File Structure

### @entropix/data (web)

```
packages/data/
  src/
    index.ts                            # barrel re-export
    components/
      data-table/
        index.ts
        data-table.tsx                  # DataTable component (HTML <table>)
        data-table-context.tsx          # DataTableContext + provider
      bar-chart/
        index.ts
        bar-chart.tsx                   # BarChart (grouped + stacked)
      line-chart/
        index.ts
        line-chart.tsx                  # LineChart
      area-chart/
        index.ts
        area-chart.tsx                  # AreaChart (filled line)
      pie-chart/
        index.ts
        pie-chart.tsx                   # PieChart (donut support)
      chart-primitives/
        index.ts
        chart-container.tsx             # ResizeObserver + SVG wrapper
        x-axis.tsx                      # Categorical axis
        y-axis.tsx                      # Numeric axis + grid lines
        chart-tooltip.tsx               # Hover tooltip panel
        chart-legend.tsx                # Interactive series legend
    utils/
      chart-colors.ts                   # CSS_CHART_COLORS (var(--chart-series-N))
    styles/
      data-table.css                    # DataTable styling
      chart.css                         # Chart styling + series color vars
    __tests__/
      ...
  tsup.config.ts                        # 6 entry points + CSS minification
  package.json                          # sideEffects: ["**/*.css"]
```

### @entropix/data-native

```
packages/data-native/
  src/
    index.ts                            # barrel re-export
    components/
      data-table/
        index.ts
        data-table.tsx                  # DataTable (FlatList-based)
        data-table-context.tsx          # DataTableContext + provider
      bar-chart/
        index.ts
        bar-chart.tsx                   # BarChart (react-native-svg Rect)
      line-chart/
        index.ts
        line-chart.tsx                  # LineChart (react-native-svg Path)
      area-chart/
        index.ts
        area-chart.tsx                  # AreaChart (react-native-svg Path)
      pie-chart/
        index.ts
        pie-chart.tsx                   # PieChart (react-native-svg Path)
      chart-primitives/
        index.ts
        chart-container.tsx             # onLayout + Svg wrapper
        x-axis.tsx                      # react-native-svg Text labels
        y-axis.tsx                      # react-native-svg Line + Text
        chart-tooltip.tsx               # Absolutely positioned View
        chart-legend.tsx                # Pressable legend items
    utils/
      map-accessibility-to-rn.ts        # Local RN a11y mapper
      types.ts                          # RNAccessibilityProps type
      use-chart-colors.ts              # Theme-aware color palette hook
    __tests__/
      ...
  tsup.config.ts                        # 6 entry points, no CSS
  package.json                          # sideEffects: false
```
