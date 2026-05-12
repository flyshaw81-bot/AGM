/**
 * Statistical and array utility functions.
 * Self-developed replacements for d3-array functions.
 * All functions support an optional accessor for mapping values.
 */

type Accessor<T, R> = (
  d: T,
  i: number,
  data: Iterable<T>,
) => R | undefined | null;
type NumberAccessor<T> = Accessor<T, number>;

/**
 * Returns the arithmetic mean of the given iterable of numbers.
 * With an accessor, maps values first and ignores undefined/NaN.
 */
export function mean<T = number>(
  data: Iterable<T>,
  accessor?: NumberAccessor<T>,
): number | undefined {
  let count = 0;
  let total = 0;
  const arr = Array.isArray(data) ? data : Array.from(data);

  if (accessor) {
    for (let i = 0; i < arr.length; i++) {
      const v = accessor(arr[i], i, arr);
      if (v != null && !Number.isNaN(+v)) {
        total += +v;
        count++;
      }
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i] as unknown as number;
      if (v != null && !Number.isNaN(+v)) {
        total += +v;
        count++;
      }
    }
  }

  return count > 0 ? total / count : undefined;
}

/**
 * Returns the maximum value from the given iterable.
 * With an accessor, maps values first.
 */
export function max<T>(
  data: Iterable<T>,
  accessor?: NumberAccessor<T>,
): number | undefined {
  let result: number | undefined;
  const arr = Array.isArray(data) ? data : Array.from(data);

  if (accessor) {
    for (let i = 0; i < arr.length; i++) {
      const v = accessor(arr[i], i, arr);
      if (
        v != null &&
        !Number.isNaN(+v) &&
        (result === undefined || +v > result)
      ) {
        result = +v;
      }
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i] as unknown as number;
      if (
        v != null &&
        !Number.isNaN(+v) &&
        (result === undefined || +v > result)
      ) {
        result = +v;
      }
    }
  }

  return result;
}

/**
 * Returns the minimum value from the given iterable.
 * With an accessor, maps values first.
 */
export function min<T>(
  data: Iterable<T>,
  accessor?: NumberAccessor<T>,
): number | undefined {
  let result: number | undefined;
  const arr = Array.isArray(data) ? data : Array.from(data);

  if (accessor) {
    for (let i = 0; i < arr.length; i++) {
      const v = accessor(arr[i], i, arr);
      if (
        v != null &&
        !Number.isNaN(+v) &&
        (result === undefined || +v < result)
      ) {
        result = +v;
      }
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i] as unknown as number;
      if (
        v != null &&
        !Number.isNaN(+v) &&
        (result === undefined || +v < result)
      ) {
        result = +v;
      }
    }
  }

  return result;
}

/**
 * Returns the median of the given iterable of numbers.
 * Ignores undefined/NaN values.
 */
export function median<T = number>(
  data: Iterable<T>,
  accessor?: NumberAccessor<T>,
): number | undefined {
  const values: number[] = [];
  const arr = Array.isArray(data) ? data : Array.from(data);

  if (accessor) {
    for (let i = 0; i < arr.length; i++) {
      const v = accessor(arr[i], i, arr);
      if (v != null && !Number.isNaN(+v)) values.push(+v);
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i] as unknown as number;
      if (v != null && !Number.isNaN(+v)) values.push(+v);
    }
  }

  if (values.length === 0) return undefined;

  values.sort((a, b) => a - b);
  const mid = values.length >> 1;
  return values.length & 1 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
}

/**
 * Returns the sum of the given iterable of numbers.
 * With an accessor, maps values first.
 */
export function sum<T = number>(
  data: Iterable<T>,
  accessor?: NumberAccessor<T>,
): number {
  let total = 0;
  const arr = Array.isArray(data) ? data : Array.from(data);

  if (accessor) {
    for (let i = 0; i < arr.length; i++) {
      const v = accessor(arr[i], i, arr);
      if (v != null && !Number.isNaN(+v)) total += +v;
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i] as unknown as number;
      if (v != null && !Number.isNaN(+v)) total += +v;
    }
  }

  return total;
}

/**
 * Returns an array of evenly-spaced numbers.
 * range(stop) or range(start, stop) or range(start, stop, step).
 */
export function range(start: number, stop?: number, step?: number): number[] {
  let s: number;
  let e: number;
  let st: number;

  if (stop === undefined) {
    s = 0;
    e = start;
    st = 1;
  } else {
    s = start;
    e = stop;
    st = step ?? 1;
  }

  if (st === 0) return [];
  const n = Math.max(0, Math.ceil((e - s) / st));
  const result: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = s + i * st;
  }
  return result;
}

/**
 * Returns [min, max] of the given iterable.
 * With an accessor, maps values first.
 */
export function extent<T>(
  data: Iterable<T>,
  accessor?: NumberAccessor<T>,
): [number, number] | [undefined, undefined] {
  let lo: number | undefined;
  let hi: number | undefined;
  const arr = Array.isArray(data) ? data : Array.from(data);

  if (accessor) {
    for (let i = 0; i < arr.length; i++) {
      const v = accessor(arr[i], i, arr);
      if (v != null && !Number.isNaN(+v)) {
        if (lo === undefined || +v < lo) lo = +v;
        if (hi === undefined || +v > hi) hi = +v;
      }
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i] as unknown as number;
      if (v != null && !Number.isNaN(+v)) {
        if (lo === undefined || +v < lo) lo = +v;
        if (hi === undefined || +v > hi) hi = +v;
      }
    }
  }

  return lo !== undefined && hi !== undefined
    ? [lo, hi]
    : [undefined, undefined];
}

/**
 * Returns the index of the element with the least value according to the accessor.
 * If data is empty, returns -1.
 */
export function leastIndex<T>(
  data: Iterable<T>,
  comparator?: (a: T, b: T) => number,
): number;
export function leastIndex<T>(
  data: Iterable<T>,
  accessor?: NumberAccessor<T>,
): number;
export function leastIndex<T>(
  data: Iterable<T>,
  comparatorOrAccessor?: ((a: T, b: T) => number) | NumberAccessor<T>,
): number {
  const arr = Array.isArray(data) ? data : Array.from(data);
  if (arr.length === 0) return -1;

  if (!comparatorOrAccessor) {
    let minIdx = -1;
    let minVal: number | undefined;
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i] as unknown as number;
      if (
        v != null &&
        !Number.isNaN(+v) &&
        (minVal === undefined || +v < minVal)
      ) {
        minVal = +v;
        minIdx = i;
      }
    }
    return minIdx;
  }

  // Detect if it's a comparator (2 args) or accessor (1-3 args)
  if (comparatorOrAccessor.length <= 1 || comparatorOrAccessor.length === 3) {
    // Accessor: (d, i, data) => number
    const accessor = comparatorOrAccessor as NumberAccessor<T>;
    let minIdx = -1;
    let minVal: number | undefined;
    for (let i = 0; i < arr.length; i++) {
      const v = accessor(arr[i], i, arr);
      if (
        v != null &&
        !Number.isNaN(+v) &&
        (minVal === undefined || +v < minVal)
      ) {
        minVal = +v;
        minIdx = i;
      }
    }
    return minIdx;
  }

  // Comparator: (a, b) => number
  const comparator = comparatorOrAccessor as (a: T, b: T) => number;
  let minIdx = 0;
  for (let i = 1; i < arr.length; i++) {
    if (comparator(arr[i], arr[minIdx]) < 0) {
      minIdx = i;
    }
  }
  return minIdx;
}
