import type { LinearScale, BandScale } from "../../types/chart.js";
import { generateLinearTicks } from "./ticks.js";

/**
 * Creates a linear scale mapping numeric values from domain to pixel range.
 * Used for Y axes in bar/line/area charts.
 */
export function createLinearScale(
  domain: [number, number],
  range: [number, number],
): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const domainSpan = d1 - d0 || 1;
  const rangeSpan = r1 - r0;

  const scale = ((value: number): number => {
    return r0 + ((value - d0) / domainSpan) * rangeSpan;
  }) as LinearScale;

  scale.ticks = (count = 5) => generateLinearTicks(d0, d1, count);
  scale.domain = () => [d0, d1];
  scale.range = () => [r0, r1];

  return scale;
}

/**
 * Creates a band scale mapping category names to pixel positions.
 * Used for X axes in bar/line charts.
 */
export function createBandScale(
  domain: string[],
  range: [number, number],
  padding = 0.2,
): BandScale {
  const [r0, r1] = range;
  const n = domain.length || 1;
  const totalRange = r1 - r0;
  const step = totalRange / n;
  const bandWidth = step * (1 - padding);
  const offset = (step - bandWidth) / 2;

  const scale = ((value: string): number => {
    const index = domain.indexOf(value);
    if (index === -1) return r0;
    return r0 + index * step + offset;
  }) as BandScale;

  scale.bandwidth = () => bandWidth;
  scale.step = () => step;
  scale.domain = () => domain;
  scale.range = () => [r0, r1];

  return scale;
}
