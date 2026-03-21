// ─── Components ──────────────────────────────────────────────────────────────
export {
  DataTable,
  DataTableContext,
  useDataTableContext,
} from "./components/data-table/index.js";

export type {
  DataTableProps,
  DataTableContextValue,
} from "./components/data-table/index.js";

// ─── Chart Components ────────────────────────────────────────────────────────
export { BarChart } from "./components/bar-chart/index.js";
export type { BarChartProps } from "./components/bar-chart/bar-chart.js";

export { LineChart } from "./components/line-chart/index.js";
export type { LineChartProps } from "./components/line-chart/line-chart.js";

export { AreaChart } from "./components/area-chart/index.js";
export type { AreaChartProps } from "./components/area-chart/area-chart.js";

export { PieChart } from "./components/pie-chart/index.js";
export type { PieChartProps } from "./components/pie-chart/pie-chart.js";

// ─── Re-exported types from @entropix/core ───────────────────────────────────
export type {
  ColumnDef,
  SortState,
  SortDirection,
  UseTableOptions,
  UseTableReturn,
} from "@entropix/core";

// ─── Re-exported chart types from @entropix/core ─────────────────────────────
export type {
  ChartData,
  ChartDataPoint,
  ChartSeries,
  NormalizedSeries,
  BarRect,
  LinePoint,
  ArcSlice,
  ChartMargins,
  AxisConfig,
  TooltipData,
  LegendItem,
  LinearScale,
  BandScale,
} from "@entropix/core";
