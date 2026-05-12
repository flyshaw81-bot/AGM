/**
 * Scale utilities.
 * Self-developed replacement for d3-scale (scaleSequential only).
 */

/**
 * Creates a sequential scale that maps [0, 1] through an interpolator.
 * The returned function accepts a number in [0, 1] and returns the interpolated value.
 */
export function scaleSequential<T>(
  interpolator: (t: number) => T,
): (t: number) => T {
  return (t: number) => interpolator(Math.max(0, Math.min(1, t)));
}
