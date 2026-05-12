/**
 * Color interpolation schemes.
 * Self-developed replacements for d3-interpolate color schemes.
 *
 * interpolateRainbow: HSL-based rainbow cycle (d3 Cubehelix-based rainbow)
 * interpolateSpectral: diverging red-yellow-green-blue color scheme
 * shuffler: Fisher-Yates shuffle factory
 */

// d3's interpolateSpectral uses 11 key colors
const SPECTRAL_COLORS: [number, number, number][] = [
  [158, 1, 66],
  [213, 62, 79],
  [244, 109, 67],
  [253, 174, 97],
  [254, 224, 139],
  [255, 255, 191],
  [230, 245, 152],
  [171, 221, 164],
  [102, 194, 165],
  [50, 136, 189],
  [94, 79, 162],
];

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bv = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bv})`;
}

/**
 * Spectral diverging color scheme interpolator.
 * Maps t ∈ [0, 1] to a color string.
 */
export function interpolateSpectral(t: number): string {
  const tc = Math.max(0, Math.min(1, t));
  const n = SPECTRAL_COLORS.length - 1;
  const i = tc * n;
  const lo = Math.floor(i);
  const hi = Math.min(lo + 1, n);
  const f = i - lo;
  return lerpColor(SPECTRAL_COLORS[lo], SPECTRAL_COLORS[hi], f);
}

/**
 * Rainbow color scheme interpolator using HSL color space.
 * Maps t ∈ [0, 1] to a CSS color string.
 * Approximates d3's cubehelix rainbow.
 */
export function interpolateRainbow(t: number): string {
  const tc = Math.max(0, Math.min(1, t));
  // d3's rainbow uses a cubehelix rainbow. We approximate with HSL for visual similarity.
  // The key property: full hue rotation with varying saturation/lightness
  const h = (360 * tc + 150) % 360; // offset to start at warm colors like d3
  const s = 100;
  const l = 50;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Creates a Fisher-Yates shuffle function that uses the provided random source.
 * Returns a function that shuffles an array in place and returns it.
 */
export function shuffler(random: () => number): <T>(array: T[]) => T[] {
  return <T>(array: T[]): T[] => {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  };
}
