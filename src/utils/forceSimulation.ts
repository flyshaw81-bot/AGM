/**
 * Self-developed lightweight force simulation library.
 * Replacement for d3-force (forceSimulation, forceCollide) and d3-timer (timeout).
 *
 * Only implements the subset used in AGM Studio (emblem collision avoidance).
 */

interface SimulationNode {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  index?: number;
}

type Force<T extends SimulationNode> = {
  initialize: (nodes: T[]) => void;
  apply: (alpha: number) => void;
};

/**
 * Minimal force simulation compatible with d3's forceSimulation API.
 */
export class ForceSimulation<T extends SimulationNode> {
  private _nodes: T[];
  private _alpha = 1;
  private _alphaMin = 0.001;
  private _alphaDecay = 0.0228;
  private _velocityDecay = 0.4;
  private _forces = new Map<string, Force<T>>();

  constructor(nodes: T[]) {
    this._nodes = nodes;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.index = i;
      n.vx = n.vx ?? 0;
      n.vy = n.vy ?? 0;
    }
  }

  alphaMin(): number;
  alphaMin(value: number): this;
  alphaMin(value?: number): this | number {
    if (value === undefined) return this._alphaMin;
    this._alphaMin = value;
    return this;
  }

  alphaDecay(): number;
  alphaDecay(value: number): this;
  alphaDecay(value?: number): this | number {
    if (value === undefined) return this._alphaDecay;
    this._alphaDecay = value;
    return this;
  }

  velocityDecay(value: number): this {
    this._velocityDecay = 1 - value;
    return this;
  }

  force(name: string, force: Force<T>): this {
    force.initialize(this._nodes);
    this._forces.set(name, force);
    return this;
  }

  stop(): this {
    // No auto-ticking in our implementation; this is a no-op
    return this;
  }

  tick(): this {
    this._alpha += (this._alphaMin - this._alpha) * this._alphaDecay;

    for (const force of this._forces.values()) {
      force.apply(this._alpha);
    }

    for (const node of this._nodes) {
      node.vx! *= this._velocityDecay;
      node.vy! *= this._velocityDecay;
      node.x += node.vx!;
      node.y += node.vy!;
    }

    return this;
  }
}

/**
 * Collision avoidance force compatible with d3's forceCollide API.
 * Uses simple pairwise iteration (sufficient for the ~600 node emblem use case).
 */
export function forceCollide<T extends SimulationNode>(): {
  radius: (accessor: (d: T) => number) => Force<T>;
} & Force<T> {
  let nodes: T[] = [];
  let radiusFn: (d: T) => number = () => 1;
  let radii: number[] = [];
  const strength = 1;
  const iterations = 1;

  const force: Force<T> & {
    radius: (accessor: (d: T) => number) => Force<T> & { radius: any };
  } = {
    initialize(n: T[]) {
      nodes = n;
      radii = nodes.map((d) => radiusFn(d));
    },
    apply(alpha: number) {
      for (let k = 0; k < iterations; k++) {
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            let dx = a.x - b.x;
            let dy = a.y - b.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = radii[i] + radii[j];

            if (dist < minDist) {
              if (dist === 0) {
                // Nodes at same position: nudge apart
                dx = 0.001;
                dy = 0.001;
                dist = Math.sqrt(dx * dx + dy * dy);
              }
              const overlap = ((minDist - dist) / dist) * strength * alpha;
              const moveX = dx * overlap * 0.5;
              const moveY = dy * overlap * 0.5;

              a.vx! += moveX;
              a.vy! += moveY;
              b.vx! -= moveX;
              b.vy! -= moveY;
            }
          }
        }
      }
    },
    radius(accessor: (d: T) => number) {
      radiusFn = accessor;
      return force;
    },
  };

  return force;
}

/**
 * Create a force simulation.
 * Compatible with d3's forceSimulation() API.
 */
export function forceSimulation<T extends SimulationNode>(
  nodes: T[],
): ForceSimulation<T> {
  return new ForceSimulation<T>(nodes);
}

/**
 * Schedule a callback to run asynchronously.
 * Replacement for d3-timer's timeout().
 */
export function timeout(callback: () => void): void {
  setTimeout(callback, 0);
}
