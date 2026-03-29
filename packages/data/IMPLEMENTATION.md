# @entropix/data -- Implementation Guide

This document teaches you how to think about and write code in the `@entropix/data` package. It covers the architecture of data-heavy components like DataTable and Charts, the SVG rendering pipeline, and how to add new chart types.

---

## 1. How to Think About Data Components

Data components are **heavier** than regular UI components. They involve sorting algorithms, SVG coordinate math, grid layouts, pagination logic, and responsive sizing. They exist as a separate package so that `@entropix/react` stays lightweight -- apps that do not need charts or data tables do not pay the bundle cost.

The package contains two families:

1. **DataTable** -- tabular data with sorting, filtering, pagination, and selection
2. **Charts** -- BarChart, LineChart, AreaChart, PieChart, all rendering to SVG

Both families follow the same pattern as `@entropix/react`: call a core hook, map accessibility, render HTML/SVG with CSS classes.

---

## 2. DataTable -- How Sorting/Filtering/Pagination Works

### Architecture

```
DataTable (root component)
  calls useTable() from @entropix/core
  provides DataTableContext to children
  renders <table> with aria props

State managed by useTable():
  - sortState: [{ columnKey: string, direction: "asc" | "desc" }]
  - filterState: Record<string, string>
  - page: number
  - selectedKeys: Set<string>
```

### The State Flow

```
User clicks column header
  -> toggleSort(columnKey)
  -> sortState updates: [{ columnKey: "name", direction: "asc" }]
  -> paginatedRows recomputes:
       1. allRows filtered by filterState
       2. filtered rows sorted by sortState
       3. sorted rows sliced by (page, pageSize)
  -> table re-renders with new row order
```

### How the DataTable Renders

```tsx
export function DataTable<TData>(props: DataTableProps<TData>) {
  const table = useTable<TData>(tableOptions);

  // Context provides table state to any custom sub-components
  const contextValue = { ...table, columns, getRowKey };

  // Get ARIA props from core
  const tableAriaProps = mapA11yToAria(table.getTableProps().accessibility);

  return (
    <DataTableContext.Provider value={contextValue}>
      <div className="entropix-datatable">
        <table {...tableAriaProps}>
          <thead>
            {columns.map((col) => (
              <th
                onClick={() => col.sortable && table.toggleSort(col.key)}
                aria-sort={getSortDir(col.key)}
              >
                {col.header}
              </th>
            ))}
          </thead>
          <tbody>
            {table.paginatedRows.map((row, i) => (
              <tr key={getRowKey(row, i)}>
                {columns.map((col) => (
                  <td>{renderCell ? renderCell(row[col.key], row, col) : row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataTableContext.Provider>
  );
}
```

### Key Features

**Sorting:** Multi-column sort via `sortState` array. `toggleSort(key)` cycles through asc -> desc -> none.

**Filtering:** Per-column text filter. `setFilter(columnKey, value)` updates filter state.

**Pagination:** `page` and `pageSize` slice the sorted/filtered rows. `setPage(n)` navigates.

**Selection:** `selectionMode: "none" | "single" | "multiple"`. Selected row keys tracked in a Set.

**Custom cell rendering:** The `renderCell` prop lets consumers control how each cell displays:

```tsx
<DataTable
  renderCell={(value, row, column) => {
    if (column.key === "status") {
      return <StatusBadge status={value as string} />;
    }
    return String(value);
  }}
/>
```

---

## 3. Charts -- How SVG Rendering Works

### The Data-to-Pixels Pipeline

Every chart follows the same pipeline. Here is BarChart as the example:

```
STEP 1: Input data
  data: [{ label: "Jan", value: 100 }, { label: "Feb", value: 150 }]

STEP 2: normalizeChartData(data, colors)
  Normalizes various input formats into a consistent series structure:
  -> [{ name: "Series 1", color: "var(--chart-series-1)",
        data: [{ label: "Jan", value: 100 }, { label: "Feb", value: 150 }] }]

STEP 3: getDataExtent(series)
  Scans all series to find:
  -> { categories: ["Jan", "Feb"], yMin: 0, yMax: 150 }

STEP 4: niceBounds(yMin, yMax, tickCount)
  Computes "nice" axis bounds (rounded to clean numbers):
  -> { min: 0, max: 160, step: 40 }

STEP 5: createLinearScale([0, 160], [innerHeight, 0])
  Creates a function that maps data values to pixel Y coordinates:
  -> yScale(100) = 112.5  (pixel position)
  Note: Y is inverted because SVG Y=0 is at the top.

STEP 6: createBandScale(["Jan", "Feb"], [0, innerWidth])
  Creates a function that maps category labels to pixel X positions:
  -> xScale("Jan") = { start: 0, center: 50, bandwidth: 100 }

STEP 7: computeBarGeometry(series, xScale, yScale, innerHeight, stacked)
  Computes the rectangle coordinates for every bar:
  -> [{ x: 10, y: 112, width: 80, height: 188, color: "...", label: "Jan", value: 100 },
      { x: 110, y: 56, width: 80, height: 244, color: "...", label: "Feb", value: 150 }]

STEP 8: SVG rendering
  <rect x={10} y={112} width={80} height={188} fill="var(--chart-series-1)" />
```

### SVG Structure

Every chart renders this structure:

```
<div class="entropix-chart">                  (container for tooltip positioning)
  <ChartContainer height={300}>               (responsive SVG wrapper)
    {(width, height) => (                     (render prop gives measured size)
      <g transform="translate(50, 20)">       (margin offset)
        <YAxis />                             (tick marks + grid lines)
        <XAxis />                             (category labels)
        <rect ... /> <rect ... />             (the actual data shapes)
      </g>
    )}
  </ChartContainer>
  <ChartTooltip />                            (positioned absolutely over SVG)
  <ChartLegend />                             (toggle series visibility)
</div>
```

