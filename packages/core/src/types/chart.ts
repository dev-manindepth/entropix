// ─── Data Input Types ────────────────────────────────────────────────────────

export interface ChartDataPoint {
  /** X-axis category label */
  label: string;
  /** Numeric value */
  value: number;
}

export interface ChartSeries {
  /** Series name (used in legend/tooltip) */
  name: string;
  /** Data points */
  data: ChartDataPoint[];
  /** Optional color override for this series */
  color?: string;
}

/** Single-series shorthand or multi-series array */
export type ChartData = ChartSeries[] | ChartDataPoint[];

// ─── Normalized Internal Types ───────────────────────────────────────────────

export interface NormalizedSeries {
  name: string;
  data: { label: string; value: number }[];
  color: string;
}

// ─── Geometry Output Types ───────────────────────────────────────────────────

export interface BarRect {
  x: number;
  y: number;
  width: number;
  height: number;
  seriesIndex: number;
  dataIndex: number;
  value: number;
  label: string;
  color: string;
}

export interface LinePoint {
  x: number;
  y: number;
  value: number;
  label: string;
}

export interface ArcSlice {
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number;
  label: string;
  percentage: number;
  color: string;
  path: string;
}

// ─── Configuration Types ─────────────────────────────────────────────────────

export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface AxisConfig {
  show?: boolean;
  tickCount?: number;
  formatter?: (value: number | string) => string;
  label?: string;
}

export interface TooltipData {
  x: number;
  y: number;
  series: string;
  label: string;
  value: number;
  color: string;
}

export interface LegendItem {
  name: string;
  color: string;
  active: boolean;
}

// ─── Scale Types ─────────────────────────────────────────────────────────────

export interface LinearScale {
  (value: number): number;
  ticks: (count?: number) => number[];
  domain: () => [number, number];
  range: () => [number, number];
}

export interface BandScale {
  (value: string): number;
  bandwidth: () => number;
  step: () => number;
  domain: () => string[];
  range: () => [number, number];
}
