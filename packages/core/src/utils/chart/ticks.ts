/**
 * Compute a "nice" step size for tick marks.
 */
function niceNum(value: number, round: boolean): number {
  const exp = Math.floor(Math.log10(value));
  const frac = value / Math.pow(10, exp);
  let nice: number;

  if (round) {
    if (frac < 1.5) nice = 1;
    else if (frac < 3) nice = 2;
    else if (frac < 7) nice = 5;
    else nice = 10;
  } else {
    if (frac <= 1) nice = 1;
    else if (frac <= 2) nice = 2;
    else if (frac <= 5) nice = 5;
    else nice = 10;
  }

  return nice * Math.pow(10, exp);
}

/**
 * Expand min/max to "nice" round numbers for axis display.
 */
export function niceBounds(
  min: number,
  max: number,
  tickCount = 5,
): { min: number; max: number; step: number } {
  if (min === max) {
    return { min: min - 1, max: max + 1, step: 1 };
  }

  const range = niceNum(max - min, false);
  const step = niceNum(range / (tickCount - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;

  return { min: niceMin, max: niceMax, step };
}

/**
 * Generate evenly spaced "nice" tick values between min and max.
 */
export function generateLinearTicks(
  min: number,
  max: number,
  count = 5,
): number[] {
  const bounds = niceBounds(min, max, count);
  const ticks: number[] = [];

  for (let v = bounds.min; v <= bounds.max + bounds.step * 0.5; v += bounds.step) {
    ticks.push(Math.round(v * 1e10) / 1e10); // avoid floating point noise
  }

  return ticks;
}
