/**
 * Self-developed quadtree implementation.
 * Replacement for d3-quadtree.
 *
 * Supports point insertion, nearest-neighbor search with optional radius,
 * and visit traversal. Compatible with d3-quadtree's API surface as used
 * in AGM Studio.
 */

export interface QuadtreeNode<T> {
  data?: T;
  length?: number;
  next?: QuadtreeNode<T>;
  0?: QuadtreeNode<T>;
  1?: QuadtreeNode<T>;
  2?: QuadtreeNode<T>;
  3?: QuadtreeNode<T>;
}

type QuadtreeAccessor<T> = (d: T) => number;

function defaultX<T>(d: T): number {
  return (d as any)[0];
}

function defaultY<T>(d: T): number {
  return (d as any)[1];
}

export class Quadtree<T = [number, number]> {
  _x: QuadtreeAccessor<T>;
  _y: QuadtreeAccessor<T>;
  _x0 = NaN;
  _y0 = NaN;
  _x1 = NaN;
  _y1 = NaN;
  _root: QuadtreeNode<T> | undefined;
  private _size = 0;

  constructor(
    xAccessor?: QuadtreeAccessor<T>,
    yAccessor?: QuadtreeAccessor<T>,
  ) {
    this._x = xAccessor || defaultX;
    this._y = yAccessor || defaultY;
  }

  /**
   * Set the extent of the quadtree before adding points.
   * This prevents tree corruption from repeated _cover expansions.
   */
  extent(x0: number, y0: number, x1: number, y1: number): this {
    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;
    return this;
  }

  /**
   * Expand the quadtree extent to cover the point (x, y).
   */
  private _cover(x: number, y: number): void {
    if (Number.isNaN(this._x0)) {
      // First point — initialize extent to a unit square
      this._x0 = Math.floor(x);
      this._y0 = Math.floor(y);
      this._x1 = this._x0 + 1;
      this._y1 = this._y0 + 1;
    } else {
      // Expand by doubling extent until the point is covered
      let z = this._x1 - this._x0;
      // If extent is 0 (both sides equal), set to 1
      if (z === 0) z = 1;
      let node = this._root;
      let x0 = this._x0;
      let y0 = this._y0;
      let x1 = this._x1;
      let y1 = this._y1;

      while (x0 > x || x >= x1 || y0 > y || y >= y1) {
        const i = ((y < y0 ? 1 : 0) << 1) | (x < x0 ? 1 : 0);
        const parent: QuadtreeNode<T> = { length: 4 };
        switch (i) {
          case 0:
            parent[0] = node;
            x1 = x0 + z * 2;
            y1 = y0 + z * 2;
            break;
          case 1:
            parent[1] = node;
            x0 = x1 - z * 2;
            y1 = y0 + z * 2;
            break;
          case 2:
            parent[2] = node;
            x1 = x0 + z * 2;
            y0 = y1 - z * 2;
            break;
          case 3:
            parent[3] = node;
            x0 = x1 - z * 2;
            y0 = y1 - z * 2;
            break;
        }
        node = parent;
        z *= 2;
      }

      this._root = node;
      this._x0 = x0;
      this._y0 = y0;
      this._x1 = x1;
      this._y1 = y1;
    }
  }

  /**
   * Add a datum to the quadtree.
   */
  add(d: T): this {
    const x = +this._x.call(null, d);
    const y = +this._y.call(null, d);

    this._cover(x, y);
    this._addPoint(x, y, d);
    return this;
  }

