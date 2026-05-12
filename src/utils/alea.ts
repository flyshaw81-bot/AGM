/**
 * Alea PRNG — a seedable pseudo-random number generator.
 * Self-developed TypeScript implementation of the Alea algorithm by Johannes Baagøe.
 */

function Mash() {
  let n = 0xefc8249d;

  return (data: string) => {
    const str = data.toString();
    for (let i = 0; i < str.length; i++) {
      n += str.charCodeAt(i);
      let h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000;
    }
    return (n >>> 0) * 2.3283064365386963e-10;
  };
}

export type AleaPRNG = {
  (): number;
  next: () => number;
  uint32: () => number;
  fract53: () => number;
  exportState: () => [number, number, number, number];
  importState: (state: [number, number, number, number]) => void;
  version: string;
  args: unknown[];
};

export default function Alea(...args: unknown[]): AleaPRNG {
  let s0 = 0;
  let s1 = 0;
  let s2 = 0;
  let c = 1;

  const seeds = args.length === 0 ? [Date.now()] : args;
  const mash = Mash();
  s0 = mash(" ");
  s1 = mash(" ");
  s2 = mash(" ");

  for (let i = 0; i < seeds.length; i++) {
    s0 -= mash(String(seeds[i]));
    if (s0 < 0) s0 += 1;
    s1 -= mash(String(seeds[i]));
    if (s1 < 0) s1 += 1;
    s2 -= mash(String(seeds[i]));
    if (s2 < 0) s2 += 1;
  }

  const random: AleaPRNG = (() => {
    const t = 2091639 * s0 + c * 2.3283064365386963e-10;
    s0 = s1;
    s1 = s2;
    c = t | 0;
    s2 = t - c;
    return s2;
  }) as AleaPRNG;

  random.next = random;
  random.uint32 = () => random() * 0x100000000;
  random.fract53 = () =>
    random() + ((random() * 0x200000) | 0) * 1.1102230246251565e-16;
  random.version = "Alea 0.9";
  random.args = seeds;
  random.exportState = () => [s0, s1, s2, c];
  random.importState = (state: [number, number, number, number]) => {
    s0 = +state[0] || 0;
    s1 = +state[1] || 0;
    s2 = +state[2] || 0;
    c = +state[3] || 0;
  };

  return random;
}

Alea.importState = (state: [number, number, number, number]): AleaPRNG => {
  const random = Alea();
  random.importState(state);
  return random;
};