### The ChartContainer

`ChartContainer` is a responsive wrapper that measures its own width:

```tsx
function ChartContainer({ height, children }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <svg width={width} height={height}>
        {width > 0 && children(width, height)}
      </svg>
    </div>
  );
}
```

Charts never have a fixed width. They fill their container and re-render when resized.

### Chart Colors

Colors use CSS custom properties so they adapt to the active brand/theme:

```tsx
export const CSS_CHART_COLORS = [
  "var(--chart-series-1)",  // maps to --entropix-color-action-primary-default
  "var(--chart-series-2)",
  "var(--chart-series-3)",
  // ... up to 8 series
];
```

These variables are defined in `chart.css` and resolve to brand-specific tokens.

### Tooltips

Tooltips are positioned absolutely relative to the chart container (not the SVG). When a user hovers a bar/point:

```tsx
const handleBarEnter = (rect, seriesName, event) => {
  setTooltip({
    x: rect.x + rect.width / 2 + MARGINS.left,  // center of bar + left margin
    y: rect.y + MARGINS.top,                      // top of bar + top margin
    series: seriesName,
    label: rect.label,
    value: rect.value,
    color: rect.color,
  });
};
```

### Legend Toggle

The legend lets users show/hide series:

```tsx
const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

const toggleSeries = (name: string) => {
  setHiddenSeries((prev) => {
    const next = new Set(prev);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });
};

// Filter out hidden series before computing geometry
const visibleSeries = allSeries.filter((s) => !hiddenSeries.has(s.name));
```

---

## 4. How to Add a New Chart Type

Here is a step-by-step guide for adding a hypothetical **RadarChart**.

### Step 1: Add geometry computation to core

Create `computeRadarGeometry()` in `@entropix/core`:

```tsx
// packages/core/src/data/radar.ts
export function computeRadarGeometry(
  series: NormalizedSeries[],
  categories: string[],
  radius: number,
): RadarPoint[][] {
  const angleStep = (2 * Math.PI) / categories.length;

  return series.map((s) =>
    s.data.map((d, i) => {
      const angle = angleStep * i - Math.PI / 2; // start at top
      const r = (d.value / maxValue) * radius;
      return {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        label: d.label,
        value: d.value,
      };
    })
  );
}
```

### Step 2: Create the chart component

```
packages/data/src/components/radar-chart/
  radar-chart.tsx
  index.ts
```

```tsx
// radar-chart.tsx
export function RadarChart({ data, height = 300, ... }: RadarChartProps) {
  const allSeries = normalizeChartData(data, colors ?? CSS_CHART_COLORS);
  const { categories } = getDataExtent(allSeries);
  // ... compute geometry, render SVG polygons
}
```

### Step 3: The SVG rendering

Radar charts use `<polygon>` instead of `<rect>`:

```tsx
const points = radarPoints.map((p) => `${p.x},${p.y}`).join(" ");
<polygon points={points} fill={series.color} fillOpacity={0.2} stroke={series.color} />
```

### Step 4: Add CSS

Create `src/styles/radar-chart.css` and add it to `src/styles/index.css` (if the data package has one) or import it directly in the component.

### Step 5: Export

Add to `src/index.ts`:

```tsx
export { RadarChart } from "./components/radar-chart/index.js";
export type { RadarChartProps } from "./components/radar-chart/index.js";
```

### Step 6: Register in the AI registry

Add the component to `@entropix/ai`'s registry so the AI can generate it (see the AI IMPLEMENTATION.md for details).

---

## 5. DataTable vs Charts: When to Use Which

| Need                        | Use           |
|-----------------------------|---------------|
| Tabular data with sort      | DataTable     |
| Comparing categories        | BarChart      |
| Trends over time            | LineChart     |
| Cumulative trends           | AreaChart     |
| Part-of-whole distribution  | PieChart      |
| Multiple dimensions         | RadarChart    |

---

## 6. CSS for Data Components

Data component styles live in `src/styles/`:

```css
/* data-table.css */
.entropix-datatable { ... }
.entropix-datatable__header { ... }
.entropix-datatable__row--selected { ... }

/* chart.css */
.entropix-chart { position: relative; }
.entropix-chart__bar { transition: opacity 0.15s; }
.entropix-chart__bar:hover { opacity: 0.8; }
.entropix-chart__tooltip { position: absolute; pointer-events: none; }
```

Charts use CSS custom properties for series colors, defined in `chart.css`:

```css
:root {
  --chart-series-1: var(--entropix-color-action-primary-default);
  --chart-series-2: var(--entropix-color-chart-2);
  /* ... */
}
```

This means charts automatically adapt when the brand/theme changes.

---

## 7. Testing Data Components

Data components need two kinds of tests:

1. **Logic tests** (in `@entropix/core`): Test sorting algorithms, scale computations, geometry calculations with pure functions. No DOM needed.

2. **Rendering tests** (in `@entropix/data`): Test that the correct SVG elements are rendered with the right attributes. Use `@testing-library/react` to query for `rect`, `path`, `circle` elements.

```tsx
it("renders correct number of bars", () => {
  const { container } = render(
    <BarChart data={[{ label: "A", value: 10 }, { label: "B", value: 20 }]} />
  );
  const bars = container.querySelectorAll(".entropix-chart__bar");
  expect(bars).toHaveLength(2);
});
```
