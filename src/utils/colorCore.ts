/**
 * Color parsing and manipulation utilities.
 * Self-developed replacement for d3-color.
 */

export interface RGBColor {
  r: number;
  g: number;
  b: number;
  opacity: number;
  brighter(k?: number): RGBColor;
  darker(k?: number): RGBColor;
  formatHex(): string;
  toString(): string;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function hex2(v: number): string {
  const s = clamp(Math.round(v), 0, 255).toString(16);
  return s.length < 2 ? `0${s}` : s;
}

function createRGB(r: number, g: number, b: number, opacity = 1): RGBColor {
  const self: RGBColor = {
    r,
    g,
    b,
    opacity,
    brighter(k = 1) {
      const t = 0.7 ** k;
      return createRGB(self.r / t, self.g / t, self.b / t, self.opacity);
    },
    darker(k = 1) {
      const t = 0.7 ** k;
      return createRGB(self.r * t, self.g * t, self.b * t, self.opacity);
    },
    formatHex() {
      return `#${hex2(self.r)}${hex2(self.g)}${hex2(self.b)}`;
    },
    toString() {
      const a = self.opacity;
      if (a < 1) {
        return `rgba(${clamp(Math.round(self.r), 0, 255)}, ${clamp(Math.round(self.g), 0, 255)}, ${clamp(Math.round(self.b), 0, 255)}, ${a})`;
      }
      return `rgb(${clamp(Math.round(self.r), 0, 255)}, ${clamp(Math.round(self.g), 0, 255)}, ${clamp(Math.round(self.b), 0, 255)})`;
    },
  };
  return self;
}

// Named CSS colors (subset covering common use)
const NAMED_COLORS: Record<string, [number, number, number]> = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  red: [255, 0, 0],
  green: [0, 128, 0],
  blue: [0, 0, 255],
  yellow: [255, 255, 0],
  cyan: [0, 255, 255],
  magenta: [255, 0, 255],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  orange: [255, 165, 0],
  purple: [128, 0, 128],
  pink: [255, 192, 203],
  brown: [165, 42, 42],
  lime: [0, 255, 0],
  navy: [0, 0, 128],
  teal: [0, 128, 128],
  olive: [128, 128, 0],
  maroon: [128, 0, 0],
  aqua: [0, 255, 255],
  silver: [192, 192, 192],
  fuchsia: [255, 0, 255],
  transparent: [0, 0, 0],
};

/**
 * Convert HSL to RGB. h, s, l are all in [0, 1].
 * Returns [r, g, b] with values in [0, 255].
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number): number => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

/**
 * Parse a CSS color string (hex, rgb, rgba, hsl, hsla, named) into an RGBColor.
 * Returns null if the string cannot be parsed.
 */
export function color(specifier: string): RGBColor | null {
  if (!specifier || typeof specifier !== "string") return null;
  const s = specifier.trim().toLowerCase();

  // Named colors
  if (NAMED_COLORS[s]) {
    const [r, g, b] = NAMED_COLORS[s];
    return createRGB(r, g, b, s === "transparent" ? 0 : 1);
  }

  // #RGB
  if (/^#[0-9a-f]{3}$/i.test(s)) {
    const r = parseInt(s[1] + s[1], 16);
    const g = parseInt(s[2] + s[2], 16);
    const b = parseInt(s[3] + s[3], 16);
    return createRGB(r, g, b);
  }

  // #RRGGBB
  if (/^#[0-9a-f]{6}$/i.test(s)) {
    const r = parseInt(s.slice(1, 3), 16);
    const g = parseInt(s.slice(3, 5), 16);
    const b = parseInt(s.slice(5, 7), 16);
    return createRGB(r, g, b);
  }

  // #RRGGBBAA
  if (/^#[0-9a-f]{8}$/i.test(s)) {
    const r = parseInt(s.slice(1, 3), 16);
    const g = parseInt(s.slice(3, 5), 16);
    const b = parseInt(s.slice(5, 7), 16);
    const a = parseInt(s.slice(7, 9), 16) / 255;
    return createRGB(r, g, b, a);
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = s.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/,
  );
  if (rgbMatch) {
    return createRGB(
      +rgbMatch[1],
      +rgbMatch[2],
      +rgbMatch[3],
      rgbMatch[4] !== undefined ? +rgbMatch[4] : 1,
    );
  }

  // hsl(h, s%, l%) or hsla(h, s%, l%, a)
  const hslMatch = s.match(
    /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+))?\s*\)$/,
  );
  if (hslMatch) {
    const h = +hslMatch[1] / 360;
    const sat = +hslMatch[2] / 100;
    const li = +hslMatch[3] / 100;
    const a = hslMatch[4] !== undefined ? +hslMatch[4] : 1;
    const [r, g, b] = hslToRgb(h, sat, li);
    return createRGB(r, g, b, a);
  }

  return null;
}

/**
 * Interpolate between two CSS color strings.
 * Returns a function that takes t in [0, 1] and returns a CSS color string.
 */
export function interpolate(a: string, b: string): (t: number) => string {
  const ca = color(a);
  const cb = color(b);
  if (!ca || !cb) return () => b;

  return (t: number) => {
    const r = ca.r + (cb.r - ca.r) * t;
    const g = ca.g + (cb.g - ca.g) * t;
    const bv = ca.b + (cb.b - ca.b) * t;
    const o = ca.opacity + (cb.opacity - ca.opacity) * t;
    return createRGB(r, g, bv, o).formatHex();
  };
}
