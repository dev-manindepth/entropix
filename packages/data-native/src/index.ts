export { DataTable } from "./components/data-table/index.js";
export type { DataTableProps } from "./components/data-table/index.js";
export { useDataTableContext } from "./components/data-table/index.js";
export type { DataTableContextValue } from "./components/data-table/index.js";

// Chart primitives
export {
  ChartContainer,
  XAxis,
  YAxis,
  ChartTooltip,
  ChartLegend,
} from "./components/chart-primitives/index.js";
export type {
  ChartContainerProps,
  XAxisProps,
  YAxisProps,
  ChartTooltipProps,
  ChartLegendProps,
} from "./components/chart-primitives/index.js";

// Chart components
export { BarChart } from "./components/bar-chart/index.js";
export type { BarChartProps } from "./components/bar-chart/index.js";

export { LineChart } from "./components/line-chart/index.js";
export type { LineChartProps } from "./components/line-chart/index.js";

export { AreaChart } from "./components/area-chart/index.js";
export type { AreaChartProps } from "./components/area-chart/index.js";

export { PieChart } from "./components/pie-chart/index.js";
export type { PieChartProps } from "./components/pie-chart/index.js";

// Re-export core types for convenience
export type {
  ColumnDef,
  SortState,
  SortDirection,
  UseTableOptions,
  UseTableReturn,
  ChartData,
  ChartDataPoint,
  ChartSeries,
  TooltipData,
  LegendItem,
  ChartMargins,
} from "@entropix/core";
