/**
 * Random number generators.
 * Self-developed replacement for d3-random.
 */

/**
 * Creates a normal (Gaussian) distribution random number generator
 * using the Box-Muller transform.
 *
 * Supports `.source(rng)` to inject a custom random source.
 */
function createRandomNormal(
  source: () => number,
): (mu?: number, sigma?: number) => () => number {
  return (mu = 0, sigma = 1) => {
    let hasSpare = false;
    let spare = 0;

    return () => {
      if (hasSpare) {
        hasSpare = false;
        return mu + sigma * spare;
      }

      let u: number;
      let v: number;
      let s: number;
      do {
        u = source() * 2 - 1;
        v = source() * 2 - 1;
        s = u * u + v * v;
      } while (s >= 1 || s === 0);

      const mul = Math.sqrt((-2 * Math.log(s)) / s);
      spare = v * mul;
      hasSpare = true;
      return mu + sigma * u * mul;
    };
  };
}

type RandomNormalFn = {
  (mu?: number, sigma?: number): () => number;
  source: (rng: () => number) => (mu?: number, sigma?: number) => () => number;
};

/**
 * Returns a function that generates normally distributed random numbers.
 * Default: mean=0, deviation=1, using Math.random().
 *
 * Usage:
 *   randomNormal()()           // single sample, mean=0, sigma=1
 *   randomNormal(50, 10)()     // single sample, mean=50, sigma=10
 *   randomNormal.source(rng)(mu, sigma)()  // custom rng source
 */
export const randomNormal: RandomNormalFn = Object.assign(
  createRandomNormal(() => Math.random()),
  {
    source: (rng: () => number) => createRandomNormal(rng),
  },
);
