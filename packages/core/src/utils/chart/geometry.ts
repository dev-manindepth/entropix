import type {
  NormalizedSeries,
  BarRect,
  LinePoint,
  ArcSlice,
  LinearScale,
  BandScale,
} from "../../types/chart.js";

// ─── Bar Geometry ────────────────────────────────────────────────────────────

export function computeBarGeometry(
  series: NormalizedSeries[],
  xScale: BandScale,
  yScale: LinearScale,
  chartHeight: number,
  stacked = false,
): BarRect[] {
  const rects: BarRect[] = [];
  const bandwidth = xScale.bandwidth();
  const categories = xScale.domain();
  const seriesCount = series.length;

  if (stacked) {
    for (let catIdx = 0; catIdx < categories.length; catIdx++) {
      const label = categories[catIdx]!;
      let yOffset = 0;

      for (let sIdx = 0; sIdx < seriesCount; sIdx++) {
        const s = series[sIdx]!;
        const point = s.data.find((d) => d.label === label);
        const value = point?.value ?? 0;
        const barHeight = Math.abs(yScale(0) - yScale(value));
        const x = xScale(label);
        const y = yScale(yOffset + value);

        rects.push({
          x,
          y,
          width: bandwidth,
          height: barHeight,
          seriesIndex: sIdx,
          dataIndex: catIdx,
          value,
          label,
          color: s.color,
        });

        yOffset += value;
      }
    }
  } else {
    const barWidth = bandwidth / seriesCount;

    for (let catIdx = 0; catIdx < categories.length; catIdx++) {
      const label = categories[catIdx]!;

      for (let sIdx = 0; sIdx < seriesCount; sIdx++) {
        const s = series[sIdx]!;
        const point = s.data.find((d) => d.label === label);
        const value = point?.value ?? 0;
        const barHeight = Math.abs(yScale(0) - yScale(value));
        const x = xScale(label) + sIdx * barWidth;
        const y = value >= 0 ? yScale(value) : yScale(0);

        rects.push({
          x,
          y,
          width: barWidth,
          height: barHeight,
          seriesIndex: sIdx,
          dataIndex: catIdx,
          value,
          label,
          color: s.color,
        });
      }
    }
  }

  return rects;
}

// ─── Line Geometry ───────────────────────────────────────────────────────────

export function computeLinePoints(
  series: NormalizedSeries,
  xScale: BandScale,
  yScale: LinearScale,
): LinePoint[] {
  const bandwidth = xScale.bandwidth();
  return series.data.map((d) => ({
    x: xScale(d.label) + bandwidth / 2,
    y: yScale(d.value),
    value: d.value,
    label: d.label,
  }));
}

/**
 * Build an SVG path `d` string from line points.
 * If `curved` is true, uses a monotone cubic spline interpolation.
 */
export function describeLinePath(
  points: LinePoint[],
  curved = false,
): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;

  if (!curved) {
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  }

  // Monotone cubic spline (simplified Catmull-Rom)
  let d = `M ${points[0]!.x} ${points[0]!.y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)]!;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

/**
 * Build a closed area path: line path + baseline back to create a filled area.
 */
export function describeAreaPath(
  points: LinePoint[],
  baselineY: number,
  curved = false,
): string {
  if (points.length === 0) return "";

  const linePath = describeLinePath(points, curved);
  const lastPoint = points[points.length - 1]!;
  const firstPoint = points[0]!;

  return `${linePath} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`;
}

// ─── Arc/Pie Geometry ────────────────────────────────────────────────────────

export function computeArcGeometry(
  data: { label: string; value: number; color: string }[],
  outerRadius: number,
  innerRadiusRatio = 0,
): ArcSlice[] {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return [];

  const innerRadius = outerRadius * innerRadiusRatio;
  const slices: ArcSlice[] = [];
  let currentAngle = -Math.PI / 2; // Start at top

  for (const d of data) {
    const percentage = d.value / total;
    const sliceAngle = percentage * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const path = describeArc(
      0,
      0,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
    );

    slices.push({
      startAngle,
      endAngle,
      innerRadius,
      outerRadius,
      value: d.value,
      label: d.label,
      percentage,
      color: d.color,
      path,
    });

    currentAngle = endAngle;
  }

  return slices;
}

/**
 * Build an SVG arc path for a pie/donut slice.
 */
function describeArc(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const cos = Math.cos;
  const sin = Math.sin;

  const outerStartX = cx + outerRadius * cos(startAngle);
  const outerStartY = cy + outerRadius * sin(startAngle);
  const outerEndX = cx + outerRadius * cos(endAngle);
  const outerEndY = cy + outerRadius * sin(endAngle);

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  if (innerRadius === 0) {
    // Pie slice (triangle to arc)
    return [
      `M ${cx} ${cy}`,
      `L ${outerStartX} ${outerStartY}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}`,
      "Z",
    ].join(" ");
  }

  // Donut slice (two arcs)
  const innerStartX = cx + innerRadius * cos(startAngle);
  const innerStartY = cy + innerRadius * sin(startAngle);
  const innerEndX = cx + innerRadius * cos(endAngle);
  const innerEndY = cy + innerRadius * sin(endAngle);

  return [
    `M ${outerStartX} ${outerStartY}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}`,
    `L ${innerEndX} ${innerEndY}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStartX} ${innerStartY}`,
    "Z",
  ].join(" ");
}