  /**
   * Remove a datum from the quadtree.
   * Returns this quadtree.
   */
  remove(d: T): this {
    const x = +this._x.call(null, d);
    const y = +this._y.call(null, d);
    if (Number.isNaN(x) || Number.isNaN(y)) return this;

    let node = this._root;
    if (!node) return this;

    let x0 = this._x0;
    let y0 = this._y0;
    let x1 = this._x1;
    let y1 = this._y1;

    // Track the path to the leaf for potential cleanup
    const path: { node: QuadtreeNode<T>; quad: number }[] = [];

    // If root is a leaf
    if (node.data !== undefined && node.length === undefined) {
      // Check linked list at root
      if (node.data === d) {
        if (node.next) {
          this._root = node.next;
        } else {
          this._root = undefined;
        }
        this._size--;
        return this;
      }
      let prev = node;
      let curr = node.next;
      while (curr) {
        if (curr.data === d) {
          prev.next = curr.next;
          this._size--;
          return this;
        }
        prev = curr;
        curr = curr.next;
      }
      return this;
    }

    // Navigate to the leaf
    let depth = 0;
    const maxDepth = 12; // prevent deep nesting, chain points at this depth
    while (depth < maxDepth) {
      const xm = (x0 + x1) / 2;
      const ym = (y0 + y1) / 2;
      const quad = ((y >= ym ? 1 : 0) << 1) | (x >= xm ? 1 : 0);
      const child = (node as any)[quad] as QuadtreeNode<T> | undefined;
      if (!child) return this; // not found

      if (child.data !== undefined && child.length === undefined) {
        // Found the leaf — search linked list
        if (child.data === d) {
          if (child.next) {
            (node as any)[quad] = child.next;
          } else {
            (node as any)[quad] = undefined;
            // Clean up empty internal nodes
            for (let pi = path.length - 1; pi >= 0; pi--) {
              const entry = path[pi];
              const pNode = entry.node;
              // Check if this internal node is now empty
              let hasChildren = false;
              for (let q = 0; q < 4; q++) {
                if ((pNode as any)[q]) {
                  hasChildren = true;
                  break;
                }
              }
              if (!hasChildren) {
                // Find parent and remove this node
                if (pi > 0) {
                  (path[pi - 1].node as any)[path[pi - 1].quad] = undefined;
                } else {
                  this._root = undefined;
                }
              } else {
                break;
              }
            }
          }
          this._size--;
          return this;
        }
        // Search rest of linked list
        let prev = child;
        let curr = child.next;
        while (curr) {
          if (curr.data === d) {
            prev.next = curr.next;
            this._size--;
            return this;
          }
          prev = curr;
          curr = curr.next;
        }
        return this; // not found in chain
      }

      // Internal node — descend
      path.push({ node, quad });
      node = child;
      if (quad & 1) x0 = (x0 + x1) / 2;
      else x1 = (x0 + x1) / 2;
      if (quad & 2) y0 = (y0 + y1) / 2;
      else y1 = (y0 + y1) / 2;
      depth++;
    }

    return this;
  }

  private _addPoint(x: number, y: number, d: T): void {
    if (Number.isNaN(x) || Number.isNaN(y)) return;

    const leaf: QuadtreeNode<T> = { data: d };

    if (!this._root) {
      this._root = leaf;
      this._size++;
      return;
    }

    // If root is a leaf, need to handle it
    let node = this._root;
    let x0 = this._x0;
    let y0 = this._y0;
    let x1 = this._x1;
    let y1 = this._y1;

    // If the root itself is a leaf (has data property, no length)
    if (node.data !== undefined && !node.length) {
      const existingX = +this._x.call(null, node.data);
      const existingY = +this._y.call(null, node.data);

      // Coincident points — create a linked list
      if (x === existingX && y === existingY) {
        leaf.next = node;
        this._root = leaf;
        this._size++;
        return;
      }

      // Different points — split
      const oldLeaf = node;
      this._root = { length: 4 };
      node = this._root;
      let depth = 0;
      const maxDepth = 12; // prevent infinite nesting, chain points at this depth

      while (depth < maxDepth) {
        const xm = (x0 + x1) / 2;
        const ym = (y0 + y1) / 2;
        const iNew = ((y >= ym ? 1 : 0) << 1) | (x >= xm ? 1 : 0);
        const iOld =
          ((existingY >= ym ? 1 : 0) << 1) | (existingX >= xm ? 1 : 0);

        if (iNew !== iOld) {
          (node as any)[iOld] = oldLeaf;
          (node as any)[iNew] = leaf;
          this._size++;
          return;
        }

        const child: QuadtreeNode<T> = { length: 4 };
        (node as any)[iNew] = child;
        node = child;

        if (iNew & 1) x0 = xm;
        else x1 = xm;
        if (iNew & 2) y0 = ym;
        else y1 = ym;
        depth++;
      }

      // Coincident — chain
      leaf.next = oldLeaf;
      (node as any)[0] = leaf;
      this._size++;
      return;
    }

    // Navigate the tree to find the right leaf position
    let depth = 0;
    const maxDepth = 12; // prevent deep nesting, chain points at this depth

    while (depth < maxDepth) {
      const xm = (x0 + x1) / 2;
      const ym = (y0 + y1) / 2;
      const quad = ((y >= ym ? 1 : 0) << 1) | (x >= xm ? 1 : 0);

      const child = (node as any)[quad] as QuadtreeNode<T> | undefined;

      if (!child) {
        // Empty slot — insert here
        (node as any)[quad] = leaf;
        this._size++;
        return;
      }

      if (child.data !== undefined && child.length === undefined) {
        // Found an existing leaf — need to split or chain
        const existingX = +this._x.call(null, child.data);
        const existingY = +this._y.call(null, child.data);

        if (x === existingX && y === existingY) {
          // Coincident — chain
          leaf.next = child;
          (node as any)[quad] = leaf;
          this._size++;
          return;
        }

        // Split
        const branch: QuadtreeNode<T> = { length: 4 };
        (node as any)[quad] = branch;

        let sx0 = quad & 1 ? xm : x0;
        let sy0 = quad & 2 ? ym : y0;
        let sx1 = quad & 1 ? x1 : xm;
        let sy1 = quad & 2 ? y1 : ym;

        let splitDepth = 0;
        let splitNode = branch;

        while (splitDepth < maxDepth) {
          const sxm = (sx0 + sx1) / 2;
          const sym = (sy0 + sy1) / 2;
          const iNew = ((y >= sym ? 1 : 0) << 1) | (x >= sxm ? 1 : 0);
          const iOld =
            ((existingY >= sym ? 1 : 0) << 1) | (existingX >= sxm ? 1 : 0);

          if (iNew !== iOld) {
            (splitNode as any)[iOld] = child;
            (splitNode as any)[iNew] = leaf;
            this._size++;
            return;
          }

          const nextBranch: QuadtreeNode<T> = { length: 4 };
          (splitNode as any)[iNew] = nextBranch;
          splitNode = nextBranch;

          if (iNew & 1) sx0 = sxm;
          else sx1 = sxm;
          if (iNew & 2) sy0 = sym;
          else sy1 = sym;
          splitDepth++;
        }

        // Truly coincident after max depth — chain
        leaf.next = child;
        (splitNode as any)[0] = leaf;
        this._size++;
        return;
      }

      // It's an internal node — descend
      node = child;

      if (quad & 1) x0 = (x0 + x1) / 2;
      else x1 = (x0 + x1) / 2;
      if (quad & 2) y0 = (y0 + y1) / 2;
      else y1 = (y0 + y1) / 2;
      depth++;
    }

    this._size++;
  }

  /**
   * Find the closest datum to (x, y), optionally within radius.
   * Returns the datum, or undefined if none found.
   */
  find(x: number, y: number, radius?: number): T | undefined {
    let closestData: T | undefined;
    let closestDist =
      radius !== undefined ? radius * radius : Number.POSITIVE_INFINITY;

    const node = this._root;
    if (!node) return undefined;

    // Handle leaf-only root
    if (node.data !== undefined && node.length === undefined) {
      let leaf: QuadtreeNode<T> | undefined = node;
      while (leaf) {
        const dx = x - +this._x.call(null, leaf.data!);
        const dy = y - +this._y.call(null, leaf.data!);
        const d2 = dx * dx + dy * dy;
        if (d2 < closestDist) {
          closestDist = d2;
          closestData = leaf.data;
        }
        leaf = leaf.next;
      }
      return closestData;
    }

    interface SearchFrame {
      node: QuadtreeNode<T>;
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    }

    const stack: SearchFrame[] = [
      { node, x0: this._x0, y0: this._y0, x1: this._x1, y1: this._y1 },
    ];

    while (stack.length > 0) {
      const frame = stack.pop()!;
      const { node: n, x0, y0, x1, y1 } = frame;

      // Check if this quadrant could contain a closer point
      const dx0 = x - x1;
      const dy0 = y - y1;
      const dx1 = x - x0;
      const dy1 = y - y0;
      // Squared distance from point to nearest corner of this quadrant
      const dxMin = dx0 > 0 ? dx0 * dx0 : dx1 < 0 ? dx1 * dx1 : 0;
      const dyMin = dy0 > 0 ? dy0 * dy0 : dy1 < 0 ? dy1 * dy1 : 0;
      if (dxMin + dyMin >= closestDist) continue;

      const xm = (x0 + x1) / 2;
      const ym = (y0 + y1) / 2;

      for (let q = 3; q >= 0; q--) {
        const child = (n as any)[q] as QuadtreeNode<T> | undefined;
        if (!child) continue;

        const cx0 = q & 1 ? xm : x0;
        const cy0 = q & 2 ? ym : y0;
        const cx1 = q & 1 ? x1 : xm;
        const cy1 = q & 2 ? y1 : ym;

        if (child.data !== undefined && child.length === undefined) {
          // Leaf — check distance
          let leaf: QuadtreeNode<T> | undefined = child;
          while (leaf) {
            const dx = x - +this._x.call(null, leaf.data!);
            const dy = y - +this._y.call(null, leaf.data!);
            const d2 = dx * dx + dy * dy;
            if (d2 < closestDist) {
              closestDist = d2;
              closestData = leaf.data;
            }
            leaf = leaf.next;
          }
        } else {
          // Internal node — push to stack
          stack.push({ node: child, x0: cx0, y0: cy0, x1: cx1, y1: cy1 });
        }
      }
    }

    return closestData;
  }

  /**
   * Visit each node in the quadtree.
   * callback(node, x0, y0, x1, y1) — return true to skip children.
   */
  visit(
    callback: (
      node: QuadtreeNode<T>,
      x0: number,
      y0: number,
      x1: number,
      y1: number,
    ) => boolean | undefined,
  ): this {
    if (!this._root) return this;

    interface VisitFrame {
      node: QuadtreeNode<T>;
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    }

    const stack: VisitFrame[] = [
      {
        node: this._root,
        x0: this._x0,
        y0: this._y0,
        x1: this._x1,
        y1: this._y1,
      },
    ];

    while (stack.length > 0) {
      const frame = stack.pop()!;
      const { node, x0, y0, x1, y1 } = frame;

      if (callback(node, x0, y0, x1, y1)) continue;

      const xm = (x0 + x1) / 2;
      const ym = (y0 + y1) / 2;

      // Push children in reverse order so 0 is processed first
      for (let q = 3; q >= 0; q--) {
        const child = (node as any)[q] as QuadtreeNode<T> | undefined;
        if (child) {
          const cx0 = q & 1 ? x0 : xm;
          const cy0 = q & 2 ? y0 : ym;
          const cx1 = q & 1 ? xm : x1;
          const cy1 = q & 2 ? ym : y1;
          stack.push({ node: child, x0: cx0, y0: cy0, x1: cx1, y1: cy1 });
        }
      }
    }

    return this;
  }

  /**
   * Return all data in the quadtree.
   */
  data(): T[] {
    const result: T[] = [];
    this.visit((node) => {
      if (node.data !== undefined && node.length === undefined) {
        let leaf: QuadtreeNode<T> | undefined = node;
        while (leaf) {
          if (leaf.data !== undefined) result.push(leaf.data);
          leaf = leaf.next;
        }
        return true; // skip (leaf has no children)
      }
      return false;
    });
    return result;
  }

  /**
   * Return the number of data in the quadtree.
   */
  size(): number {
    return this._size;
  }
}

/**
 * Create a quadtree, optionally from an array of data.
 * Matches d3-quadtree API:
 *   quadtree() — empty quadtree
 *   quadtree(data) — quadtree from array with default accessors
 *   quadtree(data, x, y) — quadtree from array with custom accessors
 */
export function quadtree<T = [number, number]>(
  data?: T[],
  x?: QuadtreeAccessor<T>,
  y?: QuadtreeAccessor<T>,
): Quadtree<T> {
  const xAcc = x || defaultX;
  const yAcc = y || defaultY;
  const qt = new Quadtree<T>(x, y);
  if (data && data.length > 0) {
    // Pre-compute extent from all data to avoid _cover expansion corruption
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const d of data) {
      const dx = +xAcc(d);
      const dy = +yAcc(d);
      if (dx < x0) x0 = dx;
      if (dy < y0) y0 = dy;
      if (dx > x1) x1 = dx;
      if (dy > y1) y1 = dy;
    }
    // Pad extent by 1 to include boundary points
    const padding = 1;
    qt.extent(
      Math.floor(x0) - padding,
      Math.floor(y0) - padding,
      Math.ceil(x1) + padding,
      Math.ceil(y1) + padding,
    );
    for (const d of data) {
      qt.add(d);
    }
  }
  return qt;
}
